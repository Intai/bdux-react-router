import {
  assocPath,
  pipe,
  tap,
} from 'ramda'
import Common from './utils/common-util'
import * as LocationAction from './actions/location-action'

const addLocationState = assocPath(
  ['state', 'skipAction'],
  true
)

const updateLocation = pipe(
  // add state to skip action.
  addLocationState,
  // update browser history through action.
  tap(location => LocationAction.replace(location))
)

const deferUpdateLocation = (location) => {
  if (location && typeof location === 'object') {
    Common.deferOnClient(updateLocation, location)
  }
}

export const resetLocationHistory = (location) => {
  // and update location store.
  LocationAction.reset(location)
}

export const updateRouterLocation = (location) => {
  // defer to be after render.
  deferUpdateLocation(location)
  return location || ''
}
