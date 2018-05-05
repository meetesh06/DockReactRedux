import React from 'react';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import DashboardIcon from '@material-ui/icons/Dashboard';
import EventIcon from '@material-ui/icons/Event';
import ClassIcon from '@material-ui/icons/Class';
import NotificationsIcon from '@material-ui/icons/Notifications';
import HelpIcon from '@material-ui/icons/Help';
import ChatIcon from '@material-ui/icons/Chat';
import Divider from 'material-ui/Divider';
import Typography from 'material-ui/Typography';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class SidebarList extends React.Component {
  render() {
    const { selected } = this.props;
    return(
      <List component="nav">
        <ListItem component={Link} style={{backgroundColor: selected === 0 && '#FF5252' }} to="/" button>
          <ListItemIcon style={{ color: '#FFFFFF' }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary={<Typography type="body2" style={{ color: '#FFFFFF' }}>Dashboard</Typography>} />
        </ListItem>
        <ListItem component={Link} style={{backgroundColor: selected === 1 && '#FF5252' }} to="/events" button>
          <ListItemIcon style={{ color: '#FFFFFF' }}>
            <EventIcon />
          </ListItemIcon>
          <ListItemText primary={<Typography type="body2" style={{ color: '#FFFFFF' }}>Events</Typography>} />
        </ListItem>
        <ListItem component={Link} style={{backgroundColor: selected === 2 && '#FF5252' }} to="/bulletins" button>
          <ListItemIcon style={{ color: '#FFFFFF' }}>
            <ClassIcon />
          </ListItemIcon>
          <ListItemText primary={<Typography type="body2" style={{ color: '#FFFFFF' }}>Bulletins</Typography>} />
        </ListItem>
        <ListItem component={Link} style={{backgroundColor: selected === '4' && '#FF5252' }} to="/notifications" button>
          <ListItemIcon style={{ color: '#FFFFFF' }}>
            <NotificationsIcon />
          </ListItemIcon>
          <ListItemText primary={<Typography type="body2" style={{ color: '#FFFFFF' }}>Notifications</Typography>} />
        </ListItem>
        <Divider />
        <ListItem component={Link} style={{backgroundColor: selected === 4 && '#FF5252' }} to="/chats" button>
          <ListItemIcon style={{ color: '#FFFFFF' }}>
            <ChatIcon />
          </ListItemIcon>
          <ListItemText primary={<Typography type="body2" style={{ color: '#FFFFFF' }}>Chats</Typography>} />
        </ListItem>
        <ListItem component={Link} style={{backgroundColor: selected === '6' && '#FF5252' }}  to="/help" button>
          <ListItemIcon style={{ color: '#FFFFFF' }}>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText primary={<Typography type="body2" style={{ color: '#FFFFFF' }}>Help</Typography>} />
        </ListItem>
      </List>
    );
  }
}
SidebarList.propTypes = {
  selected: PropTypes.number.isRequired
};

const mapStateToProps = (state) => {
  return { selected: state.status.selected };
};

export default connect(mapStateToProps) (SidebarList);