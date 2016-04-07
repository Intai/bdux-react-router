import R from 'ramda';
import Common from './utils/common-util';
import LocationAction from './actions/location-action';
import { createMemoryHistory } from 'react-router';

const history = createMemoryHistory();
const historyListen = history.listen;

history.listen = (() => {
  let prev = () => {};
  return (callback) => (
    (callback)
      ? ((prev = callback) && historyListen(callback))
      : prev
  );
})();

const getHistoryListen = R.partial(
  history.listen, [undefined]
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
  Common.defer
);

export const createLocationHistory = R.pipe(
  R.when(R.is(Object),
    // defer to be after render.
    deferUpdateLocation
  ),
  // always return the same react-router history
  // because it does not support changing history.
  R.always(history)
);
