/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import * as Bacon from 'baconjs'
import { getActionStream } from 'bdux'
import ActionTypes from '../actions/action-types'
import LocationStore, { getReducer } from './location-store'

describe('Location Store', () => {

  it('should have reducer input', () => {
    chai.expect(getReducer()).to.have.property('input')
      .and.is.instanceof(Bacon.Observable)
  })

  it('should have reducer output', () => {
    chai.expect(getReducer()).to.have.property('output')
      .and.is.instanceof(Bacon.Observable)
  })

  it('should record location', () => {
    const callback = sinon.stub()
    LocationStore.getProperty().onValue(callback)
    getActionStream().push({
      type: ActionTypes.ROUTE_LOCATION_UPDATE,
      location: { pathname: '/test' }
    })

    chai.expect(callback.calledTwice).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('pathname', '/test')
  })

})
