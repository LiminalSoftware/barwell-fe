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


const itemSource = {

	beginDrag (props) {
    	return {
	    	id: props.id,
	    	index: props.index,
	    	originalIndex: props.index
	    }
	},

	endDrag (props, monitor) {
		const { id: droppedId, originalIndex } = monitor.getItem()
		const didDrop = monitor.didDrop()

		if (!didDrop) props.moveCard(droppedId, originalIndex)
	}

}

const itemTarget = {
	canDrop () {
		return false
	},

	hover(props, monitor, component) {
		const { id: draggedId } = monitor.getItem();
		const { id: overId } = props;

		if (draggedId !== overId) {
			const overIndex = props._itemIndex(overIndex);
			props._moveItem(draggedId, overIndex);
		}
	}
}

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

	renderPlaceholder () {
		return <span style={placeHolderStyle}/>
	}

	render () {
		const {isDragging, index, connectDragSource, connectDropTarget} = this.props
		const {view, sortSpec} = this.props
		const attr = AttributeStore.get(sortSpec.attribute.slice(1))
		const fieldType = fieldTypes[attr.type]
    	const opacity = isDragging ? 0 : 1
    	const style = {borderBottom: `1px solid ${constants.colors.RED_BRIGHT}`}
    	// const color = isDragging ? constants.colors.GRAY_3 : null

	    return connectDragSource(connectDropTarget(
	    <div className="menu-item menu-sub-item menu-sub-item-draggable"
	    style={{opacity, ...style}}>
    		<span ref = "grabber" className="draggable drag-grid"/>
    		<span className="config-style">
    			{this.props.index===0 ? "Sorted by " : "... then by"}
    		</span>
      		<span className="menu-span" style={{flexGrow: 2}}>
      			<span className="config-style header-item"> {attr.attribute} </span>
      		</span>
      		<span className="config-style"> from </span>
      		<span className="config-style">A <span className="icon icon-arrow-right" style={{fontSize: 16}}/> Z</span>
      		<span className="config-style">Z <span className="icon icon-arrow-right" style={{fontSize: 16}}/> A</span>

      		<span style={{marginLeft: "auto"}}>
				<span onClick={this.remove} className="icon icon-cross "/>
			</span>
		</div>))
	}
}
