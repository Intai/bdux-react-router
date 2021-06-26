# Bdux React Router

[![Build Status](https://travis-ci.com/Intai/bdux-react-router.svg?branch=master)](https://travis-ci.com/Intai/bdux-react-router)
[![Coverage Status](https://coveralls.io/repos/github/Intai/bdux-react-router/badge.svg?branch=master)](https://coveralls.io/github/Intai/bdux-react-router?branch=master)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/6e51138140e44317a20160124c995f4a)](https://www.codacy.com/gh/Intai/bdux-react-router/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Intai/bdux-react-router&amp;utm_campaign=Badge_Grade)

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
import { createUseBdux } from 'bdux'

const useBdux = createUseBdux({
  location: LocationStore
}, [
  // start listening to browser history.
  LocationAction.listen
])

function App(props) {
  const { state } = useBdux(props)
  const { location } = state

  return (
    <Router history={createLocationHistory(location)}>
      <Route
        component={Page}
        path="/path"
      />
    </Router>
  )
}

export default React.memo(App)
```
Browser history changes are captured in `LocationAction` to `LocationStore` then into `Router`. The router component itself does not listen to browser history directly. This data flow ensures routing can be recorded and replayed by middleware.

## Link
Link component is a convenient way to create a simple anchor element to update browser history through `LocationAction` without reloading the entire page.
```javascript
<Link to="/path">Text</Link>
```

For more complex scenarios, create components to work with `LocationAction.push` or `LocationAction.replace`. Underneath these two functions use library [history](https://github.com/mjackson/history). Refer to their documentation about [location](https://github.com/mjackson/history/blob/master/docs/Location.md) for details.
```javascript
import React, { useCallback } from 'react'
import LocationAction from 'bdux-react-router'
import { useBdux } from 'bdux'

function Button(props) {
  const { dispatch } = useBdux(props)

  const handleClick = useCallback(() => {
    dispatch(LocationAction.push({
      pathname: '/path'
    }))
  }, [])

  return (
    <button onClick={handleClick} />
  )
}

export default React.memo(Button)
```

## License
[The ISC License](./LICENSE.md)
