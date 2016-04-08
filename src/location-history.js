import R from 'ramda';
import Common from './utils/common-util';
import LocationAction from './actions/location-action';
import { createMemoryHistory } from 'react-router';

const replaceHistoryListen = (passthrough, history) => {
  let historyListen = history.listen;
  let prevListen = () => {};

  history.listen = (callback) => (
    (callback)
      // passthrough to initialise with a location.
      ? ((prevListen = callback) && passthrough && historyListen(callback))
      : prevListen
  );

  return history;
};

const proxyHistoryListen = R.partial(
  replaceHistoryListen, [true]
);

const hijackHistoryListen = R.partial(
  replaceHistoryListen, [false]
);

const getPathname = R.ifElse(
  R.is(Object),
  R.prop('pathname'),
  R.identity
);

const createHistoryWithLocation = (location) => (
  proxyHistoryListen(
    createMemoryHistory(getPathname(location)))
);

const createHistoryWithoutLocation = () => (
  hijackHistoryListen(
    createMemoryHistory())
);

const createHistory = R.ifElse(
  R.identity,
  createHistoryWithLocation,
  createHistoryWithoutLocation
);

const historyProp = (() => {
  let history;
  let setHistory = (location) => (
    history = createHistory(location)
  );

  return {
    setHistory,
    getHistory: (location) => (
      (history) ? history
        : setHistory(location)
    )
  };
})();

const getHistory = (
  historyProp.getHistory
);

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

const deferUpdateLocation = R.wrap(
  updateLocation,
  Common.deferOnClient
);

export const resetLocationHistory = (
  // force to recreate history.
  historyProp.setHistory
);

export const createLocationHistory = R.pipe(
  // initialise history if hasn't.
  R.tap(getHistory),
  R.when(R.is(Object),
    // defer to be after render.
    deferUpdateLocation
  ),
  // always return the same react-router history
  // because it does not support changing history.
  getHistory
);
