import R from 'ramda';
import Common from './utils/common-util';
import LocationAction from './actions/location-action';
import { createMemoryHistory } from 'react-router';

const proxyHistoryListen = R.tap((history) => {
  let historyListen = history.listen;
  let prevListen = () => {};

  history.listen = (callback) => (
    (callback)
      ? ((prevListen = callback) && !Common.canUseDOM() && historyListen(callback))
      : prevListen
  );
});

const createHistory = (location) => (
  proxyHistoryListen(
    (location)
    ? createMemoryHistory(location)
    : createMemoryHistory())
);

const getHistory = (() => {
  let history;
  return (location) => (
    (history) ? history
      : (history = createHistory(location))
  );
})();

const getHistoryListen = R.pipe(
  getHistory,
  R.prop('listen'),
  R.call
);

const pushHistoryListen = R.converge(
  R.call, [
    // get the callback currently
    // bound to react-router history listen.
    getHistoryListen,
    // the new location.
    R.identity
  ]
);

const updateLocation = R.pipe(
  // update browser history through action.
  R.tap(LocationAction.replace),
  // trigger react-router history listen.
  pushHistoryListen
);

const deferForDom = (...args) => {
  if (Common.canUseDOM()) {
    R.apply(Common.defer, args);
  }
};

const deferUpdateLocation = R.wrap(
  updateLocation,
  deferForDom
);

export const createLocationHistory = R.pipe(
  // initialise history.
  R.tap(getHistory),
  R.when(R.is(Object),
    // defer to be after render.
    deferUpdateLocation
  ),
  // always return the same react-router history
  // because it does not support changing history.
  getHistory
);
