import React from "react";
import ReactDOM from "react-dom"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import AttributeStore from "../../../../../stores/AttributeStore";
import ColumnDetail from "./ColumnDetailListable"
import constant from '../../../../../constants/MetasheetConstants'
import util from "../../../../../util/util"

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"

import PureRenderMixin from 'react-addons-pure-render-mixin';
import blurOnClickMixin from '../../../../../blurOnClickMixin';
import sortable from 'react-sortable-mixin';


var ColumnList = React.createClass({

	mixins: [sortable.ListMixin],

	componentDidMount: function() {
		this.setState(this.getItemState());
	},

	componentWillReceiveProps: function (next) {
		console.log('componentWillReceiveProps')
		this.setState(this.getItemState(next));
	},

	onResorted: function () {
		if (this.props.confirmChanges) this.props._markDirty()
		else this.commitViewUpdates();
	},

	commitViewUpdates: function () {
		var view = this.props.view;
		var section = this.props.sections[0];
		var items = this.state.items.map(function (item, idx) {
			if (item.isSection) section = item
			else {
				item.order = idx;
				item = section.enterTransform(item);
				view.data.columns[item.column_id] = item
			}
		});
		modelActionCreators.createView(view, true, true);
	},

	commitSchemaUpdates: function () {
		var view = this.props.view;
		var items = this.state.items;
		var attribute;

		items.forEach(function (item) {
			if (item.isSection) return;
			else if (!item.attribute_id) {
				modelActionCreators.createView(view, true, true);
				if (attr._dirty) return modelActionCreators.create('attribute', true, item)
			}
			attribute = AttributeStore.get(item.attribute_id)
			
		});
	},

	// revertChanges: function () {
	// 	_this = this;
	// 	return Promise.all(AttributeStore.query({model_id: (model.model_id || model.cid)}).map(function (attr) {
	// 		if ((!attr.attribute_id) || (save && attr._destroy)) {
	// 			return modelActionCreators.destroy('attribute', false, attr)
	// 		} else {
	// 			return modelActionCreators.restore('attribute', attr)
	// 		}
	// 	})).then(function () {
	// 		_this.setState(this.getItemState());
	// 	})
	// },

	getItemState: function (_props) {
		var items = [];
		var props = (_props || this.props)
		var view = props.view;
		var columns = view.data.columns;

		props.sections.forEach(function (section, idx) {
			var attrs = section.selector(view);
			if (idx > 0) items.push(_.extend({isSection: true}, section))
			attrs.forEach(function (col) {	
				items.push(col);
			});
			// if (attrs.length === 0) items.push(_.extend({isEmpty: true}, section));
		});

		return {items: items};
	},

	_blurSiblings: function () {
		var _this = this;
		this.state.items.forEach(function (item) {
			if (item.column_id) _this.refs[item.column_id].blurSubMenus()
		});
	},

	componentDidReceiveProps: function (nextProps) {
		this.setState(this.getItemState());
	},

	addItem: function () {
		var _this = this;
		var model = this.props.model;
		var list = this.state.items;
		var idx = 1;
		var attr = {
			attribute: 'New attribute', 
			model_id: model.model_id, 
			type: 'TEXT',
			hidden: true
		};
		while (list.some(item => item.name === attr.attribute)) {
			attr.attribute = 'New attribute ' + idx++;
		}
		// list.push(attr);
		return modelActionCreators.create('attribute', false, attr).then(function (storeAttr) {
			// var view = 
			// list.push(storeAttr)
			// _this.setState({items: list})
		});
	},

	render: function() {
		var _this = this;
		var view = this.props.view;
		var data = view.data;
		var columns = view.data.columnList;
		var section = this.props.sections[0];

		var items = this.state.items.map(function (item, idx) {
			var itemProps = Object.assign({
				item: item,
				index: idx,
			}, _this.movableProps);

			if (item.isSection) section = item;
			if (item.isSection) return <div 
				className="menu-item menu-sub-item menu-divider" 
				key = {'section-' + item.section}
				ref = {'section' + item.section}
				{...itemProps}>{item.label}</div>
			else if (item.isEmpty) return <div
				className="menu-item menu-sub-item menu-divider empty-item"
				key = {'section-' + item.section + '-empty'}
				{...itemProps}>{item.emptyText}</div>
			else return <ColumnDetail
				key = {item.column_id}
				ref = {item.column_id}
				config = {item}
				open = {true}
				viewConfigParts = {section ? section.configParts : null}
				editing = {_this.props.editing}
				view= {view}
				_blurSiblings = {_this._blurSiblings}
				{...itemProps}/>
		});

    	return <div className = "dropdown-list" style = {{minWidth: '500px'}} onClick = {this._blurSiblings}>
			{items}
		</div>
	}
});

export default ColumnList;
