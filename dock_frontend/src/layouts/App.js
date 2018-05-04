import React from 'react';
import { withStyles } from 'material-ui/styles';
import styles from './AppS';
import { BrowserRouter as Router } from 'react-router-dom';
import classNames from 'classnames';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import SidebarList from '../lists/SidebarList';
import Typography from 'material-ui/Typography';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Routes from '../routes';
import './App.css';
import IconButton from 'material-ui/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import * as actions from '../actions';

import Avatar from 'material-ui/Avatar';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';


class App extends React.Component {
  state = {
    open: false
  }
  handleLogout = () => {
    this.props.signoutUser();
  }
  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes, theme } = this.props;
    const auth = this.props.authenticated;
    return(
      <Router>
        <div className={classes.root}>
          <AppBar
            position="absolute"
            className={classNames(classes.appBar, auth && this.state.open && classes.appBarShift)}>
            <Toolbar disableGutters={!this.state.open}>
              { auth && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={this.handleDrawerOpen}
                  className={classNames(classes.menuButton, this.state.open && classes.hide)}>
                  <MenuIcon />
                </IconButton>
              )}
              <Typography align='center' style={{flexGrow: 1}} variant='title' color="inherit" noWrap>
                Campus Dock
              </Typography>
              
              {auth && <div>
                <IconButton
                  onClick={this.handleLogout}
                  color="inherit">
                  <ExitToAppIcon />
                </IconButton>  
              </div>
              }

            </Toolbar>
          </AppBar>
          { auth && (
            <Drawer
              variant="permanent"
              className='side'
              classes={{
                paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
              }}
              open={this.state.open}>
              <div className={classes.toolbar} >
                <IconButton style={{ color: '#FFFFFF' }}>
                  <AccountCircle />
                </IconButton>
                {this.state.open && <div className={classes.row}>
                  <Avatar
                    alt="Username"
                    src="https://www.attractivepartners.co.uk/wp-content/uploads/2017/06/profile.jpg"
                    className={classNames(classes.avatar, classes.bigAvatar)}
                  />
                </div>}
                <IconButton style={{ color: '#FFFFFF' }} onClick={this.handleDrawerClose}>
                  {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
              </div>            
              <SidebarList/>
            </Drawer>
          )}
          <main className={classes.content}>
            <div className={classes.toolbar}/>
            <Routes/>
            {auth && <div className='footer'>
              <Typography style={{marginRight: 20}} variant="caption" gutterBottom align="right">
                Copyright 2018 Campus Dock
              </Typography>
            </div>}
          </main>
        </div>
      </Router>
    );
  }
}
const mapStateToProps = (state) => {
  return { authenticated: state.auth.authenticated };
};

App.propTypes = {
  authenticated: PropTypes.bool,
  classes: PropTypes.object,
  signoutUser: PropTypes.func,
  theme: PropTypes.object.isRequired
};

export default connect(mapStateToProps, actions)(withStyles(styles, { withTheme: true })(App));
