import React, { Component, PropTypes } from 'react'
import { findDOMNode } from 'react-dom';
import _ from 'underscore';

import { DragSource, DropTarget } from 'react-dnd';

import ViewStore from "../../../stores/ViewStore"
import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"

import constants from "../../../constants/MetasheetConstants"

import fieldTypes from "../../fields"
import modelActionCreators from "../../../actions/modelActionCreators.jsx"
import PureRenderMixin from 'react-addons-pure-render-mixin';
import sortable from 'react-sortable-mixin'

const placeHolderStyle = {
	left: 5,
	right: 5,
	top: 5,
	bottom: 5,
	position: "absolute",
	border: `1px dashed ${constants.colors.GRAY_3}`,
	borderRadius: "3px"
}

const itemSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index
    };
  }
}

const itemTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props._moveItem(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  }
};

@DropTarget("ATTRIBUTE", itemTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))

@DragSource("ATTRIBUTE", itemSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))



export default class SortDetail extends Component {

	static propTypes = {
		connectDragSource: PropTypes.func.isRequired,
		connectDropTarget: PropTypes.func.isRequired,
		index: PropTypes.number.isRequired,
		isDragging: PropTypes.bool.isRequired,
		sortSpec: PropTypes.object.isRequired,
		_moveItem: PropTypes.func.isRequired,
		_remove: PropTypes.func.isRequired
	};

	constructor (props) {
		var spec = props.sortSpec
		super(props)
		this.state = {
			descending: spec.descending
		}
	}

	remove = () => {
		this.props._remove(this.props.sortSpec)
	}

	switch = () => {
		var spec = this.props.sortSpec
		spec.descending = !spec.descending
		this.props._updateItem(spec)
	}

	renderItem = () => {
		const {view, sortSpec} = this.props
		const attr = AttributeStore.get(sortSpec.attribute_id)
		const fieldType = fieldTypes[attr.type];

		return <div>
			<span ref = "grabber" className="draggable drag-grid"/>
      		<span className = "ellipsis" style={{marginRight: '10px'}}>{attr.attribute}</span>

			<span onClick={this.switch}
				className={"half-column-config tight icon icon-" + fieldType.sortIcon + (sortSpec.descending ? 'desc' : 'asc')}/>
			<span onClick={this.remove} 
				className="half-column-config tight icon icon-cross-circle "/>
		</div>
	}

	renderPlaceholder () {
		return <span style={placeHolderStyle}/>
	}

	render () {
		const {isDragging, index, connectDragSource, connectDropTarget} = this.props
    	const opacity = isDragging ? 0 : 1
    	const style = {position: "relative"}
    	const color = isDragging ? constants.colors.GRAY_3 : null
		
	    return connectDragSource(connectDropTarget(
	    <div className="menu-item menu-sub-item menu-sub-item-draggable"
	    style={{opacity, color, ...style}}>
    		{this.renderItem()}
		</div>))
	}
}