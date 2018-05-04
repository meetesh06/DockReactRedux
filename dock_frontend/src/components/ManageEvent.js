import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import List, { ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import { IconButton } from 'material-ui';
import ModeEditIcon from '@material-ui/icons/ModeEdit';

const styles = theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
});

class ManageEvent extends React.Component {
  state = {
    checked: [1],
  };

  handleToggle = value => () => {
    const { checked } = this.state;
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.setState({
      checked: newChecked,
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <List>
          {[0, 1, 2, 3].map(value => (
            <ListItem key={value} dense button className={classes.listItem}>
              <Avatar alt="Remy Sharp" src="https://www.attractivepartners.co.uk/wp-content/uploads/2017/06/profile.jpg" />
              <ListItemText primary={'Photography Event'} secondary="Fashion, Art" />
              <ListItemSecondaryAction>
                <IconButton>
                  <ModeEditIcon/>
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </div>
    );
  }
}

ManageEvent.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ManageEvent);
