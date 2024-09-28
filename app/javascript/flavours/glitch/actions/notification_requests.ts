import {
  apiFetchNotificationRequest,
  apiFetchNotificationRequests,
  apiFetchNotifications,
  apiAcceptNotificationRequest,
  apiDismissNotificationRequest,
  apiAcceptNotificationRequests,
  apiDismissNotificationRequests,
} from 'flavours/glitch/api/notifications';
import type { ApiAccountJSON } from 'flavours/glitch/api_types/accounts';
import type {
  ApiNotificationGroupJSON,
  ApiNotificationJSON,
} from 'flavours/glitch/api_types/notifications';
import type { ApiStatusJSON } from 'flavours/glitch/api_types/statuses';
import type { AppDispatch, RootState } from 'flavours/glitch/store';
import { createDataLoadingThunk } from 'flavours/glitch/store/typed_functions';

import { importFetchedAccounts, importFetchedStatuses } from './importer';
import { decreasePendingNotificationsCount } from './notification_policies';

// TODO: refactor with notification_groups
function dispatchAssociatedRecords(
  dispatch: AppDispatch,
  notifications: ApiNotificationGroupJSON[] | ApiNotificationJSON[],
) {
  const fetchedAccounts: ApiAccountJSON[] = [];
  const fetchedStatuses: ApiStatusJSON[] = [];

  notifications.forEach((notification) => {
    if (notification.type === 'admin.report') {
      fetchedAccounts.push(notification.report.target_account);
    }

    if (notification.type === 'moderation_warning') {
      fetchedAccounts.push(notification.moderation_warning.target_account);
    }

    if ('status' in notification && notification.status) {
      fetchedStatuses.push(notification.status);
    }
  });

  if (fetchedAccounts.length > 0)
    dispatch(importFetchedAccounts(fetchedAccounts));

  if (fetchedStatuses.length > 0)
    dispatch(importFetchedStatuses(fetchedStatuses));
}

export const fetchNotificationRequests = createDataLoadingThunk(
  'notificationRequests/fetch',
  async (_params, { getState }) => {
    let sinceId = undefined;

    if (getState().notificationRequests.items.length > 0) {
      sinceId = getState().notificationRequests.items[0]?.id;
    }

    return apiFetchNotificationRequests({
      since_id: sinceId,
    });
  },
  ({ requests, links }, { dispatch }) => {
    const next = links.refs.find((link) => link.rel === 'next');

    dispatch(importFetchedAccounts(requests.map((request) => request.account)));

    return { requests, next: next?.uri };
  },
  {
    condition: (_params, { getState }) =>
      !getState().notificationRequests.isLoading,
  },
);

export const fetchNotificationRequest = createDataLoadingThunk(
  'notificationRequest/fetch',
  async ({ id }: { id: string }) => apiFetchNotificationRequest(id),
  {
    condition: ({ id }, { getState }) =>
      !(
        getState().notificationRequests.current.item?.id === id ||
        getState().notificationRequests.current.isLoading
      ),
  },
);

export const expandNotificationRequests = createDataLoadingThunk(
  'notificationRequests/expand',
  async (_, { getState }) => {
    const nextUrl = getState().notificationRequests.next;
    if (!nextUrl) throw new Error('missing URL');

    return apiFetchNotificationRequests(undefined, nextUrl);
  },
  ({ requests, links }, { dispatch }) => {
    const next = links.refs.find((link) => link.rel === 'next');

    dispatch(importFetchedAccounts(requests.map((request) => request.account)));

    return { requests, next: next?.uri };
  },
  {
    condition: (_, { getState }) =>
      !!getState().notificationRequests.next &&
      !getState().notificationRequests.isLoading,
  },
);

export const fetchNotificationsForRequest = createDataLoadingThunk(
  'notificationRequest/fetchNotifications',
  async ({ accountId }: { accountId: string }, { getState }) => {
    const sinceId =
      // @ts-expect-error current.notifications.items is not yet typed
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      getState().notificationRequests.current.notifications.items[0]?.get(
        'id',
      ) as string | undefined;

    return apiFetchNotifications({
      since_id: sinceId,
      account_id: accountId,
    });
  },
  ({ notifications, links }, { dispatch }) => {
    const next = links.refs.find((link) => link.rel === 'next');

    dispatchAssociatedRecords(dispatch, notifications);

    return { notifications, next: next?.uri };
  },
  {
    condition: ({ accountId }, { getState }) => {
      const current = getState().notificationRequests.current;
      return !(
        current.item?.account_id === accountId &&
        current.notifications.isLoading
      );
    },
  },
);

export const expandNotificationsForRequest = createDataLoadingThunk(
  'notificationRequest/expandNotifications',
  async (_, { getState }) => {
    const nextUrl = getState().notificationRequests.current.notifications.next;
    if (!nextUrl) throw new Error('missing URL');

    return apiFetchNotifications(undefined, nextUrl);
  },
  ({ notifications, links }, { dispatch }) => {
    const next = links.refs.find((link) => link.rel === 'next');

    dispatchAssociatedRecords(dispatch, notifications);

    return { notifications, next: next?.uri };
  },
  {
    condition: ({ accountId }: { accountId: string }, { getState }) => {
      const url = getState().notificationRequests.current.notifications.next;

      return (
        !!url &&
        !getState().notificationRequests.current.notifications.isLoading &&
        getState().notificationRequests.current.item?.account_id === accountId
      );
    },
  },
);

const selectNotificationCountForRequest = (state: RootState, id: string) => {
  const requests = state.notificationRequests.items;
  const thisRequest = requests.find((request) => request.id === id);
  return thisRequest ? thisRequest.notifications_count : 0;
};

export const acceptNotificationRequest = createDataLoadingThunk(
  'notificationRequest/accept',
  ({ id }: { id: string }) => apiAcceptNotificationRequest(id),
  (_data, { dispatch, getState, discardLoadData, actionArg: { id } }) => {
    const count = selectNotificationCountForRequest(getState(), id);

    dispatch(decreasePendingNotificationsCount(count));

    // The payload is not used in any functions
    return discardLoadData;
  },
);

export const dismissNotificationRequest = createDataLoadingThunk(
  'notificationRequest/dismiss',
  ({ id }: { id: string }) => apiDismissNotificationRequest(id),
  (_data, { dispatch, getState, discardLoadData, actionArg: { id } }) => {
    const count = selectNotificationCountForRequest(getState(), id);

    dispatch(decreasePendingNotificationsCount(count));

    // The payload is not used in any functions
    return discardLoadData;
  },
);

export const acceptNotificationRequests = createDataLoadingThunk(
  'notificationRequests/acceptBulk',
  ({ ids }: { ids: string[] }) => apiAcceptNotificationRequests(ids),
  (_data, { dispatch, getState, discardLoadData, actionArg: { ids } }) => {
    const count = ids.reduce(
      (count, id) => count + selectNotificationCountForRequest(getState(), id),
      0,
    );

    dispatch(decreasePendingNotificationsCount(count));

    // The payload is not used in any functions
    return discardLoadData;
  },
);

export const dismissNotificationRequests = createDataLoadingThunk(
  'notificationRequests/dismissBulk',
  ({ ids }: { ids: string[] }) => apiDismissNotificationRequests(ids),
  (_data, { dispatch, getState, discardLoadData, actionArg: { ids } }) => {
    const count = ids.reduce(
      (count, id) => count + selectNotificationCountForRequest(getState(), id),
      0,
    );

    dispatch(decreasePendingNotificationsCount(count));

    // The payload is not used in any functions
    return discardLoadData;
  },
);
