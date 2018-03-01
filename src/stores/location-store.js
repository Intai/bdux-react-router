import * as R from 'ramda'
import Bacon from 'baconjs'
import ActionTypes from '../actions/action-types'
import StoreNames from '../stores/store-names'
import { createStore } from 'bdux'

const isAction = R.pathEq(
  ['action', 'type']
)

const mergeState = (getValue) => (
  R.converge(R.merge, [
    R.identity,
    R.pipe(
      getValue,
      R.objOf('state')
    )
  ])
)

const whenUpdate = R.when(
  // if updating route location.
  isAction(ActionTypes.ROUTE_LOCATION_UPDATE),
  // replace the location state.
  mergeState(R.path(['action', 'location']))
)

const getOutputStream = (reducerStream) => (
  reducerStream
    .map(whenUpdate)
    .map(R.prop('state'))
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
