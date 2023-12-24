import { connect } from 'react-redux';

import { showAlert } from 'flavours/glitch/actions/alerts';
import { changeLocalSetting } from 'flavours/glitch/actions/local_settings';
import { openModal } from 'flavours/glitch/actions/modal';

import ColumnsArea from '../components/columns_area';

const mapStateToProps = state => ({
  columns: state.getIn(['settings', 'columns']),
});

const touchAboutHandler = (() => {
  let aboutTouchTimestamps = [];
  let unlocked = false;
  const handler = (dispatch) => {
    const timestamp = +new Date();
    aboutTouchTimestamps.push(timestamp);
    aboutTouchTimestamps = aboutTouchTimestamps.slice(-10);
    if (aboutTouchTimestamps.length === 10 && timestamp - aboutTouchTimestamps[0] <= 5000)  {
      if (!unlocked) {
        dispatch(changeLocalSetting(['unlock_hidden_feature'], true));
        dispatch(showAlert({title: 'Qdon', message: 'Unlocked hidden feature!'}));
        unlocked = true;
      } else {
        dispatch(showAlert({title: 'Qdon', message: 'You Already have unlocked hidden feature!'}));
      }
      aboutTouchTimestamps = [];
    }
  };

  return handler;
})();

const mapDispatchToProps = dispatch => ({
  openSettings (e) {
    e.preventDefault();
    e.stopPropagation();
    dispatch(openModal({
      modalType: 'SETTINGS',
      modalProps: {},
    }));
  },
  onTouchAbout () {
    dispatch(touchAboutHandler);
  },
});

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(ColumnsArea);
