# Bdux React Router

[![Build Status](https://travis-ci.org/Intai/bdux-react-router.svg?branch=master)](https://travis-ci.org/Intai/bdux-react-router)
[![Coverage Status](https://coveralls.io/repos/github/Intai/bdux-react-router/badge.svg?branch=master)](https://coveralls.io/github/Intai/bdux-react-router?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/94cc5ba0f92d43b995c3cc69b81efc8b)](https://www.codacy.com/app/intai-hg/bdux-react-router?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Intai/bdux-react-router&amp;utm_campaign=Badge_Grade)

## Want to achieve
- Record and travel back in the history of URL changes with [bdux-timetravel](https://github.com/Intai/bdux-timetravel).
- Utilise routing library [react-router](https://github.com/reactjs/react-router).

## Installation
To install as an [npm](https://www.npmjs.com/) package:
```sh
npm install --save bdux-react-router
```

## Usage
```javascript
import React from 'react'
import { Router, Route, createLocationHistory } from 'bdux-react-router'
import { LocationAction, LocationStore } from 'bdux-react-router'
import { createComponent } from 'bdux'

export const App = ({ location }) => (
  <Router history={createLocationHistory(location)}>
    <Route
      component={Page}
      path="/path"
    />
  </Router>
)

export default createComponent(App, {
  location: LocationStore
},
// start listening to browser history.
LocationAction.listen)
```
Browser history changes are captured in `LocationAction` to `LocationStore` then into `Router`. The router component itself does not listen to browser history directly. This data flow ensures routing can be recorded and replayed by middleware.

## Link
Link component is a convenient way to create a simple anchor element to update browser history through `LocationAction` without reloading the entire page.
```javascript
<Link to="/path">Text</Link>
```

For more complex scenarios, create components to work with `LocationAction.push` or `LocationAction.replace`. Underneath these two functions use library [history](https://github.com/mjackson/history). Refer to their documentation about [location](https://github.com/mjackson/history/blob/master/docs/Location.md) for details.
```javascript
import React from 'react'
import LocationAction from 'bdux-react-router'

const handleClick = ({ dispatch }) => () => {
  dispatch(LocationAction.push({
    pathname: '/path'
  }))
}

export default (props) => (
  <button onClick={handleClick(props)} />
)
```

## License
[The ISC License](./LICENSE.md)
