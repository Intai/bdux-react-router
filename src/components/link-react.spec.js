/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import { shallow } from 'enzyme'
import LocationAction from '../actions/location-action'
import Link, { LinkWrap } from './link-react'

describe('Link Component', () => {

  let sandbox, event

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    event = { preventDefault: sinon.stub() }
  })

  it('should handle onclick', () => {
    const wrapper = shallow(<Link to="/path" />)
    chai.expect(wrapper.prop('onClick')).to.be.a('function')
  })

  it('should push location through action', () => {
    sandbox.stub(LocationAction, 'push')
    const wrapper = shallow(<LinkWrap to="/path" />)
    const link = wrapper.find('Link').shallow()
    chai.expect(() => link.simulate('click', event)).to.throw()
    chai.expect(LocationAction.push.calledOnce).to.be.true
    chai.expect(LocationAction.push.lastCall.args[0]).to.equal('/path')
  })

  it('should prevent click default', () => {
    const wrapper = shallow(<LinkWrap to="/path" />)
    const link = wrapper.find('Link').shallow()
    chai.expect(() => link.simulate('click', event)).to.throw()
    chai.expect(event.preventDefault.calledOnce).to.be.true
  })

  it('should be able style color', () => {
    const wrapper = shallow(<Link style={{ color: 'test' }} />)
    const link = wrapper.find('Link').shallow()
    chai.expect(link.prop('style')).to.have.property('color', 'test')
  })

  afterEach(() => {
    sandbox.restore()
  })

})
