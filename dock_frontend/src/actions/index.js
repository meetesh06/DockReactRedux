import axios from 'axios';
import History from '../History';
import {
  AUTH_USER,
  UNAUTH_USER,
  AUTH_ERROR
} from './types';

export const signinUser = ({ email, password }) => {
  return (dispatch) => {
    // submit email/password to the server
    axios.post('api/signin', { email, password })
      .then(response => {
        // if request is good...
        // - update state to indicate user is authenticated
        dispatch({ type: AUTH_USER });

        // - save the jwt token
        localStorage.setItem('token', response.data.token);

        // - redirect to the route '/feature'
        History.push('/');

      }).catch(() => {
        // if request is bad...
        // - show an error to the user
        dispatch(authError('Bad Login Info'));
      });
  };
};

export const signoutUser = () => {
  localStorage.removeItem('token');
  return { type: UNAUTH_USER };
};

export const authError = (error) => {
  return {
    type: AUTH_ERROR,
    payload: error
  };
};
