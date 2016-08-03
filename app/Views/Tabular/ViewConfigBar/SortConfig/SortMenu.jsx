import React, { Component, PropTypes } from 'react'
import _ from "underscore"

import AttributeStore from "../../../../stores/AttributeStore"
import SortList from "./SortList"

import fieldTypes from "../../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"

const selectorStyle = {
	left: 0, 
	right: 0,
	bottom: 0, 
	top: 0, 
	height: "auto", 
	width: "100%",
	position: "absolute"
}

export default class SortMenu extends Component {

	componentWillUnmount = () => {
		this.save()
	}

	save = () => {
		var view = this.props.view
		const items = this.refs.list.getItems()
		if (!_.isEqual(view.data.sorting, items)) {
			view.data.sorting = items
			modelActionCreators.createView(view, true, true);
		}
	}

	renderSelector () {
		const view = this.props.view
		const sortList = this.refs.list ? 
			this.refs.list.state.items
			: view.data.sorting
		const sortAttrs = _.pluck(sortList, 'attribute_id').map(parseInt)

		const choices = AttributeStore.query({model_id: view.model_id})
			.filter(attr => fieldTypes[attr.type].sortable && 
				sortAttrs.indexOf(attr.attribute_id))
			.map(attr=>
				<option value={attr.cid || attr.attribute_id} 
				key={attr.attribute_id}>
					{attr.attribute}
				</option>
			)

		return <select style = {selectorStyle} 
			value = {null}
			className="menu-input menu-input-selector" onChange = {this.chooseItem}>

			<option>-- Choose --</option>
			{choices}
			</select>
		
	}

	chooseItem = (e) => {
		var choice = e.target.value
		var list = this.refs.list
		var item = {attribute_id: choice, descending: true};
		if (choice == 0) return;
		list.addItem(item);
	}

	render () {

		return <div className="view-config-menu">
			<div className="menu-pointer-outer"/>
			<div className="menu-pointer-inner"/>
			<SortList {...this.props} ref = "list"/>
			
			<div className="menu-item menu-sub-item menu-sub-item-draggable"
			style = {{position: "relative"}}>
				{this.renderSelector()}
			</div>
			
		</div>
	}
}