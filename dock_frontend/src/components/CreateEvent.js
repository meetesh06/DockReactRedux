import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Stepper, { Step, StepLabel, StepContent } from 'material-ui/Stepper';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import { FormControl } from 'material-ui/Form';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import DateTimePicker from 'material-ui-pickers/DateTimePicker';
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';

import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import DateRangeIcon from '@material-ui/icons/DateRange';
import KeyboardIcon from '@material-ui/icons/Keyboard';

import Checkbox from 'material-ui/Checkbox';
import { FormControlLabel } from 'material-ui/Form';

const styles = theme => ({
  root: {
    width: '90%'
  },
  button: {
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  actionsContainer: {
    marginBottom: theme.spacing.unit * 2
  },
  resetContainer: {
    padding: theme.spacing.unit * 3
  },
  formControl: {
    marginBottom: theme.spacing.unit*5
  },
  pickers: {
    marginBottom: theme.spacing.unit*5
  }
});

function getSteps() {
  return ['Basic Event Details', 'Customize your event', 'Create an Event'];
}



class CreateEvent extends React.Component {
  state = {
    activeStep: 0,
    multiline: 'Controlled',
    eventName: '',
    eventDescription: '',
    eventStartDate: new Date(),
    eventEndDate: new Date(),
    checked: [],
    expanded: []
  };
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  }
  handleStartDateChange = (date) => {
    this.setState({ eventStartDate: date });
  }
  handleEndDateChange = (date) => {
    this.setState({ eventEndDate: date });
  }
  getStepContent(step) {
    switch (step) {
    case 0:
      return <div> 
        <FormControl fullWidth className={this.props.classes.formControl}>
          <TextField
            id="event_name"
            label="Title"
            margin="normal"
            value={this.state.eventName}
            onChange={this.handleChange('eventName')}
          />
          <TextField
            id="event_description"
            label="Description"
            multiline
            rows="3"
            rowsMax="10"
            value={this.state.eventDescription}
            onChange={this.handleChange('eventDescription')}
            margin="normal"
          />     
        </FormControl>
        <Grid className={this.props.classes.pickers} container spacing={24}>
          
          <Grid item xs={12} sm={6}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DateTimePicker
                fullWidth
                leftArrowIcon={<KeyboardArrowLeftIcon/>}
                rightArrowIcon={<KeyboardArrowRightIcon/>}
                timeIcon={<AccessTimeIcon/>}
                dateRangeIcon={<DateRangeIcon/>}
                keyboardIcon={<KeyboardIcon/>}
                value={this.state.selectedDate}
                onChange={this.handleStartDateChange}
                label="Event Start"
              />
            </MuiPickersUtilsProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DateTimePicker
                fullWidth
                leftArrowIcon={<KeyboardArrowLeftIcon/>}
                rightArrowIcon={<KeyboardArrowRightIcon/>}
                timeIcon={<AccessTimeIcon/>}
                dateRangeIcon={<DateRangeIcon/>}
                keyboardIcon={<KeyboardIcon/>}
                value={this.state.selectedDate}
                onChange={this.handleStartDateChange}
                label="Event Start"
              />
            </MuiPickersUtilsProvider>
          </Grid>
          
        </Grid>
        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.checkedA}
              onChange={this.handleChange('checkedA')}
              value="checkedA"
            />
          }
          label="Secondary"
        />
      </div>;
    case 1:
      return <Typography>{this.state.eventName}</Typography>;
    case 2:
      return `Try out different ad text to see what brings in the most customers,
                and learn how to enhance your ads using features like ad extensions.
                If you run into any problems with your ads, find out how to tell if
                they're running and how to resolve approval issues.`;
    default:
      return 'Unknown step';
    }
  }
  handleNext = () => {
    this.setState({
      activeStep: this.state.activeStep + 1,
    });
  };

  handleBack = () => {
    this.setState({
      activeStep: this.state.activeStep - 1,
    });
  };

  handleReset = () => {
    this.setState({
      activeStep: 0,
    });
  };

  handleDateChange = (date) => {
    this.setState({ selectedDate: date });
  }

  render() {
    const { classes } = this.props;
    const steps = getSteps();
    const { activeStep } = this.state;
    return (
      <div className={classes.root}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => {
            return (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  {this.getStepContent(index)}
                  <div className={classes.actionsContainer}>
                    <div>
                      <Button
                        disabled={activeStep === 0}
                        onClick={this.handleBack}
                        className={classes.button}
                      >
                        Back
                      </Button>
                      <Button
                        variant="raised"
                        color="primary"
                        onClick={this.handleNext}
                        className={classes.button}
                      >
                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                      </Button>
                    </div>
                  </div>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} className={classes.resetContainer}>
            <Typography>All steps completed - you&quot;re finished</Typography>
            <Button onClick={this.handleReset} className={classes.button}>
              Reset
            </Button>
          </Paper>
        )}
      </div>
    );
  }
}

CreateEvent.propTypes = {
  classes: PropTypes.object,
};

export default withStyles(styles)(CreateEvent);
