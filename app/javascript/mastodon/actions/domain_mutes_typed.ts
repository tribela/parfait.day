import { createAction } from '@reduxjs/toolkit';

import type { Account } from 'mastodon/models/account';

export const muteDomainSuccess = createAction<{
  domain: string;
  accounts: Account[];
  excludeHomeTl: boolean;
}>('domain_mutes/muteSuccess');

export const unmuteDomainSuccess = createAction<{
  domain: string;
  accounts: Account[];
  excludeHomeTl: boolean;
}>('domain_mutes/unmuteSuccess');
