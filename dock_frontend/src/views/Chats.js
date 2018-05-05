import React from 'react';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ChatFeed, Message } from 'react-chat-ui';

const styles = {

};

class Events extends React.Component {
  state = {
    messages: [
      new Message({
        id: 1,
        message: 'I\'m the recipient! (The person you\'re talking to)',
      }), // Gray bubble
      new Message({ id: 0, message: 'I\'m you -- the blue bubble!' }), // Blue bubble
    ],
  };
  componentDidMount() {
    if (this.props.selected !== 4) this.props.update();
  }
  render() {
    // const { history } = this.props;
    return(
      <ChatFeed
        messages={this.state.messages} // Boolean: list of message objects
        isTyping={this.state.is_typing} // Boolean: is the recipient typing
        hasInputField={false} // Boolean: use our input, or use your own
        showSenderName // show the name of the user who sent the message
        bubblesCentered={false} //Boolean should the bubbles be centered in the feed?
        // JSON: Custom bubble styles
        bubbleStyles={
          {
            text: {
              fontSize: 30
            },
            chatbubble: {
              borderRadius: 70,
              padding: 40
            }
          }
        }
      />
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
        payload: 4
      });
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps) (withStyles(styles) (Events));