import R from 'ramda'
import Bacon from 'baconjs'
import Common from '../utils/common-util'
import Storage from '../utils/storage-util'
import ActionTypes from './action-types'
import { createHistory, createMemoryHistory } from 'history'
import { bindToDispatch } from 'bdux'

export const createPlatformHistory = R.ifElse(
  () => Common.canUseDOM(),
  createHistory,
  createMemoryHistory
)

export const getHistory = (() => {
  let history
  return () => (
    history || (history = createPlatformHistory())
  )
})()

export const currentLocationProp = (() => {
  let prev = {}
  return {
    getLocation: () => prev,
    setLocation: (location) => (
      prev = location
    )
  }
})()

const defaultKeyValue = (key, value) => R.over(
  R.lensProp(key),
  R.defaultTo(value)
)

const cloneLocation = R.pipe(
  R.pick(['pathname', 'search', 'state']),
  defaultKeyValue('search', ''),
  defaultKeyValue('state', undefined)
)

const isEqual = R.useWith(
  R.equals, [
    cloneLocation,
    cloneLocation
  ]
)

const isCurrentLocation = R.converge(
  isEqual, [
    R.identity,
    currentLocationProp.getLocation
  ]
)

const createLocation = (location) => (
  getHistory().createLocation(location)
)

const mapLocation = R.ifElse(
  R.is(String),
  createLocation,
  R.identity
)

const updateHistory = R.curry((action, location) => {
  // if updating to a different location.
  if (!isCurrentLocation(location)) {
    // push or replace with the new location.
    getHistory()[action](cloneLocation(location))
  }
})

const onceThenNull = (func) => {
  let count = 0
  return () => (
    (count++ <= 0)
      ? func()
      : null
  )
}

const pushLocation = R.curry((sink, location) => {
  sink(location)
})

const removeHistorySession = (location) => {
  Storage.remove('@@History/' + location.key)
}

const shouldDispatchAction = R.complement(
  R.pathOr(false, ['state', 'skipAction'])
)

export const listen = () => (
  Bacon.mergeAll(
    // stream the current location.
    Bacon.once(getHistory().getCurrentLocation()),
    // location changes since the listening.
    Bacon.fromBinder(sink => {
      return getHistory().listen(pushLocation(sink))
    })
  )
  // remove session entry created by history library.
  .doAction(removeHistorySession)
  // don't dispatch another action from location-history.
  .filter(shouldDispatchAction)
  // remember the location object.
  .doAction(currentLocationProp.setLocation)
  // create an action to update location store.
  .map(R.objOf('location'))
  .map(R.assoc('type', ActionTypes.ROUTE_LOCATION_UPDATE))
)

export const push = R.pipe(
  mapLocation,
  updateHistory('push')
)

export const replace = R.pipe(
  mapLocation,
  updateHistory('replace')
)

export default bindToDispatch({
  listen: onceThenNull(listen),
  push,
  replace
})
