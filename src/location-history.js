import R from 'ramda'
import Common from './utils/common-util'
import LocationAction from './actions/location-action'
import { createMemoryHistory } from 'react-router'

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
  R.is(Object),
  R.prop('pathname'),
  R.defaultTo({})
)

const createHistory = R.pipe(
  getPathname,
  createMemoryHistory,
  hijackHistoryListen
)

const historyProp = (() => {
  let history
  const setHistory = (location) => (
    history = createHistory(location)
  )

  return {
    setHistory,
    getHistory: (location) => (
      history || setHistory(location)
    )
  }
})()

const getHistory = (
  historyProp.getHistory
)

const getHistoryListen = R.pipe(
  getHistory,
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
  R.tap(LocationAction.replace),
  // trigger react-router history listen.
  pushHistoryListen
)

const deferUpdateLocation = R.when(
  R.is(Object),
  Common.deferOnClient(updateLocation)
)

export const resetLocationHistory = R.pipe(
  // force to recreate history.
  R.tap(historyProp.setHistory),
  // and update location store.
  LocationAction.replace
)

export const createLocationHistory = R.converge(
  R.identity, [
    // initialise history if hasn't.
    // always return the same react-router history
    // because it does not support changing history.
    getHistory,
    // defer to be after render.
    deferUpdateLocation
  ]
)
