import React from "react";
import ReactDOM from "react-dom"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../../fields"

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

	onResorted: function () {
		if (this.props.confirmChanges) this.props._markDirty()
		else this.commitUpdates();
	},

	commitUpdates: function () {
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

	revertChanges: function () {
		this.setState(this.getItemState());
	},

	getItemState: function () {
		var items = [];
		var view = this.props.view;
		var columns = view.data.columns;

		this.props.sections.forEach(function (section, idx) {
			
			if (idx > 0) items.push(_.extend(section, {isSection: true}))
			section.selector(view).forEach(function (col) {
				items.push(col)
			});
		});

		return {items: items};
	},

	blurChildren: function () {
		var _this = this;
		this.state.items.forEach(function (item) {
			if (item.column_id) _this.refs[item.column_id].blurSubMenus()
		});
	},

	componentDidReceiveProps: function (nextProps) {
		this.setState(this.getItemState());
	},

	render: function() {
		var _this = this;
		var view = this.props.view;
		var data = view.data;
		var columns = view.data.columnList;
		var section

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
			else return <ColumnDetail
				key = {item.column_id}
				ref = {item.column_id}
				config = {item}
				open = {true}
				viewConfigParts = {section ? section.configParts : null}
				editing = {_this.props.editing}
				view= {view}
				_blurChildren = {_this.blurChildren}
				{...itemProps}/>
		})

    	return <div className = "dropdown-list" style = {{minWidth: '500px'}}>
			{items}
		</div>	
	}
});

export default ColumnList;
