import R from 'ramda';
import Bacon from 'baconjs';
import Common from '../utils/common-util';
import ActionTypes from './action-types';
import { createHistory, createMemoryHistory } from 'history';
import { bindToDispatch } from 'bdux';

const history = (Common.canUseDOM())
  ? createHistory()
  : createMemoryHistory();

const currentLocation = (() => {
  let prev = {};
  return (location) => (
    (location)
      ? (prev = location)
      : prev
  );
})();

const getCurrentLocation = R.partial(
  currentLocation, [undefined]
);

const cloneLocation = R.pick(
  ['pathname', 'search', 'state']
);

const isEqual = R.useWith(
  R.equals, [
    cloneLocation,
    cloneLocation
  ]
);

const isCurrentLocation = R.converge(
  isEqual, [
    R.identity,
    getCurrentLocation
  ]
);

const updateHistory = R.curry((action, location) => {
  // if updating to a different location.
  if (!isCurrentLocation(location)) {
    // push or replace with the new location.
    history[action](cloneLocation(location));
  }
});

const onceThenNull = (func) => {
  let count = 0;
  return (...args) => (
    (count++ <= 0)
      ? func.apply(func, args)
      : null
  );
};

const pushLocation = R.curry((sink, location) => {
  sink(location);
});

export const listen = onceThenNull(() => (
  Bacon.fromBinder((sink) => {
    return history.listen(pushLocation(sink));
  })
  .doAction(currentLocation)
  .map(R.objOf('location'))
  .map(R.merge({
    type: ActionTypes.ROUTE_LOCATION_UPDATE
  }))
));

export const push = updateHistory(
  'push'
);

export const replace = updateHistory(
  'replace'
);

export default bindToDispatch({
  listen,
  push,
  replace
});
