// LIBS AND SUCH
import React from "react"
import ReactDOM from "react-dom"
import _ from 'underscore'

// STYLES
import styles from "./style.less";

// STORES
import AttributeStore from "../../../../stores/AttributeStore";
import RelationStore from "../../../../stores/RelationStore";
import ViewConfigStore from "../../../../stores/ViewConfigStore";

// CONSTANTS
import fieldTypes from "../../../fields"

// COMPONENTS
import ColumnDetail from "./ColumnDetailListable"
import constant from "../../../../constants/MetasheetConstants"

// UTIL
import util from "../../../../util/util"
import modelActionCreators from "../../../../actions/modelActionCreators.jsx"

// MIXINS
import PureRenderMixin from 'react-addons-pure-render-mixin';
import blurOnClickMixin from "../../../../blurOnClickMixin";
import sortable from 'react-sortable-mixin';



var ColumnList = React.createClass({

	mixins: [sortable.ListMixin],

	// LIFECYCLE ==============================================================

	componentWillMount: function () {
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
			if (col.column_id in itemsIndex) {
				_.extend(itemsIndex[col.column_id], col)
			} else {
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

	componentWillUnmount: function () {
		this.state.items.map(function (item) {
			// var attr = AttributeStore.get(item.cid || item.attribute_id)
			// if (item._dirty) modelActionCreators.create('attribute', true, item)
		})
	},

	// UTILITY ================================================================

	commitViewUpdates: function (commit) {
		// applies the section transformers to each item in the section
		// if @commit is true, then commits  changes to the view and persists
		
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
			var cols = section.selector(view).sort(util.orderSort);
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

	addAttribute: function () {
		var _this = this;
		var model = this.props.model;
		var list = this.state.items;
		var idx = 1;
		var attr = {
			attribute: 'Attribute',
			model_id: model.model_id, 
			type: 'TEXT',
			_dirty: true
		};
		// make the new attribute name unique
		while (list.some(item => item.name === attr.attribute))
			attr.attribute = 'Attribute ' + idx++;
		
		return modelActionCreators.create('attribute', false, attr)
	},

	addRelation: function () {
		var _this = this;
		var model = this.props.model;
		var list = this.state.items;
		var idx = 1;
		var rel = {
			relation: 'Relation',
			model_id: model.model_id, 
			_dirty: true
		};
		// make the new attribute name unique
		while (list.some(item => item.name === rel.relation))
			rel.relation = 'Relation ' + idx++;
		
		return modelActionCreators.create('relation', false, rel)
	},

	// RENDER ===================================================================

	render: function() {
		var _this = this;
		var view = this.props.view;
		var section = this.props.sections[0];
		var numTotalItems = this.state.items.length;
		var viewconfig = ViewConfigStore.get(view.cid || view.view_id)
		var currentCol = this.props._getColumnAt(viewconfig) || {}
		var trueIndex = 0

		var items = this.state.items.map(function (item, idx) {
			var itemProps = Object.assign({}, _this.props, {
				item: item,
				index: idx,
				trueIndex: trueIndex,
				minWidth: '500px',
				config: item,
				viewConfigParts: section ? section.configParts : null,
				_blurSiblings: _this.blurSiblings,
			}, _this.movableProps);
			
			trueIndex += (item.isSection ? 0 : 1)

			if (item.isSection) section = item;
			if (item.isSection) return <div 
				className = "menu-item menu-item-stacked"
					key = {'section-' + item.label}
					ref = {'section' + item.label}> 
				<div className="menu-sub-item menu-divider" 
					{...itemProps}>

					<span className = {"icon " + item.icon} style = {{flexGrow: 0}}/>
					<span style = {{flexGrow: 0}}>{item.label}</span>
					
				</div>
				{item.isEmpty ? <div className = "menu-sub-item menu-empty-item">{item.emptyText}</div> : null}
			</div>
			else return <ColumnDetail
				selected = {item.column_id === currentCol.column_id}
				key = {item.column_id}
				ref = {item.column_id}
				{...itemProps}/>
		});

    	return <div className = "dropdown-list" ref = "columnList">
			{items}
		</div>
	}
});

export default ColumnList;
