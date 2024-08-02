import Immutable from 'immutable';

import {
  DOMAIN_MUTES_INIT_MODAL,
} from '../actions/domain_mutes';

const initialState = Immutable.Map({
  new: Immutable.Map({
    domain: null,
    hide_from_home: false,
  }),
});

export default function domian_mutes(state = initialState, action) {
  switch (action.type) {
  case DOMAIN_MUTES_INIT_MODAL:
    return state.withMutations((state) => {
      state.setIn(['new', 'domain'], action.domain);
      state.setIn(['new', 'hide_from_home'], false);
    });
  default:
    return state;
  }
}
