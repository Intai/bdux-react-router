import {
  assocPath,
  pipe,
  tap,
} from 'ramda'
import Common from './utils/common-util'
import { isLocationEqual } from './utils/location-util'
import * as LocationAction from './actions/location-action'
import { createMemoryHistory } from 'history'

const getPathname = (location) => (
  (typeof location === 'string')
    ? location
    : (location ? location.pathname : null)
)

const createInitialEntries = (pathname) => (
  (pathname)
    ? { initialEntries: [pathname] }
    : {}
)

const createHistory = pipe(
  getPathname,
  createInitialEntries,
  createMemoryHistory
)

const historyProp = (() => {
  let history

  return {
    setHistory: location => history = createHistory(location),
    getHistory: location => history || (history = createHistory(location)),
    updateHistory: location => history && location && (history.location = location)
  }
})()

const addLocationState = assocPath(
  ['state', 'skipAction'],
  true
)

const pushHistoryListen = (location) => (
  historyProp.getHistory(location)
    .replace(location)
)

const updateLocation = pipe(
  // add state to skip action.
  addLocationState,
  // update browser history through action.
  tap(location => LocationAction.replace(location)),
  // trigger react-router history listen.
  pushHistoryListen
)

const deferUpdateLocation = (location) => {
  if (location && typeof location === 'object') {
    Common.deferOnClient(updateLocation, location)
  }
}

export const resetLocationHistory = (location) => {
  // force to recreate history.
  historyProp.setHistory(location)
  // and update location store.
  LocationAction.reset(location)
}

export const createLocationHistory = (location) => {
  // initialise history if hasn't.
  // always return the same react-router history
  // because it does not support changing history.
  const history = historyProp.getHistory(location)

  if (!isLocationEqual(location, history.location)) {
    // react-router v4 doesn't update component
    // with the location sent through history listen.
    // workaround by modifying history itself.
    historyProp.updateHistory(location)
    // defer to be after render.
    deferUpdateLocation(location)
  }

  return history
}
