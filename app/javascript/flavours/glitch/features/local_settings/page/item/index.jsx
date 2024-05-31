//  Package imports
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import ImmutablePropTypes from 'react-immutable-proptypes';
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

export default class LocalSettingsPageItem extends PureComponent {

  static propTypes = {
    children: PropTypes.node.isRequired,
    dependsOn: PropTypes.array,
    dependsOnNot: PropTypes.array,
    id: PropTypes.string.isRequired,
    item: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    inputProps: PropTypes.object,
    options: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      hint: PropTypes.string,
    })),
    settings: ImmutablePropTypes.map.isRequired,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    showWhen: PropTypes.bool,
  };

  handleChange = e => {
    const { target } = e;
    const { item, onChange, options, placeholder } = this.props;
    if (options && options.length > 0) onChange(item, target.value);
    else if (placeholder) onChange(item, target.value);
    else onChange(item, target.checked);
  };

  render () {
    const { handleChange } = this;
    const { settings, item, id, inputProps, options, children, dependsOn, dependsOnNot, placeholder, disabled } = this.props;
    const { showWhen } = this.props;
    let enabled = !disabled;

    if (showWhen === false) {
      return (null);
    }

    if (dependsOn) {
      for (let i = 0; i < dependsOn.length; i++) {
        enabled = enabled && settings.getIn(dependsOn[i]);
      }
    }
    if (dependsOnNot) {
      for (let i = 0; i < dependsOnNot.length; i++) {
        enabled = enabled && !settings.getIn(dependsOnNot[i]);
      }
    }

    if (options && options.length > 0) {
      const currentValue = settings.getIn(item);
      const optionElems = options && options.length > 0 && options.map((opt) => {
        let optionId = `${id}--${opt.value}`;
        return (
          <label key={optionId} htmlFor={optionId}>
            <input
              type='radio'
              name={id}
              id={optionId}
              value={opt.value}
              onBlur={handleChange}
              onChange={handleChange}
              checked={currentValue === opt.value}
              disabled={!enabled}
              {...inputProps}
            />
            {opt.message}
            {opt.hint && <span className='hint'>{opt.hint}</span>}
          </label>
        );
      });
      return (
        <div className='glitch local-settings__page__item radio_buttons'>
          <fieldset>
            <legend>{children}</legend>
            {optionElems}
          </fieldset>
        </div>
      );
    } else if (placeholder) {
      return (
        <div className='glitch local-settings__page__item string'>
          <label htmlFor={id}>
            <p>{children}</p>
            <p>
              <input
                id={id}
                type='text'
                value={settings.getIn(item)}
                placeholder={placeholder}
                onChange={handleChange}
                disabled={!enabled}
                {...inputProps}
              />
            </p>
          </label>
        </div>
      );
    } else return (
      <div className='glitch local-settings__page__item boolean'>
        <label htmlFor={id}>
          <input
            id={id}
            type='checkbox'
            checked={settings.getIn(item)}
            onChange={handleChange}
            disabled={!enabled}
            {...inputProps}
          />
          {children}
        </label>
      </div>
    );
  }

}
