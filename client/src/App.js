import React, {Fragment, useEffect} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './App.css';

import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Routes from './components/routing/Routes';

// Redux
import {Provider} from 'react-redux'
import store from './store'
import {loadUser} from './actions/auth'
import setAuthToken from './utils/setAuthToken';

if(localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  // Adding the empty brackets after the function forces the useEffect hook to only run once instead of indefinitely in a loop
  useEffect(() => {
    store.dispatch(loadUser());
  }, [])

  return(
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar />
          <Switch>
            <Route exact path='/' component={Landing} />
            <Route component={Routes} />
          </Switch>
        </Fragment>
      </Router>
  </Provider>
  )
};

export default App;
