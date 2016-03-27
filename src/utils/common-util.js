import R from 'ramda';

const PREFIX = 'RL';

const mapToKeyValue = (obj, key) => {
  obj[key] = PREFIX + '_' + key;
  return obj
};

export default {

  canUseDOM: R.once(() => (
    typeof window !== 'undefined'
      && window.document
      && window.document.createElement
  )),

  defer: (func, ...args) => {
    setTimeout(R.partial(func, args), 1);
  },

  // map an array of strings to
  // object keys and prefixed values.
  createObjOfConsts: R.reduce(
    mapToKeyValue, {}
  )
};
