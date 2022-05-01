/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import React from 'react'
import { JSDOM } from 'jsdom'
import { createEvent, fireEvent, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import * as LocationAction from '../actions/location-action'
import Link, { LinkWrap } from './link'

const renderWithRouter = (children) => render(
  <MemoryRouter>
    {children}
  </MemoryRouter>
)

describe('Link Component', () => {

  let sandbox

  beforeEach(() => {
    const dom = new JSDOM('<html></html>')
    global.window = dom.window
    global.document = dom.window.document
    global.Element = dom.window.Element

    sandbox = sinon.createSandbox()
    sandbox.stub(LocationAction, 'push')
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should handle onClick', () => {
    const callback = sinon.stub()
    renderWithRouter(<Link to="/path" as={callback} />)
    chai.expect(callback.calledOnce).to.be.true
    chai.expect(callback.firstCall.args[0]).to.have.property('onClick')
      .and.is.a('function')
  })

  it('should push location through action', () => {
    const { getByText } = renderWithRouter(<LinkWrap to="/path">Click</LinkWrap>)
    fireEvent.click(getByText(/Click/))
    chai.expect(LocationAction.push.calledOnce).to.be.true
    chai.expect(LocationAction.push.lastCall.args[0]).to.equal('/path')
  })

  it('should prevent click default', () => {
    const { getByText } = renderWithRouter(<LinkWrap to="/path" as="div">Click</LinkWrap>)
    const event = createEvent.click(getByText(/Click/))
    fireEvent(getByText(/Click/), event)
    chai.expect(event.defaultPrevented).to.be.true
  })

  it('should be able style color', () => {
    const { getByText } = renderWithRouter(
      <Link
        to="/path"
        style={{ color: 'red' }}
      >
        {'Click'}
      </Link>
    )

    const link = getByText(/Click/)
    chai.expect(link.style).to.have.property('color', 'red')
  })

})
