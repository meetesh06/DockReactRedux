import React from 'react';
import DropdownTreeSelect from 'react-dropdown-tree-select';
import 'react-dropdown-tree-select/dist/styles.css';
import '../css/Tree.css';
import { Hierarchy } from '../shared';

var selectedNodesGlobal = [];
class Tree extends React.Component {
  state = {
    audience: Hierarchy()
  }
  componentWillUnmount() {
    const local_draft = sessionStorage.getItem('draft');
    if(local_draft) {
      this.setState({draft: JSON.parse(local_draft)});
      sessionStorage.setItem('draft',JSON.stringify({...JSON.parse(local_draft), audience: selectedNodesGlobal }));
    }
  }

  componentWillMount() {
    let current = this.state.audience;
    const local_draft = sessionStorage.getItem('draft');
    if(local_draft) {
      let selectedNodes = JSON.parse(local_draft).audience;

      let dope = current[0];

      dope.checked = false;
      // reached the required node
      // fuck the nodes children's state 
      if(dope.children && dope.children.length > 0) {
        let j;
        let queue = [dope.children];
        while (queue.length > 0) {
          let currentQueueElement = queue[0];
          for(j=0;j<currentQueueElement.length;j++) {
            currentQueueElement[j].checked = false;
            if(currentQueueElement[j].children) {
              queue.push(currentQueueElement[j].children);
            }
          }
          queue.splice(0,1);
        }
      }

      // improved efficiency here, though the code looks complicated
      // I dont expect it to run for long as the downward propogation
      // is not expected to have n nodes in the worst case, thus average
      // case should never last 
      
      for (const key of Object.keys(selectedNodes)) {
        let path = selectedNodes[key]._id.split('-');
        let dope = current[path[0]];
        let i;
        for(i=1;i<path.length;i++) {
          dope = dope.children[parseInt(path[i], 10)];
        }
        dope.checked = true;

        if(dope.children && dope.children.length > 0) {
          let j;
          let queue = [dope.children];
          while (queue.length > 0) {
            let currentQueueElement = queue[0];
            for(j=0;j<currentQueueElement.length;j++) {
              currentQueueElement[j].checked = true;
              if(currentQueueElement[j].children) {
                queue.push(currentQueueElement[j].children);
              }
            }
            queue.splice(0,1);
          }
        }

      }

      this.setState({ audience: current });
    } else {
      this.setState({ audience: current });
    }
  }

  onTreeChange(currentNode, selectedNodes) { 
    selectedNodesGlobal = selectedNodes;
  }

  render() {
    return(
      <DropdownTreeSelect keepTreeOnSearch={true} onChange={this.onTreeChange} showPartiallySelected={true} data={this.state.audience} className="mdl-demo"/>
    );
  }
}

export default Tree;