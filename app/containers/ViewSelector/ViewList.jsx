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
		this.setState({items: sortItems(this.props.model, this.props.items)});
	},

	componentWillReceiveProps: function (next) {
		this.setState({items: sortItems(next.model, next.items)});
	},

	componentWillUnmount: function () {
		if (this.state.editing) this.cancelChanges();
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
		var ordering = {};

		items.forEach(function (item, ord) {
			var element = _this.refs[(item.cid || item.view_id)]
			if (element) element.saveChanges();
			ordering[item.view_id] = ord + 1;
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
			var element = _this.refs[(item.cid || item.view_id)]
			if (element) element.revertChanges();
		})
		this.setState({
			items: this.props.items
		});
	},

	addNewView: function (type) {
		var model = this.props.model;
		var name = 'New ' + type.type;
		var iter = 1;
		var view;
		
		while (ViewStore.query({model_id: model.model_id, view: name}).length > 0)
			name = 'New ' + type.type + ' ' + (iter++);
		modelActionCreators.createView({
			view: name,
			model_id: model.model_id,
			type: type.type,
			data: {}
		}, false, false);
	},

	// RENDER =================================================================

	render: function () {
		var _this = this;
		var view = this.props.view || {};

		return <div className = "dropdown-list">
			{this.state.items.map(function(v, idx) {

				var itemProps = {
					ref: (v.cid || v.view_id),
					key: (v.cid || v.view_id),
					index: idx,
					selected: (view.view_id === v.view_id),
					view: v,
					model: _this.props.model,
					editing: _this.props.editing
				};

				return _this.props.editing ?
					<ViewItemMovable {...itemProps} {..._this.movableProps}/>
					:
					<ViewItemSingleton {...itemProps}/>;
			})}
		</div>
	}
})

export default ViewList
