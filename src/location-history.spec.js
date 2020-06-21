/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import Common from './utils/common-util'
import * as LocationAction from './actions/location-action'
import {
  createLocationHistory,
  resetLocationHistory } from './location-history'

describe('Location History', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  it('should create a location history object', () => {
    const history = createLocationHistory(null)
    chai.expect(history).to.have.property('listen')
      .and.is.a('function')
  })

  it('should have a default current location', () => {
    const history = createLocationHistory(null)
    chai.expect(history.location).to.include({
      pathname: '/',
      search: '',
      hash: '',
      state: null
    })
  })

  it('should keep the same history object', () => {
    const history1 = createLocationHistory(null)
    const history2 = createLocationHistory({})
    chai.expect(history1).to.equal(history2)
  })

  it('should set the current location', () => {
    sandbox.stub(LocationAction, 'reset')
    resetLocationHistory({ pathname: '/test' })
    const history = createLocationHistory(undefined)
    chai.expect(history.location).to.include({
      pathname: '/test',
      search: '',
      hash: '',
      state: null
    })
  })

  it('should set the current pathname', () => {
    sandbox.stub(LocationAction, 'reset')
    resetLocationHistory('/pathname')
    const history = createLocationHistory(undefined)
    chai.expect(history.location).to.include({
      pathname: '/pathname',
      search: '',
      hash: '',
      state: null
    })
  })

  it('should replace location thourgh action to reset ', () => {
    sandbox.stub(LocationAction, 'reset')
    resetLocationHistory({ pathname: '/test' })
    chai.expect(LocationAction.reset.calledOnce).to.be.true
    chai.expect(LocationAction.reset.lastCall.args[0]).to.eql({
      pathname: '/test'
    })
  })

  it('should defer update on client', () => {
    const deferOnClient = sandbox.stub(Common, 'deferOnClient')
    createLocationHistory({})
    chai.expect(deferOnClient.calledOnce).to.be.true
    chai.expect(deferOnClient.lastCall.args[1]).to.eql({})
  })

  it('should not update without location', () => {
    sandbox.stub(Common, 'deferOnClient')
    createLocationHistory(null)
    chai.expect(Common.deferOnClient.called).to.be.false
  })

  it('should not update the same location', () => {
    sandbox.stub(Common, 'deferOnClient')
    createLocationHistory({ pathname: '/test/same' })
    createLocationHistory({ pathname: '/test/same' })
    chai.expect(Common.deferOnClient.callCount).to.equal(1)
  })

  describe('on client', () => {

    beforeEach(() => {
      sandbox.stub(LocationAction, 'replace')
      sandbox.stub(Common, 'deferOnClient').callsFake((updateLocation, location) => {
        updateLocation(location)
      })
    })

    it('should replace location thourgh action', () => {
      resetLocationHistory()
      createLocationHistory({})
      chai.expect(LocationAction.replace.calledOnce).to.be.true
      chai.expect(LocationAction.replace.lastCall.args[0]).to.eql({
        state: {
          skipAction: true
        }
      })
    })

    it('should send location to listener', () => {
      const history = createLocationHistory(null)
      const listener = sinon.stub()
      history.listen(listener)
      createLocationHistory({ pathname: '/test/listener' })
      chai.expect(listener.calledOnce).to.be.true
      chai.expect(listener.lastCall.args[0].location).to.deep.include({
        pathname: '/test/listener',
        state: {
          skipAction: true
        }
      })
    })

    it('should update location along with listener', () => {
      const history = createLocationHistory(null)
      createLocationHistory({ pathname: '/test/variable' })
      chai.expect(history.location).to.deep.include({
        pathname: '/test/variable',
        state: {
          skipAction: true
        }
      })
    })

  })

  afterEach(() => {
    sandbox.restore()
  })

})
