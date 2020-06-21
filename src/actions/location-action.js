import {
  assoc,
  both,
  dissoc,
  objOf,
  once,
  pathOr,
  pipe,
} from 'ramda'
import * as Bacon from 'baconjs'
import Common from '../utils/common-util'
import Storage from '../utils/storage-util'
import { cloneLocation, isLocationEqual } from '../utils/location-util'
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
  dissoc('state', getHistory().location)
)

const isCurrentLocation = (location) => (
  isLocationEqual(
    location || {},
    currentLocationProp.getLocation()
  )
)

const shouldSkipCurrentLocation = pipe(
  currentLocationProp.getLocation,
  pathOr(false, ['state', 'skipAction'])
)

const createLocation = (location) => ({
  pathname: location
})

const mapLocation = (location) => (
  (typeof location === 'string')
    ? createLocation(location)
    : location
)

const updateHistory = (action, force) => (location) => {
  // if updating to a different location.
  if (force || !isCurrentLocation(location)) {
    // keep the latest location.
    currentLocationProp.setLocation(location)
    // push or replace with the new location.
    getHistory()[action](cloneLocation(location))
  }
}

const pushLocation = (sink) => ({ location }) => {
  sink(location)
}

const removeHistorySession = (location) => {
  Storage.remove('@@History/' + location.key)
}

const shouldSkipAction = both(
  shouldSkipCurrentLocation,
  isCurrentLocation
)

const handleLocation = (location) => {
  // don't dispatch another action from location-history.
  const shouldSkip = shouldSkipAction(location)
  // remember the location object.
  currentLocationProp.setLocation(location)
  // filter to continue if should not skip.
  return !shouldSkip
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
  .filter(handleLocation)
  // create an action to update location store.
  .map(objOf('location'))
  .map(assoc('type', ActionTypes.ROUTE_LOCATION_UPDATE))
)

export const push = pipe(
  mapLocation,
  updateHistory('push')
)

export const replace = pipe(
  mapLocation,
  updateHistory('replace')
)

export const reset = pipe(
  mapLocation,
  updateHistory('replace', true)
)

export default {
  listen: once(listen),
  push,
  replace,
  reset,
}
