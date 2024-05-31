import { Map as ImmutableMap, OrderedMap as ImmutableOrderedMap, OrderedSet as ImmutableOrderedSet } from 'immutable';

import {
  DOMAIN_BLOCKS_FETCH_SUCCESS,
  DOMAIN_BLOCKS_EXPAND_SUCCESS,
  unblockDomainSuccess
} from '../actions/domain_blocks';
import {
  DOMAIN_MUTES_FETCH_SUCCESS,
  DOMAIN_MUTES_EXPAND_SUCCESS,
  unmuteDomainSuccess,
  DOMAIN_MUTE_HOME_TIMELINE_SUCCESS,
} from '../actions/domain_mutes';

const initialState = ImmutableMap({
  blocks: ImmutableMap({
    items: ImmutableOrderedSet(),
  }),
  mutes: ImmutableMap({
    items: ImmutableOrderedMap(),
  }),
});

function mapDomains(domains) {
  return ImmutableOrderedMap(domains.map(domain => [domain.domain, domain]));
}

function expandDomains(map, domains) {
  return ImmutableOrderedMap({ ...map, ...mapDomains(domains) });
}

export default function domainLists(state = initialState, action) {
  switch(action.type) {
  case DOMAIN_BLOCKS_FETCH_SUCCESS:
    return state.setIn(['blocks', 'items'], ImmutableOrderedSet(action.domains)).setIn(['blocks', 'next'], action.next);
  case DOMAIN_BLOCKS_EXPAND_SUCCESS:
    return state.updateIn(['blocks', 'items'], set => set.union(action.domains)).setIn(['blocks', 'next'], action.next);
  case unblockDomainSuccess.type:
    return state.updateIn(['blocks', 'items'], set => set.delete(action.payload.domain));
  case DOMAIN_MUTES_FETCH_SUCCESS:
    return state.setIn(['mutes', 'items'], mapDomains(action.domains)).setIn(['mutes', 'next'], action.next);
  case DOMAIN_MUTES_EXPAND_SUCCESS:
    return state.updateIn(['mutes', 'items'], map => expandDomains(map, action.domains)).setIn(['mutes', 'next'], action.next);
  case unmuteDomainSuccess.type:
    return state.updateIn(['mutes', 'items'], map => map.delete(action.payload.domain));
  case DOMAIN_MUTE_HOME_TIMELINE_SUCCESS:
    return state.updateIn(['mutes', 'items', action.domain, 'hide_from_home'], () => action.homeTimeline);
  default:
    return state;
  }
}
