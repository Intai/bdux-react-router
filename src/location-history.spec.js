/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import Common from './utils/common-util'
import * as LocationAction from './actions/location-action'
import {
  resetLocationHistory,
  updateRouterLocation,
} from './location-history'

describe('Location History', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should have a default', () => {
    const location = updateRouterLocation(null)
    chai.expect(location).to.equal('')
  })

  it('should replace location through action to reset ', () => {
    sandbox.stub(LocationAction, 'reset')
    resetLocationHistory({ pathname: '/test' })
    chai.expect(LocationAction.reset.calledOnce).to.be.true
    chai.expect(LocationAction.reset.lastCall.args[0]).to.eql({
      pathname: '/test'
    })
  })

  describe('on client', () => {

    beforeEach(() => {
      sandbox.stub(LocationAction, 'replace')
      sandbox.stub(Common, 'deferOnClient').callsFake((updateLocation, location) => {
        updateLocation(location)
      })
    })

    it('should defer on client', () => {
      updateRouterLocation({})
      chai.expect(Common.deferOnClient.calledOnce).to.be.true
      chai.expect(Common.deferOnClient.lastCall.args[1]).to.eql({})
    })

    it('should not defer without location', () => {
      updateRouterLocation(null)
      chai.expect(Common.deferOnClient.called).to.be.false
    })

    it('should replace through action', () => {
      resetLocationHistory('/pathname')
      updateRouterLocation({})
      chai.expect(LocationAction.replace.calledOnce).to.be.true
      chai.expect(LocationAction.replace.lastCall.args[0]).to.eql({
        state: {
          skipAction: true
        }
      })
    })

  })

})
