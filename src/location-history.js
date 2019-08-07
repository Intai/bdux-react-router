import {
  assocPath,
  F,
  pipe,
  tap,
} from 'ramda'
import Common from './utils/common-util'
import * as LocationAction from './actions/location-action'
import { createMemoryHistory } from 'history'

const hijackHistoryListen = (history) => {
  let prevListen = F

  history.listen = (callback) => (
    (callback)
      // bind the listener.
      ? (prevListen = callback)
      // return the currently bound listener.
      : prevListen
  )

  return history
}

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
  createMemoryHistory,
  hijackHistoryListen
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
  // get the callback currently
  // bound to react-router history listen.
  historyProp.getHistory(location)
    // the new location.
    .listen()(location)
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

export const resetLocationHistory = pipe(
  // force to recreate history.
  tap(historyProp.setHistory),
  // and update location store.
  location => LocationAction.replace(location)
)

export const createLocationHistory = (location) => {
  // initialise history if hasn't.
  // always return the same react-router history
  // because it does not support changing history.
  const history = historyProp.getHistory(location)
  // react-router v4 doesn't update component
  // with the location sent through history listen.
  // workaround by modifying history itself.
  historyProp.updateHistory(location)
  // defer to be after render.
  deferUpdateLocation(location)

  return history
}
