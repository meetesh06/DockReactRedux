import React from 'react';
import DropdownTreeSelect from 'react-dropdown-tree-select';
import 'react-dropdown-tree-select/dist/styles.css';
import '../css/Tree.css';
import PropTypes from 'prop-types';

var selectedNodesGlobal = [];
var deselectedNodes = [];
class Tree extends React.Component {
  state = {
    selectedNodes: []
  }
  componentWillUnmount() {
    this.props.saveTreeState(deselectedNodes, selectedNodesGlobal);
  }

  onTreeChange(currentNode, selectedNodes) { 
    selectedNodesGlobal = selectedNodes;
    if(!currentNode.checked){
      deselectedNodes.push(currentNode);
    }
  }

  render() {
    return(
      <DropdownTreeSelect keepTreeOnSearch={true} onChange={this.onTreeChange} showPartiallySelected={true} data={this.props.dataAudience} className="mdl-demo"/>
    );
  }
}

Tree.propTypes = {
  saveTreeState: PropTypes.func.isRequired
};

export default Tree;