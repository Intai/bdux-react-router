import React from 'react'
import * as LocationAction from '../actions/location-action'
import { Link } from 'react-router-dom'
import { useBdux } from 'bdux'

const goTo = (dispatch, { to }) => (e) => {
  dispatch(LocationAction.push(to))
  e.preventDefault()
}

export const LinkWrap = (props) => {
  const { dispatch } = useBdux(props)
  return (
    <Link
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      onClick={goTo(dispatch, props)}
    />
  )
}

export default React.memo(LinkWrap)
