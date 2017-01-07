/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import Common from './common-util'
import Storage, { remove } from './storage-util'

describe('Storage Utilities', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    global.window = {
      sessionStorage: {
        removeItem: sinon.stub()
      }
    }
  })

  it('should remove from session storage', () => {
    const removeItem = window.sessionStorage.removeItem
    remove('name')
    chai.expect(removeItem.calledOnce).to.be.true
    chai.expect(removeItem.lastCall.args[0]).to.eql('name')
  })

  it('shuld remove on client', () => {
    sandbox.stub(Common, 'canUseDOM').returns(true)
    const removeItem = window.sessionStorage.removeItem
    Storage.remove('name')
    chai.expect(removeItem.calledOnce).to.be.true
  })

  it('should not remove on server', () => {
    sandbox.stub(Common, 'canUseDOM').returns(false)
    const removeItem = window.sessionStorage.removeItem
    Storage.remove('name')
    chai.expect(removeItem.called).to.be.false
  })

  afterEach(() => {
    sandbox.restore()
  })

})
