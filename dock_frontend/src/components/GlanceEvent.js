import React from 'react';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import PropTypes from 'prop-types';
const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 10
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    height: 100,
    margin: 5,
    color: theme.palette.text.secondary,
  }
});
class GlanceEvent extends React.Component {
  render() {
    const { classes } = this.props;
    return(
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={6} >
            <Paper style={{height: 235}} className={classes.paper}>xs=12</Paper>
          </Grid>
          <Grid container item xs={12} sm={6} >
            <Grid item xs={12} sm={6} >
              <Paper className={classes.paper}>xs=12</Paper>
              <Paper className={classes.paper}>xs=12</Paper>
            </Grid>
            <Grid item xs={12} sm={6} >
              <Paper style={{height: 235}} className={classes.paper}>xs=12</Paper>
            </Grid>
            
          </Grid>
          
        </Grid>
      </div>
    );
  }
}
GlanceEvent.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles) (GlanceEvent);