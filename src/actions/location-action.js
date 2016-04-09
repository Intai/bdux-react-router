import R from 'ramda';
import Bacon from 'baconjs';
import Common from '../utils/common-util';
import Storage from '../utils/storage-util';
import ActionTypes from './action-types';
import { createHistory, createMemoryHistory } from 'history';
import { bindToDispatch } from 'bdux';

const createPlatformHistory = R.ifElse(
  Common.canUseDOM,
  createHistory,
  createMemoryHistory
);

const getHistory = (() => {
  let history;
  return () => (
    (history) ? history
      : (history = createPlatformHistory())
  );
})();

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

const createLocation = (location) => (
  getHistory().createLocation(location)
);

const mapLocation = R.ifElse(
  R.is(String),
  createLocation,
  R.identity
);

const updateHistory = R.curry((action, location) => {
  // if updating to a different location.
  if (!isCurrentLocation(location)) {
    // push or replace with the new location.
    getHistory()[action](cloneLocation(location));
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

const removeHistorySession = (location) => {
  Storage.remove('@@History/' + location.key);
};

const shouldDispatchAction = R.complement(
  R.allPass([
    R.is(Object),
    R.path(['state', 'skipAction'])
  ])
);

export const listen = onceThenNull(() => (
  Bacon.fromBinder((sink) => {
    return getHistory().listen(pushLocation(sink));
  })
  // remove session entry created by history library.
  .doAction(removeHistorySession)
  // don't dispatch another action from location-history.
  .filter(shouldDispatchAction)
  // remember the location object.
  .doAction(currentLocation)
  // create an action to update location store.
  .map(R.objOf('location'))
  .map(R.merge({
    type: ActionTypes.ROUTE_LOCATION_UPDATE
  }))
));

export const push = R.pipe(
  mapLocation,
  updateHistory('push')
);

export const replace = R.pipe(
  mapLocation,
  updateHistory('replace')
);

export default bindToDispatch({
  listen,
  push,
  replace
});
