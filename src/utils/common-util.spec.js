/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import Common, {
  canUseDOM,
  deferOnClient } from './common-util'

describe('Common Utilities', () => {

  let clock

  beforeEach(() => {
    clock = sinon.useFakeTimers()
  })

  it('should not be able to use dom when there is no window', () => {
    global.window = undefined
    chai.expect(canUseDOM()).to.not.be.ok
  })

  it('should not be able to use dom when there is no document', () => {
    global.window = { document: undefined }
    chai.expect(canUseDOM()).to.not.be.ok
  })

  it('should not be able to use dom when there is no function to create element', () => {
    global.window = { document: { createElement: undefined }}
    chai.expect(canUseDOM()).to.not.be.ok
  })

  it('should be able to use dom when there is function to create element', () => {
    global.window = { document: { createElement: () => {} }}
    chai.expect(canUseDOM()).to.be.ok
  })

  it('should cache whether dom is available', () => {
    global.window = undefined
    const cached = Common.canUseDOM()
    global.window = { document: { createElement: () => {} }}
    chai.expect(Common.canUseDOM()).to.equal(cached)
  })

  it('should generate an object of constants', () => {
    const storeNames = Common.createObjOfConsts(['ROUTER'])
    chai.expect(storeNames).to.eql({
      ROUTER: 'BDUXRL_ROUTER'
    })
  })

  it('should defer on client', () => {
    const callback = sinon.stub()
    global.window = { document: { createElement: () => {} }}
    deferOnClient(canUseDOM)(callback, 'test')
    clock.tick(1)
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.lastCall.args[0]).to.equal('test')
  })

  it('should not defer on server', () => {
    const callback = sinon.stub()
    global.window = undefined
    deferOnClient(canUseDOM)(callback)
    clock.tick(1)
    chai.expect(callback.called).to.be.false
  })

  it('should cache whether to defer', () => {
    const callback = sinon.stub()
    global.window = undefined
    Common.canUseDOM()
    global.window = { document: { createElement: () => {} }}
    Common.deferOnClient(callback)
    clock.tick(1)
    chai.expect(callback.called).to.be.false
  })

  afterEach(() => {
    clock.restore()
  })

})
