import { omit } from 'ramda'
import React, { createElement, useMemo } from 'react'
import * as LocationAction from '../actions/location-action'
import { Link } from 'react-router-dom'
import { useBdux } from 'bdux'

const goTo = (to, dispatch) => (e) => {
  dispatch(LocationAction.push(to))
  e.preventDefault()
}

const cleanProps = (as, props) => {
  if (as === 'a') {
    return {
      href: props.to,
      ...omit(['as', 'to'], props),
    }
  }
  return omit(['as'], props)
}

export function LinkWrap(props) {
  const { to, as: LinkComponent = Link } = props
  const { dispatch } = useBdux(props)
  const goToLink = useMemo(() => goTo(to, dispatch), [to, dispatch])

  return createElement(LinkComponent, {
    ...cleanProps(LinkComponent, props),
    onClick: goToLink,
  })
}

export default React.memo(LinkWrap)
