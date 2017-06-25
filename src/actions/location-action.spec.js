/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import Bacon from 'baconjs'
import Common from '../utils/common-util'
import Storage from '../utils/storage-util'
import ActionTypes from '../actions/action-types'
import { getActionStream } from 'bdux'
import LocationAction, {
  createPlatformHistory,
  getHistory,
  currentLocationProp,
  listen,
  push,
  replace } from './location-action'

describe('Location Action', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  it('should return a bacon stream to listen', () => {
    chai.expect(listen()).to.be.instanceof(Bacon.Observable)
  })

  it('should start listening only once', () => {
    const dispose = getActionStream().onValue()
    LocationAction.listen()
    chai.expect(LocationAction.listen()).to.not.be.ok
    dispose()
  })

  it('should not return action directly from push', () => {
    chai.expect(push()).to.not.be.ok
  })

  it('should not return action directly from replace', () => {
    chai.expect(replace()).to.not.be.ok
  })

  it('should create an update action for the current location', () => {
    const callback = sinon.stub()
    listen().onValue(callback)
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('type')
      .and.equal(ActionTypes.ROUTE_LOCATION_UPDATE)
  })

  it('should ignore the state of the current location', () => {
    const callback = sinon.stub()
    getHistory().location.state = {}
    listen().onValue(callback)
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.lastCall.args[0]).to.not.have.nested.property('location.state')
  })

  it('should have pathname for the current location', () => {
    const callback = sinon.stub()
    listen().onValue(callback)
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('location')
      .and.have.property('pathname', '/')
  })

  it('should load the current pathname', () => {
    const callback = sinon.stub()
    const history = getHistory()
    history.push('/test')
    listen().onValue(callback)
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('location')
      .and.have.property('pathname', '/test')
  })

  it('should clear session entry created by history library', () => {
    sandbox.stub(Storage, 'remove')
    listen().onValue()
    chai.expect(Storage.remove.calledOnce).to.be.true
    chai.expect(Storage.remove.lastCall.args[0]).to.match(/^@@History\//)
  })

  it('should remember the last location', () => {
    const callback = sinon.stub()
    listen().onValue(callback)
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('location')
      .and.eql(currentLocationProp.getLocation())
  })

  it('should create a browser history', () => {
    sandbox.stub(Common, 'canUseDOM').returns(true)
    chai.expect(createPlatformHistory).to.throw(/Browser history needs a DOM/i)
  })

  it('should create a memory history', () => {
    sandbox.stub(Common, 'canUseDOM').returns(false)
    chai.expect(createPlatformHistory).to.not.throw()
  })

  it('should push a pathname', () => {
    const callback = sinon.stub()
    listen().onValue(callback)
    push('/test/push')
    chai.expect(callback.calledTwice).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.nested.property('location.pathname')
      .and.equal('/test/push')
  })

  it('should push a history location', () => {
    const callback = sinon.stub()
    listen().onValue(callback)
    push({ pathname: '/test/push/location' })
    chai.expect(callback.calledTwice).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('location')
      .and.have.property('pathname', '/test/push/location')
  })

  it('should not push the same location repeatedly', () => {
    const callback = sinon.stub()
    listen().onValue(callback)
    push('/test/push/same')
    push({ pathname: '/test/push/same' })
    chai.expect(callback.calledTwice).to.be.true
  })

  it('should push a different location search', () => {
    const callback = sinon.stub()
    listen().onValue(callback)
    push('/test/push/search')
    push({ pathname: '/test/push/search', search: 'query' })
    chai.expect(callback.calledThrice).to.be.true
  })

  it('should push a different location state', () => {
    const callback = sinon.stub()
    listen().onValue(callback)
    push('/test/push/state')
    push({ pathname: '/test/push/state', state: {} })
    chai.expect(callback.calledThrice).to.be.true
  })

  it('should replace a pathname', () => {
    const callback = sinon.stub()
    listen().onValue(callback)
    replace('/test/replace')
    chai.expect(callback.calledTwice).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.nested.property('location.pathname')
      .and.equal('/test/replace')
  })

  it('should replace a history location without creating an action', () => {
    const callback = sinon.stub()
    listen().onValue(callback)
    replace({ pathname: '/test/replace/skip', state: { skipAction: true } })
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(getHistory().location).to.have.property('pathname')
      .and.equal('/test/replace/skip')
  })

  it('should remember the last location without creating an action', () => {
    const callback = sinon.stub()
    listen().onValue(callback)
    replace({ pathname: '/test/current/skip', state: { skipAction: true } })
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(currentLocationProp.getLocation()).to.have.property('pathname')
      .and.equal('/test/current/skip')
  })

  afterEach(() => {
    sandbox.restore()
  })

})
