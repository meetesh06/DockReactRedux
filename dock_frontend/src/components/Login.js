import React from 'react';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import { InputAdornment } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import IconButton from 'material-ui/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';
import { connect } from 'react-redux';
import Typography from 'material-ui/Typography';
import Snackbar from 'material-ui/Snackbar';
import '../css/Login.css';
import * as actions from '../actions';
import PropTypes from 'prop-types';
import { LinearProgress } from 'material-ui/Progress';

import {
  Redirect
} from 'react-router-dom';


const styles = theme => ({
  root: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 5,
  }),
  wrapper: {
    margin: theme.spacing.unit,
    position: 'relative',
  },
  close: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4,
  }
});

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  state = {
    showPassword: false,
    open: false,
    auth: false,
    email: null,
    password: null,
    loading: false
  };
  componentWillMount() {
    sessionStorage.removeItem('draft');
    localStorage.removeItem('token');
  }
  handleClick = () => {
    this.setState({ open: true });
  };
  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ open: false });
  };
  handleClickShowPassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };
  handleChange = prop => event => {
    this.setState({ [prop]: event.target.value });
  };
  handleSubmit(event) {
    event.preventDefault();
    if (!this.state.loading) {
      this.setState(
        {
          loading: true
        },
        () => {
          this.timer = setTimeout(() => {
            this.setState({
              loading: false
            });
          }, 500);
        },
      );
      this.props.signinUser({email: this.state.email, password: this.state.password});
    }
    
  }
  checkAuthenticted() {
    if (this.props.auth.authenticated === true) {
      return <Redirect to='/' />;
    }
  }
  render() {
    const { classes } = this.props;
    const { loading } = this.state;
    const error = this.props.auth.error;
    return(
      <div style={{flexGrow: 1}}>
        {this.checkAuthenticted()}
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={error!==''}
          autoHideDuration={500}
          onClose={this.handleClose}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{error}</span>}
        />
        <Grid container  >
          <Grid item xs={1} sm={3} md={4}>
          </Grid>
          <Grid item xs={10} sm={6} md={4} className='dope'>
            <Paper className={classes.root} style={{flexGrow: 1}} >
              <form onSubmit={this.handleSubmit} >
                <Typography> Please login to continue </Typography>
                <FormControl autoFocus fullWidth margin='normal'>
                  <TextField
                    id="email"
                    type="email"
                    required
                    label="Email"
                    className={classes.textField}
                    value={this.state.name}
                    onChange={this.handleChange('email')}
                    margin="normal"
                  />
                  <TextField
                    id="password-input"
                    label="Password"
                    required
                    type={this.state.showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    onChange={this.handleChange('password')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">
                        <IconButton
                          aria-label="Toggle password visibility"
                          onClick={this.handleClickShowPassword}
                          onMouseDown={this.handleMouseDownPassword}
                        >
                          {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }}
                  />
                </FormControl>
                <div className={classes.wrapper}>
                  <Button
                    type="submit"
                    variant="raised"
                    color="primary"
                    style={{width: 100+'%', marginTop: 30+'px'}}
                    disabled={loading}
                  >
                    Login
                  </Button>
                  {loading && <LinearProgress />}
                </div>
              </form>
            </Paper>
          </Grid>
          <Grid item xs={3}>
          </Grid>
        </Grid>
        <div className='footerLogin'>
          <Typography style={{marginRight: 50}} variant="caption" gutterBottom align="right">
            Copyright 2018 Campus Dock
          </Typography>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return { auth: state.auth };
};

Login.propTypes = {
  signinUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired
};

export default connect(mapStateToProps, actions)(withStyles(styles) (Login));