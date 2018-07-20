/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import { JSDOM } from 'jsdom'
import { mount } from 'enzyme'
import { MemoryRouter } from 'react-router-dom'
import * as LocationAction from '../actions/location-action'
import Link, { LinkWrap } from './link'

const mountWithRouter = (children) => mount(
  <MemoryRouter>
    {children}
  </MemoryRouter>
)

describe('Link Component', () => {

  let sandbox, event

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    sandbox.stub(LocationAction, 'push')
    event = { preventDefault: sinon.stub() }
  })

  beforeEach(() => {
    const dom = new JSDOM('<html></html>')
    global.window = dom.window
    global.document = dom.window.document
    global.Element = dom.window.Element
  })

  it('should handle onclick', () => {
    const wrapper = mountWithRouter(<Link to="/path" />)
    const link = wrapper.find('Link')
    chai.expect(link.prop('onClick')).to.be.a('function')
  })

  it('should push location through action', () => {
    const wrapper = mountWithRouter(
      <LinkWrap
        dispatch={sinon.stub()}
        to="/path"
      />
    )

    const link = wrapper.find('Link')
    link.simulate('click', event)
    chai.expect(LocationAction.push.calledOnce).to.be.true
    chai.expect(LocationAction.push.lastCall.args[0]).to.equal('/path')
  })

  it('should prevent click default', () => {
    const wrapper = mountWithRouter(
      <LinkWrap
        dispatch={sinon.stub()}
        to="/path"
      />
    )

    const link = wrapper.find('Link')
    link.simulate('click', event)
    chai.expect(event.preventDefault.calledOnce).to.be.true
  })

  it('should be able style color', () => {
    // eslint-disable-next-line react/jsx-max-props-per-line
    const wrapper = mountWithRouter(<Link style={{ color: 'test' }} to="/path" />)
    const link = wrapper.find('Link')
    chai.expect(link.prop('style')).to.have.property('color', 'test')
  })

  afterEach(() => {
    sandbox.restore()
  })

})
