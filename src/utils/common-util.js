import R from 'ramda';

const PREFIX = 'RL';

const mapToKeyValue = (obj, key) => {
  obj[key] = PREFIX + '_' + key;
  return obj
};

const canUseDOM = R.once(() => (
  typeof window !== 'undefined'
    && window.document
    && window.document.createElement
));

export default {

  canUseDOM,

  deferOnClient: (func, ...args) => {
    if (canUseDOM()) {
      setTimeout(R.partial(func, args), 1);
    }
  },

  // map an array of strings to
  // object keys and prefixed values.
  createObjOfConsts: R.reduce(
    mapToKeyValue, {}
  )
};
