import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';

export default class PillBarButton extends PureComponent {

  static propTypes = {
    prefix: PropTypes.string,
    settings: ImmutablePropTypes.map.isRequired,
    settingPath: PropTypes.array.isRequired,
    label: PropTypes.node.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  };

  onChange = () => {
    const { settings, settingPath } = this.props;
    this.props.onChange(settingPath, !settings.getIn(settingPath));
  };

  render () {
    const { prefix, settings, settingPath, label, disabled } = this.props;
    const id = ['setting-pillbar-button', prefix, ...settingPath].filter(Boolean).join('-');
    const active = settings.getIn(settingPath);

    return (
      <button
        key={id}
        id={id}
        className={classNames('pillbar-button', { active })}
        disabled={disabled}
        onClick={this.onChange}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  }

}
