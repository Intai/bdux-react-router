import React from 'react'
import LocationAction from '../actions/location-action'
import { Link } from 'react-router-dom'

const goTo = ({ to }) => (e) => {
  LocationAction.push(to)
  e.preventDefault()
}

export const LinkWrap = (props) => (
  <Link
    {...props}
    onClick={goTo(props)}
  />
)

export default LinkWrap
