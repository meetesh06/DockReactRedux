import React from 'react';
import { withStyles } from 'material-ui/styles';
import Tabs, { Tab } from 'material-ui/Tabs';
import PropTypes from 'prop-types';
import GlanceEvent from '../components/GlanceEvent';
import CreateEvent from '../components/CreateEvent';
import ManageEvent from '../components/ManageEvent';
import { Route, Switch } from 'react-router-dom';
import RequireAuth from '../components/auth/require_auth';
import { connect } from 'react-redux';

const styles = {
  root: {
    flexGrow: 1,
  },
};

class Events extends React.Component {
  componentDidMount() {
    if (this.props.selected !== 1) this.props.update();
  }
  render() {
    const { history } = this.props;
    return(
      <div>
        <Tabs value={history.location.pathname}>
          <Tab
            value='/events'
            label='Glance'
            onClick={() => history.push('/events')}/>
          <Tab
            value='/events/create'
            label='Create'
            onClick={() => history.push('/events/create')}
          />
          <Tab
            value='/events/manage'
            label='Manage'
            onClick={() => history.push('/events/manage')}
          />
        </Tabs>
        <Switch>
          <Route exact path="/events" component={RequireAuth(GlanceEvent)} />
          <Route exact path="/events/create" component={RequireAuth(CreateEvent)} />
          <Route exact path="/events/manage" component={RequireAuth(ManageEvent)} />
        </Switch>
      </div>
    );
  }
}
Events.propTypes = {
  classes: PropTypes.object.isRequired,
  selected: PropTypes.number.isRequired,
  update: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
  return { selected: state.status.selected };
};
const mapDispatchToProps = (dispatch) => {
  return {
    update: () => {
      dispatch({
        type: 'UPDATE_ROUTE',
        payload: 1
      });
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps) (withStyles(styles) (Events));