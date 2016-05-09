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
import menuOverflowMixin from '../../../../../menuOverflowMixin'

var ColumnList = React.createClass({

	mixins: [sortable.ListMixin, menuOverflowMixin],

	// LIFECYCLE ==============================================================

	componentWillMount: function () {
		this.calibrateHeight();
	},

	componentDidMount: function() {
		this.setState(this.getItemState());
	},

	componentWillReceiveProps: function (next) {
		this.setState(this.getItemState(next));
	},

	componentDidReceiveProps: function (nextProps) {
		this.setState(this.getItemState());
	},

	onResorted: function () {
		if (this.props.confirmChanges) {
			this.props._markDirty();
		}
		this.commitViewUpdates(this.props.confirmChanges);
	},

	// UTILITY ================================================================

	commitViewUpdates: function (commit) {
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
		if (commit) modelActionCreators.createView(view, true, true);
	},

	getItemState: function (_props) {
		var oldItems = this.state.items;
		var items = [];
		var props = (_props || this.props);
		var view = props.view;
		var columns = view.data.columns;
		
		props.sections.forEach(function (section, idx) {
			var cols = section.selector(view);
			if (idx > 0) items.push(_.extend({isSection: true}, section))
			cols.forEach(function (col) {
				var attribute = AttributeStore.get(col.attribute_id);
				if (!attribute || attribute._destroy) 
					return;
				if (attribute.attribute_id) 
					col.attribute_id = attribute.attribute_id
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
		});
	},

	// RENDER ===================================================================

	render: function() {
		var _this = this;
		var view = this.props.view;
		var data = view.data;
		var columns = view.data.columnList;
		var section = this.props.sections[0];
		var numTotalItems = this.state.items.length;

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
				spaceTop = {idx}
				spaceBottom = {numTotalItems - idx}
				viewConfigParts = {section ? section.configParts : null}
				editing = {_this.props.editing}
				view= {view}
				_blurSiblings = {_this._blurSiblings}
				{...itemProps}/>
		});

    	return <div className = "dropdown-list" 
    		style = {{
    			minWidth: '500px', 
    			maxHeight: (this.state.windowHeight - 300) + 'px',
    			overflowY: 'scroll',
    			marginRight: '-100px',
    			paddingRight: '100px'
    		}} onClick = {this._blurSiblings}>
			{items}
		</div>
	}
});

export default ColumnList;
