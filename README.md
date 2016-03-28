# Bdux React Router

## Want to achieve
- Record and travel back in the history of url changes with [bdux-timetravel](https://github.com/Intai/bdux-timetravel). 
- Utilise routing library [react-router](https://github.com/reactjs/react-router).

## Installation
To install as an [npm](https://www.npmjs.com/) package:
```
npm install --save bdux-react-router
```

## Usage
``` javascript
import React from 'react';
import Routes from '../routes';
import { Router, createLocationHistory } from 'bdux-react-router';
import { LocationAction, LocationStore } from 'bdux-react-router';
import { createComponent } from 'bdux'

export const App = ({ location }) => (
  <Router history={ createLocationHistory(location) }
    routes={ Routes } />
);

export default createComponent(App, {
  location: LocationStore
},
// start listening to browser history.
LocationAction.listen);
```
Browser history changes are captured in `LocationAction` to `LocationStore` then into `Router`. The router component itself does not listen to browser history directly. This data flow ensures routing can be recorded and replayed by middleware.

## Link

## License
[The ISC License](./LICENSE.md)
