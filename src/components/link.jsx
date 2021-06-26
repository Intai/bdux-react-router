import React, { useMemo } from 'react'
import * as LocationAction from '../actions/location-action'
import { Link } from 'react-router-dom'
import { useBdux } from 'bdux'

const goTo = (to, dispatch) => (e) => {
  dispatch(LocationAction.push(to))
  e.preventDefault()
}

export function LinkWrap(props) {
  const { to } = props
  const { dispatch } = useBdux(props)
  const goToLink = useMemo(() => goTo(to, dispatch), [to, dispatch])

  return (
    <Link
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      onClick={goToLink}
    />
  )
}

export default React.memo(LinkWrap)
