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
      state: undefined
    })
  })

  it('should keep the same history object', () => {
    const history1 = createLocationHistory(null)
    const history2 = createLocationHistory({})
    chai.expect(history1).to.equal(history2)
  })

  it('should set the current location', () => {
    sandbox.stub(LocationAction, 'replace')
    resetLocationHistory({ pathname: '/test' })
    const history = createLocationHistory(undefined)
    chai.expect(history.location).to.include({
      pathname: '/test',
      search: '',
      hash: '',
      state: undefined
    })
  })

  it('should replace location thourgh action to reset ', () => {
    sandbox.stub(LocationAction, 'replace')
    resetLocationHistory({ pathname: '/test' })
    chai.expect(LocationAction.replace.calledOnce).to.be.true
    chai.expect(LocationAction.replace.lastCall.args[0]).to.eql({
      pathname: '/test'
    })
  })

  it('should defer update on client', () => {
    const deferOnClient = sinon.stub()
    sandbox.stub(Common, 'deferOnClient').returns(deferOnClient)
    createLocationHistory({})
    chai.expect(deferOnClient.calledOnce).to.be.true
    chai.expect(deferOnClient.lastCall.args[0]).to.eql({})
  })

  it('should not update without location', () => {
    sandbox.stub(Common, 'deferOnClient')
    createLocationHistory(null)
    chai.expect(Common.deferOnClient.called).to.be.false
  })

  describe('on client', () => {

    beforeEach(() => {
      sandbox.stub(LocationAction, 'replace')
      sandbox.stub(Common, 'deferOnClient').returns((location) => {
        Common.deferOnClient.lastCall.args[0](location)
      })
    })

    it('should replace location thourgh action', () => {
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
      createLocationHistory({ pathname: '/test' })
      chai.expect(listener.calledOnce).to.be.true
      chai.expect(listener.lastCall.args[0]).to.eql({
        pathname: '/test',
        state: {
          skipAction: true
        }
      })
    })

    it('should update location along with listener', () => {
      const history = createLocationHistory(null)
      createLocationHistory({ pathname: '/test' })
      chai.expect(history.location).to.eql({
        pathname: '/test'
      })
    })

  })

  afterEach(() => {
    sandbox.restore()
  })

})
