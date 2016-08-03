import React, { Component, PropTypes } from 'react'
import _ from 'underscore';
import fieldTypes from "../../../fields"

import AttributeStore from "../../../../stores/AttributeStore"

import SortDetail from "./SortDetail"

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"
import util from "../../../../util/util"

const getItemState = (view) => {
	return {items: view.data.sorting};
}

export default class SortList extends Component {

	constructor (props) {
		super(props)
		this.state = getItemState(props.view)
	}

	updateItem = (item) => {
		var items = this.state.items.map(function (existing) {
			if (existing.attribute_id === item.attribute_id) return item
			else return existing
		})
		this.setState({items: items});
	}

	removeItem = (item) => {
		var items = this.state.items.filter(a => a.attribute_id !== item.attribute_id);
		this.setState({items: items});
	}

	addItem = (item) => {
		var items = this.state.items;
		items.push(item);
		this.setState({items: items});
	}

	getItems = () => {
		return this.state.items
	}

	render () {
		var _this = this
		var view = this.props.view
		var items = this.state.items

    	return <span>
			{items.map((item, order) => 
			<SortDetail 
				key = {item.cid || item.attribute_id}
				item = {item}
				index = {order}
				sortSpec = {item}
				_remove = {_this.removeItem}
				_updateItem = {_this.updateItem}
				view = {view} 
				editing = {true}
				{..._this.movableProps} />
			)}
		</span>;
	}
}