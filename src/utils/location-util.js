import { dissoc, equals } from 'ramda'

export const cloneLocation = (location) => {
  const { pathname, search, state } = location || {}
  return {
    pathname,
    search: search || '',
    state: dissoc('skipAction', state) || {},
  }
}

export const isLocationEqual = (a, b) => (
  equals(
    cloneLocation(a),
    cloneLocation(b)
  )
)
