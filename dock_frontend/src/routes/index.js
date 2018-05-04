import React from 'react';
import { Route, Switch } from 'react-router-dom';
import RequireAuth from '../components/auth/require_auth';
import Login from '../components/Login';
import Dashboard from '../views/Dashboard';
import Events from '../views/Events';
import Bulletins from '../views/Bulletins';

const notFound = () => <h1>This is 404</h1>;

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" component={RequireAuth(Dashboard)} />
      <Route exact path="/login" component={Login} />
      <Route path="/events" component={RequireAuth(Events)} />
      <Route path="/bulletins" component={RequireAuth(Bulletins)} />
      <Route exact path="*" component={RequireAuth(notFound)} />
    </Switch>
  );
};

export default Routes;