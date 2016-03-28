import R from 'ramda';
import React from 'react';
import LocationAction from '../actions/location-action';
import { Link } from 'react-router';

const preventDefault = ({ event }) => {
  event.preventDefault();
};

const pushPath = ({ to }) => {
  LocationAction.push(to);
};

const goToArgs = (...args) => (
  R.zipObj(['to', 'event'], args)
);

const goTo = R.curryN(2,
  R.pipe(
    goToArgs,
    R.tap(pushPath),
    preventDefault
  )
);

export const LinkWrap = (props) => (
  <Link { ...props }
    onClick={ goTo(props.to) } />
);

export default LinkWrap;
