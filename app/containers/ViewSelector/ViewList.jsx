import _ from "underscore"
import React from "react"
import ViewStore from "../../stores/ViewStore"
import styles from "./style.less"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"

import ViewItemMovable from './ViewItemMovable'
import ViewItemSingleton from './ViewItemSingleton'
import modelActionCreators from "../../actions/modelActionCreators.jsx"
import sortable from 'react-sortable-mixin';

var ViewList = React.createClass({

	// mixins: [sortable.ListMixin],

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return {items: []};
	},

	componentDidMount: function () {
		this.setState({items: this.props.items});
	},

	// UTILITY ================================================================

	saveChanges: function () {
		var _this = this
		var model = this.props.model
		
		this.state.items.forEach(function (v) {
			_this.refs['view-' + v.view_id].saveChanges()
		})
		this.setState({editing: false, adding: false})
	},

	cancelChanges: function () {
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
		console.log('aa add new view');
		while (ViewStore.query({model_id: model.model_id, view: name}).length > 0)
			name = 'New ' + type.type + ' ' + (iter++);
		view = {
			view: name,
			model_id: model.model_id,
			type: type.type,
			data: {}
		};
		items.push(view)
		this.setState({
			items: items
		});
	},

	// RENDER =================================================================

	render: function () {
		var _this = this;
		var view = this.props.view || {};

		return <div className = "dropdown-list">
			{this.state.items.map(function(v, idx) {

				var itemProps = _.extend({
					ref: 'view-' + v.view_id,
					key: v.view_id,
					index: idx,
					item: v,
					selected: (view.view_id === v.view_id),
					view: v,
					model: _this.props.model,
					editing: _this.props.editing
				}, _this.movableProps);

				return <ViewItemMovable {...itemProps}/>;
			})}
		</div>
	}
})

export default ViewList
