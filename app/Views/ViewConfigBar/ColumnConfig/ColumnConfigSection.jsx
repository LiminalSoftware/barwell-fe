import React, { Component, PropTypes } from 'react'
import update from 'react/lib/update'
import _ from "underscore"

import FlipMove from 'react-flip-move'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import constants from "../../../constants/MetasheetConstants"

import AttributeStore from "../../../stores/AttributeStore"

import fieldTypes from "../../fields"
import modelActionCreators from "../../../actions/modelActionCreators"
import util from "../../../util/util"

// import ColumnDetail from "./ColumnDetail"

const getItemState = (view) => {
	return {items: view.data.sorting, oldItems: view.data.sorting};
}

@DragDropContext(HTML5Backend)
export default class ColumnConfigSection extends Component {

	constructor (props) {
		super(props)
		this.state = getItemState(props.view)
		this.debounceMoveItem = _.debounce(this.moveItem, 50)
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

	save = () => {
		var view = this.props.view
		const items = this.getItems()
		if (!_.isEqual(view.data.sorting, items)) {
			view.data.sorting = items
			modelActionCreators.createView(view, true, true);
		}
	}

	renderSelector = () => {
		const view = this.props.view
		const existing = _.pluck(this.state.items, 'attribute_id')

		const choices = AttributeStore.query({model_id: view.model_id})
			.filter(attr => fieldTypes[attr.type].sortable && 
				existing.indexOf("" + attr.attribute_id) < 0)
			.map(attr=>
				<option value={attr.cid || attr.attribute_id} 
				key={attr.attribute_id}>
					{attr.attribute}
				</option>
			)

		return <select style = {selectorStyle}  ref="selector"
			value = {0}
			className="menu-input menu-input-selector selector-style" onChange = {this.chooseItem}>

			<option value="0">-- Choose --</option>
			{choices}
		</select>
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

	chooseItem = (e) => {
		var choice = e.target.value
		var item = {attribute_id: choice, descending: true};
		if (choice !== 0) this.addItem(item)
		this.refs.selector
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
		const _this = this
		const view = this.props.view
		const items = this.state.items

		return <div className="view-config-menu" 
			style={{right: -45 * this.props.idx - 15 + 'px'}} 
			onClick={util.clickTrap} onMouseDown={util.clickTrap}>
			<div className="menu-pointer-outer" style={{right: 45 * this.props.idx + 30 + 'px'}}/>
			<div className="menu-pointer-inner" style={{right: 45 * this.props.idx + 30 + 'px'}}/>
			
			
		</div>
	}
}