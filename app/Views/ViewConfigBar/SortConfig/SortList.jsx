import React, { Component, PropTypes } from 'react'
import _ from 'underscore'

import FlipMove from 'react-flip-move'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import AttributeStore from "../../../stores/AttributeStore"
import fieldTypes from "../../fields"
import modelActionCreators from "../../../actions/modelActionCreators.jsx"
import util from "../../../util/util"

import SortDetail from "./SortDetail"

const getItemState = (view) => {
	return {items: view.data.sorting, oldItems: view.data.sorting};
}

@DragDropContext(HTML5Backend)
export default class SortList extends Component {

	constructor (props) {
		super(props)
		this.state = getItemState(props.view)
	}

	moveItem = (dragIndex, hoverIndex) => {
		const { items } = this.state;
    	const dragItem = items[dragIndex];

		this.setState(update(this.state, {
			items: {
				$splice: [
					[dragIndex, 1],
					[hoverIndex, 0, dragItem]
				]
			}
		}))
	}

	removeItem = (item) => {
		var items = this.state.items.filter(a => a.attribute_id !== item.attribute_id);
		this.setState({items: items});
	}

	addItem = (newitem) => {
		this.setState(update(this.state, {
			items: {
				$push: [newitem]
			}
		}))
	}

	getItems = () => {
		return this.state.items
	}

	render () {
		var _this = this
		var view = this.props.view
		var items = this.state.items

    	return <FlipMove easing="cubic-bezier(0, 0.7, 0.8, 0.1)">
			{items.map((item, order) => 
			<SortDetail 
				key = {item.cid || item.attribute_id}
				id = {item.cid || item.attribute_id}
				item = {item}
				index = {order}
				sortSpec = {item}
				_remove = {_this.removeItem}
				_moveItem = {_this.moveItems}
				view = {view} 
				editing = {true}
				{..._this.movableProps} />
			)}
		</FlipMove>
	}
}