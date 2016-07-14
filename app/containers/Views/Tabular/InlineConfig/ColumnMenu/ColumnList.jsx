import React from "react";
import ReactDOM from "react-dom"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import AttributeStore from "../../../../../stores/AttributeStore";
import RelationStore from "../../../../../stores/RelationStore";
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
		this.setState(this.getItemState(this.props));
	},

	componentDidMount: function() {
		// this.setState(this.getItemState());
	},

	componentWillReceiveProps: function (next) {
		this.setState(this.getItemState(next));
	},

	componentDidReceiveProps: function (nextProps) {
		var nextView = nextProps.view
		var cols = nextView.columnList
		var items = this.state.items
		var itemsIndex = _.indexBy(items, 'column_id')

		cols.forEach(function (col) {
			if (!(col.column_id in itemsIndex)) {
				col.hidden = true;
				items.push(col);
			}
		});
		this.setState({items: items})
	},

	onMoveBefore: function () {
		this.blurSiblings()
	},

	onResorted: function () {
		this.commitViewUpdates(!this.props.confirmChanges);
		if (this.props.confirmChanges) {
			this.props._markDirty();
		}
	},

	// UTILITY ================================================================

	commitViewUpdates: function (commit) {
		// applies the section transformers to each item in the section
		// if @commit is true, then commits  changes to the view and persists
		// commit = false
		var view = this.props.view;
		var section = this.props.sections[0];
		var items = this.state.items.map(function (item, idx) {
			if (item.isSection) section = item;
			else {
				item.order = idx;
				item = section.enterTransform(item);
				if (commit) view.data.columns[item.cid || item.column_id] = item;
			}
			return item;
		});
		if (commit) modelActionCreators.createView(view, true, true);
		else this.setState({items: items})
	},

	getItemState: function (_props) {
		var oldItems = this.state.items;
		var items = [];
		var props = (_props || this.props);
		var view = props.view;
		var columns = view.data.columns;
		
		props.sections.forEach(function (section, idx) {
			var cols = section.selector(view);
			if (idx > 0) items.push(_.extend({isSection: true, isEmpty: cols.length === 0}, section))
			cols.forEach(function (col) {
				var attribute = AttributeStore.get(col.attribute_id);
				var relation = RelationStore.get(col.relation_id);

				if (attribute && !attribute._destroy) 
					// col.attribute_id = attribute.attribute_id;
					items.push(col);
				if (relation && !relation._destroy)
					// col.relation_id = relation.relation_id;
					items.push(col);
			});
		});

		return {items: items};
	},

	blurSiblings: function (e) {
		var _this = this;
		this.state.items.forEach(function (item) {
			if (item.column_id) _this.refs[item.column_id].blurSubMenus()
		});
		if (e) e.stopPropagation()
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
			hidden: true,
			_isNew: true
		};
		// make the new attribute name unique
		while (list.some(item => item.name === attr.attribute))
			attr.attribute = 'New attribute ' + idx++;
		
		return modelActionCreators.create('attribute', false, attr)
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
				className = "menu-item menu-item-stacked"
					key = {'section-' + item.label}
					ref = {'section' + item.label}> 
				<div className="menu-sub-item menu-divider" 
					{...itemProps}>
					<div className = "menu-divider-inner">
						<span className = {"icon " + item.icon} style = {{flexGrow: 0}}/>
						<span style = {{flexGrow: 0}}>{item.label}</span>
					</div>
				</div>
				{item.isEmpty ? <div className = "menu-sub-item menu-empty-item">{item.emptyText}</div> : null}
			</div>
			else return <ColumnDetail
				key = {item.column_id}
				ref = {item.column_id}
				minWidth = '500px'
				config = {item}
				open = {true}
				spaceTop = {idx}
				spaceBottom = {numTotalItems - idx}
				viewConfigParts = {section ? section.configParts : null}
				editing = {_this.props.editing}
				view = {view}
				_blurSiblings = {_this.blurSiblings}
				_showPopUp = {_this.props._showPopUp}
				{...itemProps}/>
		});

    	return <div className = "dropdown-list" 
    		ref = "columnList"
    		style = {{
    			minWidth: '500px', 
    			maxHeight: (this.state.windowHeight - 250) + 'px',
    			overflowY: 'scroll'
    		}} onClick = {_this.props._blurChildren}>
			{items}
		</div>
	}
});

export default ColumnList;
