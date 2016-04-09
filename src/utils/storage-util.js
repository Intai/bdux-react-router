import R from 'ramda';
import Common from './common-util';

const whenCanUseDOM = R.flip(R.wrap)((func, ...args) => (
  Common.canUseDOM()
    && func.apply(func, args)
));

export default {

  remove: whenCanUseDOM((name) => (
    window.sessionStorage
      .removeItem(name)
  ))
};
