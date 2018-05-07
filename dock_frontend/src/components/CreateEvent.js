import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Stepper, { Step, StepLabel, StepContent } from 'material-ui/Stepper';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
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

import Card from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';

import DeleteIcon from '@material-ui/icons/Delete';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import StarIcon from '@material-ui/icons/Star';

import IconButton from 'material-ui/IconButton';

import Tree from '../components/Tree';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import '../css/CreateEvent.css';
import Chip from 'material-ui/Chip';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';

import SendIcon from '@material-ui/icons/Send';

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
    flex: 1
  },
  button: {
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  myHolder: {
    padding: 5,
    margin: 5
  },
  customHelper: {
    color: 'rgba(0, 0, 0, 0.54)',
    margin: '0',
    fontSize: '0.75rem',
    textAlign: 'left',
    marginTop: '8px',
    minHeight: '1em',
    fontFamily: '"Roboto", "Helvetica", "Arial","sans-serif" ',
    lineHeight: '1em',
    display: 'block',
    marginBefore: '1em',
    marginAfter: '1em',
    marginStart: '0px',
    marginEnd: '0px',
  },
  media: {
    width: 100+'%',
    height: 150,
    objectFit: 'cover'
  },
  card: {
    height: 'auto',
    margin: 5
  },
  image_btn: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 5
  },
  chip: {

  }
});

function getSteps() {
  return ['Basic Event Details', 'Customize your event', 'Select your audience', 'Payment and other details'];
}

class CreateEvent extends React.Component {
  constructor(props) {
    super(props);
    this.saveTreeState = this.saveTreeState.bind(this);
    this.handleChangeDescription = this.handleChangeDescription.bind(this);
    this.addChip = this.addChip.bind(this);
  }
  state = {
    activeStep: 0,
    multiline: 'Controlled',
    checked: [],
    expanded: [],
    imageFiles: [],
    audience: [],
    audienceToSend: [],
    dataAudience: data.slice(0),
    draft: { name: '', description: '', start: new Date(), end: new Date(), team: 1, tags: [], tagTemp: ''}
  };
  componentWillUnmount() {
    console.log(this.state.draft);
  }
  handleChange = name => event => {
    this.setState({
      draft: { ...this.state.draft, [name]: event.target.value }
    });
  }
  handleChangeDescription(value) {
    if(value.length <= 800 ) {
      this.setState({
        draft: { ...this.state.draft, description: value}
      });
    } else {
      this.setState({
        draft: { ...this.state.draft, description: this.state.draft.description}
      });
    }
  }
  handleStartDateChange = (date) => {
    if (!((this.state.draft.end - date) >= 0)) {
      this.setState({ draft: { ...this.state.draft, end: date, start: date} });
    } else {
      this.setState({ draft: { ...this.state.draft, start: date} });
    }
  }
  handleEndDateChange = (date) => {
    if (date >= this.state.draft.start){
      this.setState({ draft: { ...this.state.draft, end: date} });
    } else {
      this.setState({ draft: { ...this.state.draft, end: this.state.draft.start} });
    }
  }
  stepFulfulled = (current) => {
    switch(current) {
    case 0:
      if ( (this.state.draft.name.length >= 4 && this.state.draft.name.length <= 60) 
          && (this.state.draft.description.length >= 15 && this.state.draft.description.length <= 800) 
          && ( this.state.draft.start <= this.state.draft.end ) ) {
        return true;
      }
      break;
    case 1:
      if(this.state.imageFiles.length > 0) {
        return true;
      }
    }
    return false;
  }
  handleNext = () => {
    if(this.stepFulfulled(this.state.activeStep)) {
      this.setState({
        activeStep: this.state.activeStep + 1,
      });
    }
  };

  onDrop(acceptedFiles, rejectedFiles) {
    var toAdd = [...this.state.imageFiles];
    var current = acceptedFiles.length;
    var i;
    for(i=1;i<=current;i++) {
      if(toAdd.length >= 4) {
        console.log('image buffer full');
      } else {
        toAdd.push(acceptedFiles[i-1]);
      }
    }
    this.setState({
      imageFiles: toAdd
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
    console.log('removed a file', a);
    this.setState({
      imageFiles: a
    });
  }
  // inefficient code
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
      return true;
    });
    selectedNodes.map((node) => {
      var path = node._id.split('-');
      var i;
      var last = dataAudience[path[0]];
      for(i=1;i<path.length;i++) {
        last = last.children[path[i]];
      }
      last['checked'] = true;
      return true;
    });
    this.setState({dataAudience});
  }

  addChip() {
    if(this.state.draft.tagTemp.length > 3) {
      this.setState({
        draft: { ...this.state.draft, tagTemp: '', tags: [ ...this.state.draft.tags, this.state.draft.tagTemp ] },
      });
    }
  }
  removeChip = (number) => {
    const newArr = this.state.draft.tags;
    newArr.splice(number,1);
    this.setState({
      draft: { ...this.state.draft, tags: newArr }
    });
  }
  getStepContent(step) {
    const { classes } = this.props; 
    const descriptionErr = !((this.state.draft.description.length == 0) || (this.state.draft.description.match(/(<.{1,3}>)(.{0}|<br>)(<\/.{1,3}>)/))) && (this.state.draft.description.length >= 800 || this.state.draft.description.length <= 15);
    switch (step) {
    case 0:
      return <div> 
        <Grid container> 
          <Grid item xs={12} sm={8} className={classes.myHolder} >
            <Typography variant="headline">Event Name</Typography>
            <TextField
              label="Title"
              helperText="You want this to be short and sweet"
              onChange={this.handleChange('name')}
              inputProps={{maxLength: 60, minLength: 4}}
              error={ this.state.draft.name.length !== 0 && (this.state.draft.name.length <= 3 || this.state.draft.name.length > 60) ? true : false }
              fullWidth
              autoFocus
              value={this.state.draft.name}
            />
          </Grid> 
          <Grid item xs={12} sm={4}></Grid>
          <Grid item xs={12} sm={8} className={classes.myHolder}>
            <Typography variant="headline" style={{marginBottom:5 }} >Description</Typography>
            <ReactQuill style={{width: 100+'%'}} value={this.state.draft.description} onChange={this.handleChangeDescription} placeholder="Event description here" />  
            <Typography className={classes.customHelper} style={{color: descriptionErr ? '#FF5252':'', fontWeight: descriptionErr ? 'bold':''}}>Description must be between 8 to 800 characters </Typography>
          </Grid> 
          <Grid item xs={12} sm={4}></Grid>
          <Grid item xs={12} sm={8} className={classes.myHolder}>
            <Typography variant="headline">Date and Time</Typography>
            <Grid container>
              <Grid item xs={12} sm={5}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <DateTimePicker
                    leftArrowIcon={<KeyboardArrowLeftIcon/>}
                    rightArrowIcon={<KeyboardArrowRightIcon/>}
                    timeIcon={<AccessTimeIcon/>}
                    dateRangeIcon={<DateRangeIcon/>}
                    keyboardIcon={<KeyboardIcon/>}
                    value={this.state.draft.start}
                    onChange={this.handleStartDateChange}
                    helperText="When does the event start?"
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              <Grid item xs={12} sm={2}></Grid>
              <Grid item xs={12} sm={5}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <DateTimePicker
                    leftArrowIcon={<KeyboardArrowLeftIcon/>}
                    rightArrowIcon={<KeyboardArrowRightIcon/>}
                    timeIcon={<AccessTimeIcon/>}
                    dateRangeIcon={<DateRangeIcon/>}
                    keyboardIcon={<KeyboardIcon/>}
                    value={this.state.draft.end}
                    onChange={this.handleEndDateChange}
                    helperText="When does the event end?"
                  />
                </MuiPickersUtilsProvider>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={4}></Grid>
          <Grid item xs={12} sm={8} className={classes.myHolder}>
            <Typography variant="headline">Other Details</Typography>
            <TextField
              label="Team Size"
              value={this.state.draft.team < 1 ? 1 : this.state.draft.team}
              inputProps={{min: 1}}
              type="number"
              onChange={this.handleChange('team')}
            />
          </Grid>
          <Grid item xs={12} sm={4}></Grid>
        </Grid>
      </div>;
    case 1:
      return <div>
        <Grid container > 
          <Grid item xs={12} className={classes.myHolder}>
            <Typography variant="headline">Select a Poster</Typography>
            <Dropzone
              onDrop={this.onDrop.bind(this)}
              accept="image/jpeg, image/png"
              maxSize={1500000}
              style={{width: 100+'%'}}
              multiple={true}>
              <div>
                <Button size="small" color="secondary">
                  Click here to upload image or drag them here (max 4 files (1.5 MB per file))
                </Button>
              </div>
            </Dropzone>
            {/* <div className={classes.myHolder}>
              <Grid spacing={24} container> 
                
              </Grid>
            </div> */}
          </Grid>
          {this.state.imageFiles.length > 0 && this.state.imageFiles.map((file, number) =>{ 
            return (
              <Grid key={number} item xs={12} sm={4} md={3}>
                <Card className={classes.card}>
                  <img src={file.preview} className={classes.media} />
                  <Checkbox className={classes.image_btn} onClick={()=>this.setPoster(number)} icon={<StarBorderIcon />} checkedIcon={<StarIcon />} color='primary' checked={ file.poster? true : false } />
                  <IconButton className={classes.image_btn} style={{float:'right'}} onClick={()=>this.removeImage(number)} aria-label="Delete" color="default">
                    <DeleteIcon />
                  </IconButton>
                </Card>
              </Grid>
            );
          })}
          <Grid item xs={12} sm={8} className={classes.myHolder} >
            <Typography variant="headline">Select Tags</Typography>
            <div style={{minHeight: 100, backgroundColor: '#fafafa', borderRadius: 6}}>
              {
                this.state.draft.tags.map((value, number) => {
                  return(
                    <Chip
                      style={{margin: 5}}
                      key={number}
                      label={value}
                      className={classes.chip}
                      onDelete={() => this.removeChip(number)}
                    />
                  );
                })
              }
            </div>
            <TextField 
              label="Add Tags"
              fullWidth
              // helperText="This will help better find your audience"
              onChange={this.handleChange('tagTemp')}
              value={this.state.draft.tagTemp}
            />
            <Button variant="raised" style={{margin: 5}} onClick={this.addChip}>Add Chip</Button>
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
                  <div>
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
          <Paper square elevation={0}>
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
