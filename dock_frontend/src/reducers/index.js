import { combineReducers } from 'redux';
import { reducer as authReducer } from './auth';
import { reducer as statusReducer } from './status';

const rootReducer = combineReducers({
  auth: authReducer,
  status: statusReducer
});

export default rootReducer;
