import React from 'react';
import ReactDOM from 'react-dom';
import App from './layouts/App';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'react-redux';
import store from './store';
import { AUTH_USER } from './actions/types';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#B2EBF2',
      main: '#00BCD4',
      dark: '#FF5252',
      contrastText: '#FFFFFF',
    },
    secondary: {
      light: '#963019',
      main: '#E040FB',
      dark: '#963019',
    },
  },
});

const token = localStorage.getItem('token');
if (token) {
  store.dispatch({ type: AUTH_USER });
}

ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <App/>
    </MuiThemeProvider>
  </Provider>, document.getElementById('root'));

registerServiceWorker();