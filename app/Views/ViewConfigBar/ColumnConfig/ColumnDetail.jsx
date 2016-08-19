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

export default class ColumnDetail extends Component {

	static propTypes = {
		connectDragSource: PropTypes.func.isRequired,
		connectDropTarget: PropTypes.func.isRequired,
		index: PropTypes.number.isRequired,
		isDragging: PropTypes.bool.isRequired,
		_moveItem: PropTypes.func.isRequired,
	};

	constructor (props) {
		super(props)
		this.state = {visible: props.item.visisble}
	}

	toggleHidden = () => {
		
	}

	render () {
		const {isDragging, index, connectDragSource, connectDropTarget} = this.props
		const {view, item} = this.props
		
		const opacity = isDragging ? 0 : 1
		const style = {position: "relative"}
		const color = isDragging ? constants.colors.GRAY_3 : null
		
		return connectDragSource(connectDropTarget(
			<div className="menu-item menu-sub-item menu-sub-item-draggable"
			style={{opacity, color, ...style}}>
				

				<span ref = "grabber" className="draggable drag-grid"/>
				<span className = "ellipsis" style={{marginRight: '10px'}}>
					{item.name}
				</span>
				<span onClick={this.toggleHidden} 
					className={`tight icon icon-eye${item.visible?'':'-crossed grayed'} half-column-config`}/>

		</div>))
	}
}