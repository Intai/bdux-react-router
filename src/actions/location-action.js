import * as R from 'ramda'
import Bacon from 'baconjs'
import Common from '../utils/common-util'
import Storage from '../utils/storage-util'
import ActionTypes from './action-types'
import { createBrowserHistory, createMemoryHistory } from 'history'

export const createPlatformHistory = () => (
  Common.canUseDOM()
    ? createBrowserHistory()
    : createMemoryHistory()
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

const getInitialHistoryLocation = () => (
  R.dissoc('state', getHistory().location)
)

const defaultKeyValue = (key, value) => R.over(
  R.lensProp(key),
  R.defaultTo(value)
)

const cloneLocation = R.pipe(
  R.pick(['pathname', 'search', 'state']),
  R.dissocPath(['state', 'skipAction']),
  defaultKeyValue('search', ''),
  defaultKeyValue('state', {})
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

const shouldSkipCurrentLocation = R.pipe(
  currentLocationProp.getLocation,
  R.pathOr(false, ['state', 'skipAction'])
)

const createLocation = (location) => ({
  pathname: location
})

const mapLocation = R.ifElse(
  R.is(String),
  createLocation,
  R.identity
)

const updateHistory = R.curry((action, location) => {
  // if updating to a different location.
  if (!isCurrentLocation(location)) {
    // keep the latest location.
    currentLocationProp.setLocation(location)
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

const shouldSkipAction = R.both(
  shouldSkipCurrentLocation,
  isCurrentLocation
)

function handleLocation(event) {
  if (event.hasValue) {
    // get the location update.
    const location = event.value
    // don't dispatch another action from location-history.
    const shouldSkip = shouldSkipAction(location)
    // remember the location object.
    currentLocationProp.setLocation(location)

    if (shouldSkip) {
      return
    }
  }

  return this.push(event)
}

export const listen = () => (
  Bacon.mergeAll(
    // stream the current location.
    Bacon.once(getInitialHistoryLocation()),
    // location changes since the listening.
    Bacon.fromBinder(sink => getHistory().listen(pushLocation(sink)))
  )
  // remove session entry created by history library.
  .doAction(removeHistorySession)
  // handle the location update.
  .withHandler(handleLocation)
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

export default {
  listen: onceThenNull(listen),
  push,
  replace
}
