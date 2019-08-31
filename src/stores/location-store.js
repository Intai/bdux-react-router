import {
  assoc,
  path,
  pathEq,
  prop,
  when,
} from 'ramda'
import * as Bacon from 'baconjs'
import ActionTypes from '../actions/action-types'
import StoreNames from '../stores/store-names'
import { createStore } from 'bdux'

const isAction = pathEq(
  ['action', 'type']
)

const mergeState = (func) => (args) => (
  assoc('state', func(args), args)
)

const whenUpdate = when(
  // if updating route location.
  isAction(ActionTypes.ROUTE_LOCATION_UPDATE),
  // replace the location state.
  mergeState(path(['action', 'location']))
)

const getOutputStream = (reducerStream) => (
  reducerStream
    .map(whenUpdate)
    .map(prop('state'))
)

export const getReducer = () => {
  const reducerStream = new Bacon.Bus()

  return {
    input: reducerStream,
    output: getOutputStream(reducerStream)
  }
}

export default createStore(
  StoreNames.ROUTE_LOCATION, getReducer
)
