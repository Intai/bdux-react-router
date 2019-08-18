/* eslint-env mocha */

import chai from 'chai'
import {
  cloneLocation,
  isLocationEqual,
} from './location-util'

describe('Location Utilities', () => {

  it('should clone a location', () => {
    const location = { pathname: '/test' }
    chai.expect(cloneLocation(location)).to.not.equal(location)
  })

  it('should clone a falsy location', () => {
    chai.expect(cloneLocation(null)).to.eql({
      pathname: undefined,
      search: '',
      state: {},
    })
  })

  it('should clone a location with search and state', () => {
    const location = {
      pathname: '/test/search',
      hash: 'section',
      search: 'query',
      state: {
        param: 123,
        skipAction: true,
      },
    }
    chai.expect(cloneLocation(location)).to.eql({
      pathname: '/test/search',
      search: 'query',
      state: {
        param: 123,
      },
    })
  })

  it('should compare two locations', () => {
    const loc1 = { pathname: '/equal' }
    const loc2 = { pathname: '/equal' }
    chai.expect(isLocationEqual(loc1, loc2)).to.be.true
  })

  it('should distinguish two different locations', () => {
    const loc1 = { pathname: '/diff1' }
    const loc2 = { pathname: '/diff2' }
    chai.expect(isLocationEqual(loc1, loc2)).to.be.false
  })

  it('should compare with falsy location', () => {
    const loc1 = { pathname: '/falsy' }
    const loc2 = undefined
    chai.expect(isLocationEqual(loc1, loc2)).to.be.false
  })

  it('should compare different falsy locations', () => {
    const loc1 = null
    const loc2 = undefined
    chai.expect(isLocationEqual(loc1, loc2)).to.be.true
  })

})
