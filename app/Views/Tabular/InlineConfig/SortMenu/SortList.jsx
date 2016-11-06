import React from "react";
import { Link } from "react-router";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import ViewStore from "../../../../stores/ViewStore"
import ModelStore from "../../../../stores/ModelStore"
import AttributeStore from "../../../../stores/AttributeStore"

import SortDetail from "./SortDetail"

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"
import util from "../../../../util/util"
import PureRenderMixin from 'react-addons-pure-render-mixin';
import blurOnClickMixin from "../../../../blurOnClickMixin";
import sortable from 'react-sortable-mixin';

var SortList = React.createClass({

	mixins: [sortable.ListMixin],

	componentDidMount: function () {
		this.setState(this.getItemState());
	},

	componentDidReceiveProps: function (nextProps) {
		this.setState(this.getItemState());
	},

	getItemState: function () {
		var view = this.props.view;
		var items = view.data.sorting;
		return {items: items};
	},

	updateItem: function (item) {
		var items = this.state.items.map(function (existing) {
			if (existing.attribute_id === item.attribute_id) return item
			else return existing
		})
		this.setState({items: items});
	},

	removeItem: function (item) {
		var items = this.state.items.filter(a => a.attribute_id !== item.attribute_id);
		this.setState({items: items});
	},

	addItem: function (item) {
		var items = this.state.items;
		items.push(item);
		this.setState({items: items});
	},

	getItems: function () {
		return this.state.items
	},

	render: function () {
		var _this = this
		var view = this.props.view
		var items = this.state.items

    	return <span>
			{
			this.state.items.map(function (item, order) {
				return <SortDetail 
					key = {item.cid || item.attribute_id}
					item = {item}
					index = {order}
					sortSpec = {item}
					_remove = {_this.removeItem}
					_updateItem = {_this.updateItem}
					view = {view} 
					editing = {true}
					{..._this.movableProps} />
			})
			}
		</span>;
	}
});

export default SortList;
