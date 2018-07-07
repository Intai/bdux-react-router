import * as R from 'ramda'
import React from 'react'
import { push } from '../actions/location-action'
import { Link } from 'react-router-dom'
import { createComponent } from 'bdux'

const cleanProps = R.omit(
  ['bdux', 'dispatch', 'bindToDispatch']
)

const goTo = ({ dispatch, to }) => (e) => {
  dispatch(push(to))
  e.preventDefault()
}

export const LinkWrap = (props) => (
  <Link
    {...cleanProps(props)}
    onClick={goTo(props)}
  />
)

export default createComponent(LinkWrap)
