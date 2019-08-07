import {
  once,
  reduce,
} from 'ramda'

const PREFIX = 'BDUXRL'

const mapToKeyValue = (obj, key) => {
  obj[key] = PREFIX + '_' + key
  return obj
}

export const canUseDOM = () => (
  typeof window !== 'undefined'
    && window.document
    && window.document.createElement
)

const canUseDOMOnce = once(
  canUseDOM
)

export const deferOnClient = (pred) => (func, ...args) => {
  if (pred()) {
    setTimeout(() => func(...args), 1)
  }
}

export default {

  canUseDOM: canUseDOMOnce,

  deferOnClient: deferOnClient(canUseDOMOnce),

  // map an array of strings to
  // object keys and prefixed values.
  createObjOfConsts: (values) => reduce(
    mapToKeyValue, {}, values
  )
}
