import React from "react";
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
	    // Set items' data, key name `items` required
		this.setState({items: this.getItemsList()});
	},

	getItemsList: function () {
		var items = [];
		var view = this.props.view;
		var columns = view.data.columns;

		this.props.sections.forEach(function (section, idx) {
			var sectionItems = section.selector(view)
			if (idx > 0) items.push({
				isSection: true, 
				label: section.label, 
				section: section.section,
				emptyText: section.emptyText
			});
			sectionItems.forEach(function (col) {
				col.viewConfigParts = section.configParts;
				items.push(col)
			})
		});

		return items;
	},

	blurChildren: function () {
		var _this = this;
		this.state.items.forEach(function (item) {
			if (item.column_id) _this.refs[item.column_id].blurSubMenus()
		});
	},

	componentWillReceiveProps: function (nextProps) {
		this.setState({items: this.getItemsList()});
	},

	render: function() {
		var _this = this;
		var view = this.props.view;
		var data = view.data;
		var columns = view.data.columnList;

		var items = this.state.items.map(function (item, idx) {
			var itemProps = Object.assign({
				item: item,
				index: idx,
			}, _this.movableProps);

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
