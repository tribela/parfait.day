import React from 'react';
import ComposeFormContainer from './containers/compose_form_container';
import NavigationContainer from './containers/navigation_container';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { mountCompose, unmountCompose, cycleElefriendCompose } from 'flavours/glitch/actions/compose';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames';
import SearchContainer from './containers/search_container';
import Motion from '../ui/util/optional_motion';
import spring from 'react-motion/lib/spring';
import SearchResultsContainer from './containers/search_results_container';
import { mascot } from 'flavours/glitch/initial_state';
import HeaderContainer from './containers/header_container';
import { changeLocalSetting } from 'flavours/glitch/actions/local_settings';
import { showAlert } from 'flavours/glitch/actions/alerts';
import Column from 'flavours/glitch/components/column';
import { Helmet } from 'react-helmet';

const messages = defineMessages({
  compose: { id: 'navigation_bar.compose', defaultMessage: 'Compose new post' },
});

const mapStateToProps = (state, ownProps) => ({
  elefriend: state.getIn(['compose', 'elefriend']),
  showSearch: ownProps.multiColumn ? state.getIn(['search', 'submitted']) && !state.getIn(['search', 'hidden']) : false,
});

const touchMascotHandler = (() => {
  let mascotTouchTimestamps = [];
  let unlocked = false;
  const handler = (dispatch) => {
    const timestamp = +new Date();
    mascotTouchTimestamps.push(timestamp);
    mascotTouchTimestamps = mascotTouchTimestamps.slice(-10);
    if (mascotTouchTimestamps.length === 10 && timestamp - mascotTouchTimestamps[0] <= 5000)  {
      if (!unlocked) {
        dispatch(changeLocalSetting(['unlock_hidden_feature'], true));
        dispatch(showAlert('Qdon', 'Unlocked hidden feature!'));
        unlocked = true;
      } else {
        dispatch(showAlert('Qdon', 'You Already have unlocked hidden feature!'));
      }
      mascotTouchTimestamps = [];
    }
  };

  return handler;
})();

const mapDispatchToProps = (dispatch) => ({
  onClickElefriend () {
    dispatch(cycleElefriendCompose());
  },

  onTouchMascot () {
    dispatch(touchMascotHandler);
  },

  onMount () {
    dispatch(mountCompose());
  },

  onUnmount () {
    dispatch(unmountCompose());
  },
});

class Compose extends React.PureComponent {

  static propTypes = {
    multiColumn: PropTypes.bool,
    showSearch: PropTypes.bool,
    elefriend: PropTypes.number,
    onClickElefriend: PropTypes.func,
    onTouchMascot: PropTypes.func,
    onMount: PropTypes.func,
    onUnmount: PropTypes.func,
    intl: PropTypes.object.isRequired,
  };

  componentDidMount () {
    this.props.onMount();
  }

  componentWillUnmount () {
    this.props.onUnmount();
  }

  render () {
    const {
      elefriend,
      intl,
      multiColumn,
      onClickElefriend,
      onTouchMascot,
      showSearch,
    } = this.props;
    const computedClass = classNames('drawer', `mbstobon-${elefriend}`);

    if (multiColumn) {
      return (
        <div className={computedClass} role='region' aria-label={intl.formatMessage(messages.compose)}>
          <HeaderContainer />

          {multiColumn && <SearchContainer />}

          <div className='drawer__pager'>
            <div className='drawer__inner'>
              <NavigationContainer />

              <ComposeFormContainer />

              <div className='drawer__inner__mastodon'>
                {mascot ? <img alt='' draggable='false' src={mascot} onTouchStart={onTouchMascot} /> : <button className='mastodon' onClick={onClickElefriend} onTouchStart={onTouchMascot} />}
              </div>
            </div>

            <Motion defaultStyle={{ x: -100 }} style={{ x: spring(showSearch ? 0 : -100, { stiffness: 210, damping: 20 }) }}>
              {({ x }) => (
                <div className='drawer__inner darker' style={{ transform: `translateX(${x}%)`, visibility: x === -100 ? 'hidden' : 'visible' }}>
                  <SearchResultsContainer />
                </div>
              )}
            </Motion>
          </div>
        </div>
      );
    }

    return (
      <Column>
        <NavigationContainer />
        <ComposeFormContainer />

        <Helmet>
          <meta name='robots' content='noindex' />
        </Helmet>
      </Column>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Compose));
