import React, { Component, PropTypes } from 'react'
import update from 'react/lib/update'
import _ from "underscore"

import FlipMove from 'react-flip-move'

import constants from "../../../constants/MetasheetConstants"

import AttributeStore from "../../../stores/AttributeStore"

import fieldTypes from "../../fields"
import modelActionCreators from "../../../actions/modelActionCreators"
import util from "../../../util/util"

import SortDetail from "./SortDetail"

const getItemState = (view) => {
	return {items: view.data.sorting, oldItems: view.data.sorting};
}

const selectorStyle = {
	left: 0, 
	right: 0,
	bottom: 0, 
	top: 0,
	maxHeight: 26,
	padding: "0 8px",
	height: "auto", 
	width: "100%",
	position: "absolute",
	cursor: "pointer",
	textAlign: "center",
}


export default class SortMenu extends Component {

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
		let {view} = this.props
		const items = this.getItems()

		if (!_.isEqual(view.data.sorting, items)) {
			view.data.sorting = items
			view = update(view, {data: {sorting: {$set: items}}})
			modelActionCreators.createView(view, true, true);
		}
	}

	renderSelector = () => {
		const view = this.props.view
		const existing = _.pluck(this.state.items, 'attribute')

		const choices = AttributeStore.query({model_id: view.model_id})
			.filter(attr => 
				fieldTypes[attr.type].sortable && 
				existing.indexOf("a" + attr.attribute_id) < 0
			).map(attr=>
				<option value={'a' + (attr.cid || attr.attribute_id)} 
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

	moveItem = (fromIndex, toIndex) => {
		const { items } = this.state;
    	const dragItem = items[dragIndex];

		this.setState(update(this.state, {
			items: {
				$splice: [
					[fromIndex, 1],
					[toIndex, 0, dragItem]
				]
			}
		}))
	}

	chooseItem = (e) => {
		var choice = e.target.value
		var item = {attribute: choice, descending: true};
		if (choice !== 0) this.addItem(item)
		this.refs.selector
	}

	removeItem = (item) => {
		var items = this.state.items.filter(a => (a.attribute) !== item.attribute);
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

	itemIndex = (item) => {
		return this.state.items.indexOf(item)
	}

	render () {
		const _this = this
		const view = this.props.view
		const items = this.state.items
		
		return <div className="view-config-menu" 
			onClick={util.clickTrap}
			onMouseDown={util.clickTrap}>

			<div className="menu-box">
				<FlipMove  duration={150} staggerDelayBy={50}
				enterAnimation="fade" leaveAnimation="fade">
					{items.map((item, order) => 
					<SortDetail 
						key = {item.cid || item.attribute}
						id = {item.cid || item.attribute}
						item = {item}
						index = {order}
						sortSpec = {item}
						_itemIndex = {_this.itemIndex}
						_remove = {_this.removeItem}
						_moveItem = {_this.debounceMoveItem}
						view = {view}  />
					)}
					<div className="menu-item menu-sub-item" style={{position: "relative", margin: "5px", height: 24}}>
						{this.renderSelector()}
					</div>
				</FlipMove>
				
			</div>
			
			
		</div>
	}
}