/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import * as Bacon from 'baconjs'
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
  replace,
  reset,
} from './location-action'

describe('Location Action', () => {

  let sandbox, clock, dispose

  const listenCallback = (callback) => {
    dispose = listen().onValue(callback)
    clock.tick(1)
  }

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    clock = sinon.useFakeTimers(Date.now())
  })

  it('should return a bacon stream to listen', () => {
    chai.expect(listen()).to.be.instanceof(Bacon.Observable)
  })

  it('should start listening only once', () => {
    const dispose = getActionStream().onValue()
    const stream = LocationAction.listen()
    chai.expect(LocationAction.listen()).to.equal(stream)
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
    listenCallback(callback)
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('type')
      .and.equal(ActionTypes.ROUTE_LOCATION_UPDATE)
  })

  it('should ignore the state of the current location', () => {
    const callback = sinon.stub()
    getHistory().push('/', {})
    listenCallback(callback)
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.lastCall.args[0]).to.not.have.nested.property('location.state')
  })

  it('should have pathname for the current location', () => {
    const callback = sinon.stub()
    listenCallback(callback)
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('location')
      .and.have.property('pathname', '/')
  })

  it('should load the current pathname', () => {
    const callback = sinon.stub()
    const history = getHistory()
    history.push('/test')
    listenCallback(callback)
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('location')
      .and.have.property('pathname', '/test')
  })

  it('should clear session entry created by history library', () => {
    sandbox.stub(Storage, 'remove')
    listenCallback()
    chai.expect(Storage.remove.calledOnce).to.be.true
    chai.expect(Storage.remove.lastCall.args[0]).to.match(/^@@History\//)
  })

  it('should remember the last location', () => {
    const callback = sinon.stub()
    listenCallback(callback)
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('location')
      .and.eql(currentLocationProp.getLocation())
  })

  it('should create a browser history', () => {
    sandbox.stub(Common, 'canUseDOM').returns(true)
    chai.expect(createPlatformHistory).to.throw(/document is not defined/i)
  })

  it('should create a memory history', () => {
    sandbox.stub(Common, 'canUseDOM').returns(false)
    chai.expect(createPlatformHistory).to.not.throw()
  })

  it('should push a pathname', () => {
    const callback = sinon.stub()
    listenCallback(callback)
    push('/test/push')
    chai.expect(callback.calledTwice).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.nested.property('location.pathname')
      .and.equal('/test/push')
  })

  it('should push a history location', () => {
    const callback = sinon.stub()
    listenCallback(callback)
    push({ pathname: '/test/push/location' })
    chai.expect(callback.calledTwice).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.property('location')
      .and.have.property('pathname', '/test/push/location')
  })

  it('should not push the same location repeatedly', () => {
    const callback = sinon.stub()
    listenCallback(callback)
    push('/test/push/same')
    push({ pathname: '/test/push/same' })
    chai.expect(callback.calledTwice).to.be.true
  })

  it('should not push the same location with action skipped', () => {
    const callback = sinon.stub()
    const history = getHistory()
    sandbox.spy(history, 'push')
    listenCallback(callback)
    push('/test/push/same/skip')
    push({ pathname: '/test/push/same/skip', state: { skipAction: true } })
    chai.expect(history.push.calledOnce).to.be.true
    chai.expect(history.location).to.deep.include({
      pathname: '/test/push/same/skip',
      search: '',
      state: null
    })
  })

  it('should push a different location pathname', () => {
    const callback = sinon.stub()
    listenCallback(callback)
    push('/test/push/diff/1')
    push({ pathname: '/test/push/diff/2' })
    chai.expect(callback.calledThrice).to.be.true
  })

  it('should push a different location search', () => {
    const callback = sinon.stub()
    listenCallback(callback)
    push('/test/push/search')
    push({ pathname: '/test/push/search', search: 'query' })
    chai.expect(callback.calledThrice).to.be.true
  })

  it('should push a different location state', () => {
    const callback = sinon.stub()
    listenCallback(callback)
    push('/test/push/state')
    push({ pathname: '/test/push/state', state: { sort: 'price' } })
    chai.expect(callback.calledThrice).to.be.true
  })

  it('should not push an empty location state from undefined', () => {
    const callback = sinon.stub()
    listenCallback(callback)
    push('/test/push/state/empty')
    push({ pathname: '/test/push/state/empty', state: {} })
    chai.expect(callback.calledTwice).to.be.true
  })

  it('should replace a pathname', () => {
    const callback = sinon.stub()
    listenCallback(callback)
    replace('/test/replace')
    chai.expect(callback.calledTwice).to.be.true
    chai.expect(callback.lastCall.args[0]).to.have.nested.property('location.pathname')
      .and.equal('/test/replace')
  })

  it('should replace a history location without creating an action', () => {
    const callback = sinon.stub()
    listenCallback(callback)
    replace({ pathname: '/test/replace/skip', state: { skipAction: true } })
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(getHistory().location).to.have.property('pathname')
      .and.equal('/test/replace/skip')
  })

  it('should remember the last location without creating an action', () => {
    const callback = sinon.stub()
    listenCallback(callback)
    replace({ pathname: '/test/current/skip', state: { skipAction: true } })
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(currentLocationProp.getLocation()).to.have.property('pathname')
      .and.equal('/test/current/skip')
  })

  it('should reset even for the same location', () => {
    const callback = sinon.stub()
    listenCallback(callback)
    reset('/test/reset/same')
    reset({ pathname: '/test/reset/same' })
    chai.expect(callback.callCount).to.equal(3)
  })

  it('should reset the same location with action skipped', () => {
    const callback = sinon.stub()
    const history = getHistory()
    sandbox.spy(history, 'replace')
    listenCallback(callback)
    reset('/test/reset/same/skip')
    reset({ pathname: '/test/reset/same/skip', state: { skipAction: true } })
    chai.expect(history.replace.callCount).to.equal(2)
    chai.expect(history.location).to.deep.include({
      pathname: '/test/reset/same/skip',
      search: '',
      state: null
    })
  })

  it('should handle bacon end event', () => {
    const callback = sinon.stub()
    sandbox.stub(getHistory(), 'listen')
      .callsFake((cb) => cb({ location: new Bacon.End() }))
    listen().onEnd(callback)
    clock.tick(1)
    chai.expect(callback.calledOnce).to.be.true
  })

  afterEach(() => {
    clock.restore()
    sandbox.restore()
    dispose && dispose()
  })

})
