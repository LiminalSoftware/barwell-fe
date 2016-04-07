import _ from "underscore";
import React from "react";
import ViewStore from "../../stores/ViewStore";
import ModelConfigStore from "../../stores/ModelConfigStore";
import styles from "./style.less";
import viewTypes from "../Views/viewTypes";
import { Link } from "react-router";

import ViewItemMovable from './ViewItemMovable';
import ViewItemSingleton from './ViewItemSingleton';
import sortItems from './sortItems';

import modelActionCreators from "../../actions/modelActionCreators.jsx";
import sortable from 'react-sortable-mixin';

var ViewList = React.createClass({

	mixins: [sortable.ListMixin],

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return {};
	},

	componentDidMount: function () {
		var model = this.props.model
		this.setState({items: sortItems(model, this.props.items)});
	},

	componentWillReceiveProps: function (next) {
		this.setState({items: next.items});
	},

	componentWillUnmount: function () {
		this.cancelChanges();
	},

	// HANDLERS ===============================================================

	onResorted: function () {
		// var model = this.props.model;
		
	},

	// UTILITY ================================================================

	saveChanges: function () {
		var _this = this;
		var model = this.props.model;
		var items = this.state.items;
		var ordering = {}

		items.forEach(function (item, ord) {
			_this.refs['view-' + (item.cid || item.view_id)].saveChanges()
			ordering[item.view_id] = ord;
			// if (item.view_id) _this.refs['view-' + item.view_id].saveChanges();
		});
		
		modelActionCreators.create('modelconfig', false, {
			model_id: model.model_id,
			ordering: ordering
		});
		this.setState({editing: false, adding: false});
	},

	cancelChanges: function () {
		var _this = this;
		this.state.items.map(function (item) {
			// if (!item.view_id) 
			return _this.refs['view-' + (item.cid || item.view_id)].revertChanges()
		})
		this.setState({
			items: this.props.items
		});
	},

	addNewView: function (type) {
		var model = this.props.model;
		var name = 'New ' + type.type;
		var iter = 1;
		var items = _.clone(this.state.items);
		var view;
		
		while (ViewStore.query({model_id: model.model_id, view: name}).length > 0)
			name = 'New ' + type.type + ' ' + (iter++);
		view = {
			view: name,
			model_id: model.model_id,
			type: type.type,
			data: {}
		};
		modelActionCreators.createView(view, false, false);
		// items.push(view)
		// this.setState({
		// 	items: items
		// });

	},

	// RENDER =================================================================

	render: function () {
		var _this = this;
		var view = this.props.view || {};

		return <div className = "dropdown-list">
			{this.state.items.map(function(v, idx) {

				var itemProps = {
					ref: 'view-' + (v.cid || v.view_id),
					key: v.cid || v.view_id,
					index: idx,
					item: v,
					selected: (view.view_id === v.view_id),
					view: v,
					model: _this.props.model,
					editing: _this.props.editing
				};

				return <ViewItemMovable {...itemProps} {..._this.movableProps}/>;
			})}
		</div>
	}
})

export default ViewList
