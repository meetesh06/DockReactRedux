import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './reducers';
import reduxThunk from 'redux-thunk';
import logger from 'redux-logger';

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(reduxThunk),
    applyMiddleware(logger),
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
  )
);

export default store;