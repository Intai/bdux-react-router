import * as R from 'ramda'
import Common from './utils/common-util'
import LocationAction from './actions/location-action'
import { createMemoryHistory } from 'history'

const hijackHistoryListen = (history) => {
  let prevListen = R.F

  history.listen = (callback) => (
    (callback)
      // bind the listener.
      ? (prevListen = callback)
      // return the currently bound listener.
      : prevListen
  )

  return history
}

const getPathname = R.ifElse(
  R.is(String),
  R.identity,
  R.propOr(null, 'pathname')
)

const createInitialEntries = R.ifElse(
  R.identity,
  R.pipe(R.of, R.objOf('initialEntries')),
  R.always({})
)

const createHistory = R.pipe(
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

const getHistoryListen = R.pipe(
  historyProp.getHistory,
  R.prop('listen'),
  R.call
)

const addLocationState = R.assocPath(
  ['state', 'skipAction'],
  true
)

const pushHistoryListen = R.converge(
  R.call, [
    // get the callback currently
    // bound to react-router history listen.
    getHistoryListen,
    // the new location.
    R.identity
  ]
)

const updateLocation = R.pipe(
  // add state to skip action.
  addLocationState,
  // update browser history through action.
  R.tap(location => LocationAction.replace(location)),
  // trigger react-router history listen.
  pushHistoryListen
)

const deferUpdateLocation = R.when(
  R.is(Object),
  location => Common.deferOnClient(updateLocation)(location)
)

export const resetLocationHistory = R.pipe(
  // force to recreate history.
  R.tap(historyProp.setHistory),
  // and update location store.
  location => LocationAction.replace(location)
)

export const createLocationHistory = R.converge(
  R.identity, [
    // initialise history if hasn't.
    // always return the same react-router history
    // because it does not support changing history.
    historyProp.getHistory,
    // react-router v4 doesn't update component
    // with the location sent through history listen.
    // workaround by modifying history itself.
    historyProp.updateHistory,
    // defer to be after render.
    deferUpdateLocation
  ]
)
