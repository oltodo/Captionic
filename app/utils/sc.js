import { css } from 'styled-components';
import _ from 'lodash';

const check = (validation, props) => {
  if (typeof validation === 'string') {
    return props[validation];
  }
  if (typeof validation === 'function') {
    return validation(props);
  }
  if (typeof validation === 'object') {
    return Object.keys(validation).every(key => props[key] === validation[key]);
  }

  throw new Error('unsupported condition type');
};

export const condition = validation => ({
  css: (strings, ...interpolations) => props => {
    if (!check(validation, props)) {
      return '';
    }

    return css(
      strings,
      ...interpolations.map(interpolation =>
        typeof interpolation === 'function'
          ? interpolation(props)
          : interpolation
      )
    );
  }
});

export const get = (key, defaultValue = null) => props =>
  _.get(props, key, defaultValue);
