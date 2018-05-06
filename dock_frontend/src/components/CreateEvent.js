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
import Dropzone from 'react-dropzone';

import Card, { CardActions } from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';

import DeleteIcon from '@material-ui/icons/Delete';
import { FormControlLabel } from 'material-ui/Form';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';

import IconButton from 'material-ui/IconButton';

import Tree from '../components/Tree';

const data = [
  {
    'label': 'FET',
    'children': [
      {
        'label': 'FET-CSE',
        'children': [
          {
            'label': 'FET-CSE-SEM4',
            'children': [
              {
                'label': '4CSA'
              },
              {
                'label': '4CSB'
              },
              {
                'label': '4CSC'
              }
            ]
          },
          {
            'label': 'FET-CSE-SEM6',
            'children': [
              {
                'label': '6BAO'
              }
            ]
          },
        ]
      },
      {
        'label': 'FET-ECE',
        'children': [
          {
            'label': 'FET-ECE-SEM4'
          },
          {
            'label': 'FET-ECE-SEM6'
          }
        ]
      },
      {
        'label': 'FET-CIVIL',
        'children': [
          {
            'label': 'FET-CIVIL-SEM4'
          },
          {
            'label': 'FET-CIVIL-SEM6'
          }
        ]
      },
      
    ]
  }
];

const styles = theme => ({
  root: {
    width: '100%'
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
  },
  imagePreview: {
    width: 100+'%',
    height: 150,
    objectFit: 'cover'
  },
  dropSpace: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
    padding: theme.spacing.unit
  },
  cover: {
    width: 151,
    height: 151,
  },
  checked: {
    color: '#00BCD4'
  }
});

function getSteps() {
  return ['Basic Event Details', 'Customize your event', 'Select your audience', 'Payment and other details'];
}

class CreateEvent extends React.Component {
  constructor(props) {
    super(props);
    this.saveTreeState = this.saveTreeState.bind(this);
  }
  state = {
    activeStep: 0,
    multiline: 'Controlled',
    eventName: '',
    eventDescription: '',
    eventStartDate: new Date(),
    eventEndDate: new Date(),
    checked: [],
    expanded: [],
    eventNameErr: false,
    eventDescErr: false,
    eventDateErr: false,
    imageFiles: [],
    audience: [],
    audienceToSend: [],
    dataAudience: data.slice(0)
  };
  handleChange = name => event => {
    var eventNameErr;
    if ( !(this.state.eventName.length > 3 && this.state.eventName.length < 25 ) ) {
      eventNameErr = true;
    } else {
      eventNameErr = false;
    }
    var eventDescErr;
    if (!( this.state.eventDescription.length > 3 && this.state.eventDescription.length <= 800 )) {
      eventDescErr = true;
    } else {
      eventDescErr = false;
    }
    var eventDateErr;
    if (!( this.state.eventStartDate <= this.state.eventEndDate )) {
      eventDateErr = false;
    } else {
      eventDateErr = true;
    }

    this.setState({
      eventNameErr,
      eventDescErr,
      eventDateErr,
      [name]: event.target.value,
    });
  }
  handleStartDateChange = (date) => {
    this.setState({ eventStartDate: date });
  }
  handleEndDateChange = (date) => {
    this.setState({ eventEndDate: date });
  }

  onDrop(imageFiles) {
    this.setState({
      imageFiles: imageFiles
    });
  } 

  setPoster(number) {
    const a = this.state.imageFiles;
    if (!a[number].poster) {
      a[number].poster =  true;
    } else {
      a[number].poster = !a[number].poster;
    }
    this.setState({imageFiles: a});
  }

  removeImage(number) {
    const a = this.state.imageFiles;
    a.splice(number, 1);
    this.setState({
      imageFiles: a
    });
  }

  saveTreeState(deselectedNodes, selectedNodes) {
    var dataAudience = this.state.dataAudience;
    deselectedNodes.map((node) => {
      var path = node._id.split('-');
      var i;
      var last = dataAudience[path[0]];
      for(i=1;i<path.length;i++) {
        last = last.children[path[i]];
      }
      last['checked'] = false;
    });
    selectedNodes.map((node) => {
      var path = node._id.split('-');
      var i;
      var last = dataAudience[path[0]];
      for(i=1;i<path.length;i++) {
        last = last.children[path[i]];
      }
      last['checked'] = true;
    });
    this.setState({dataAudience});
  }

  // onTreeChange(currentNode, selectedNodes) {
  //   const dataAudience = this.state.dataAudience;
  //   const audience = [];
  //   var path = currentNode._id.split('-');
  //   var i;
  //   var last = dataAudience[path[0]];
  //   for(i=1;i<path.length;i++) {
  //     last = last.children[path[i]];
  //   }
  //   last['checked'] = currentNode.checked ? true : false;

  //   selectedNodes.map((node) => {
  //     audience.push(node.label);
  //   });

  //   console.log(dataAudience, audience);
  //   this.setState({dataAudience, audience});
    
  // }
  

  getStepContent(step) {
    const { classes } = this.props; 
    switch (step) {
    case 0:
      return <div> 
        <FormControl fullWidth className={this.props.classes.formControl}>
          <TextField
            required
            id="event_name"
            label="Title"
            margin="normal"
            error={this.state.eventNameErr}
            value={this.state.eventName}
            inputProps={{maxLength: 24, minLength: 3}}
            onChange={this.handleChange('eventName')}
          />
          <TextField
            required
            id="event_description"
            label="Description"
            multiline
            error={this.state.eventDescErr}
            inputProps={{maxLength: 800, minLength: 4}}
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
                value={this.state.eventStartDate}
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
                value={this.state.eventEndDate}
                onChange={this.handleEndDateChange}
                label="Event End"
              />
            </MuiPickersUtilsProvider>
          </Grid>          
        </Grid>
      </div>;
    case 1:
      return <div>
        <Typography variant="headline" gutterBottom>Select Your Poster</Typography>
        <Dropzone
          onDrop={this.onDrop.bind(this)} //<= Here
          className='dropzone'
          activeClassName='active-dropzone'
          multiple={true}>
          <div className={classes.dropSpace}>
            <Button size="small" color="secondary">
              Upload Image or drag them here
            </Button>
          </div>
        </Dropzone>
        <Grid container spacing={24} alignItems='center'>
          {this.state.imageFiles.length > 0 && this.state.imageFiles.map((file, number) =>{ 
            return (
              <Grid key={number} item xs={12} md={3} sm={4}>
                <Card className={classes.card}>
                  <img className={this.props.classes.imagePreview} alt='' src={file.preview} />
                  <CardActions>
                    <FormControlLabel
                      style={{flex: 1}}
                      control={
                        <Checkbox onClick={()=>this.setPoster(number)} icon={<AddAPhotoIcon />} checkedIcon={<AddAPhotoIcon />} color='primary' checked={ file.poster? true : false } />
                      }
                      label="Use as Cover"
                    />
                    <IconButton onClick={()=>this.removeImage(number)} aria-label="Delete" color="default">
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          } )}
          
        </Grid>
        <Grid style={{marginTop: 20}} container spacing={24} alignItems='center'>
          <Grid item xs={12} md={3} sm={4}>
            <Typography>How many people in a team ? Students will be able to make teams and participate</Typography>
          </Grid>
          <Grid item xs={12} md={3} sm={4}>
            <TextField
              required
              id="event_team_size"
              label="Team Size"
              margin="normal"
              defaultValue="1"
              value={this.state.eventTeamSize}
              inputProps={{min: 1}}
              type="number"
              onChange={this.handleChange('eventName')}
            />
          </Grid>
          <Grid item xs={12} md={6} sm={4}> </Grid>

          <Grid item xs={12} md={12} sm={12}>
            <Typography variant="headline">Contact Details</Typography>
          </Grid>
          <Grid item xs={12} md={3} sm={4}>
            <TextField
              fullWidth
              label="Coordinator 1 Name"
              margin="normal"
            />
            <TextField
              fullWidth
              label="email/phone"
              margin="normal"
            />
            <TextField
              fullWidth
              required
              label="Other details"
              multiline
              inputProps={{maxLength: 140, minLength: 4}}
              rows="3"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={3} sm={4}>
            <TextField
              fullWidth
              style={{marginLeft: 5, marginRight: 5 }}
              label="Coordinator 2 Name"
              margin="normal"
            />
            <TextField
              fullWidth
              style={{marginLeft: 5, marginRight: 5 }}
              label="email/phone"
              margin="normal"
            />
            <TextField
              fullWidth
              style={{marginLeft: 5, marginRight: 5 }}
              required
              label="Other details"
              multiline
              inputProps={{maxLength: 140, minLength: 4}}
              rows="3"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={3} sm={4}>
            <TextField
              fullWidth
              style={{marginLeft: 5, marginRight: 5 }}
              label="Coordinator 3 Name"
              margin="normal"
            />
            <TextField
              fullWidth
              style={{marginLeft: 5, marginRight: 5 }}
              label="email/phone"
              margin="normal"
            />
            <TextField
              fullWidth
              style={{marginLeft: 5, marginRight: 5 }}
              required
              label="Other details"
              multiline
              inputProps={{maxLength: 140, minLength: 4}}
              rows="3"
              margin="normal"
            />
          </Grid>
          
        </Grid>
      </div>;
    case 2:
      return <div style={{height:200}}><Tree saveTreeState={this.saveTreeState}  dataAudience={this.state.dataAudience}/></div> ;
    case 3:
      return 'Payment and contact details';
    default:
      return 'Unknown step';
    }
  }

  stepFulfulled = (current) => {
    switch(current) {
    case 0:
      if ( (this.state.eventName.length > 3 && this.state.eventName.length < 25 ) 
          && ( this.state.eventDescription.length > 3 && this.state.eventDescription.length <= 800 ) && ( this.state.eventStartDate <= this.state.eventEndDate ) ) {
        return true;
      }
      return false;
    case 1:
      if(this.state.imageFiles.length > 0) {
        return true;
      }
      return false;
    default:
      return false;
    }
  }

  handleNext = () => {
    if(this.stepFulfulled(this.state.activeStep)) {
      this.setState({
        activeStep: this.state.activeStep + 1,
      });
    }
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

  handleStartDateChange = (date) => {
    this.setState({ eventStartDate: date });
    if (!(this.state.eventEndDate >= date)) {
      this.setState({ eventEndDate: date });
    }
  }
  
  handleEndDateChange = (date) => {
    if (date >= this.state.eventStartDate){
      this.setState({ eventEndDate: date });
    } else {
      this.setState({ eventEndDate: this.state.eventStartDate });
    }
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
