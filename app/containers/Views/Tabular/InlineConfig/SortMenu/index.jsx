import React from "react";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from "react-router";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import ViewStore from "../../../../../stores/ViewStore"
import ModelStore from "../../../../../stores/ModelStore"
import AttributeStore from "../../../../../stores/AttributeStore"

import SortDetail from "./SortDetail";
import SortList from './SortList';

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"
import util from "../../../../../util/util"
import PureRenderMixin from 'react-addons-pure-render-mixin';
import blurOnClickMixin from '../../../../../blurOnClickMixin';
import sortable from 'react-sortable-mixin';

import Dropdown from '../../../../Dropdown'



var SortMenu = React.createClass({

	componentWillMount: function () {
		this._debounceSave = _.debounce(this.handleSave, 2500)
	},

	getInitialState: function () {
		var view = this.props.view
		return {
			open: false,
			editing: false,
		}
	},

	chooseItem: function (e) {
		var choice = e.target.value
		var list = this.refs.list
		var item = {attribute_id: choice, descending: true};
		if (choice == 0) return;
		list.addItem(item);
		this._debounceSave()
	},

	handleSave: function () {
		var view = this.props.view
		view.data.sorting = this.refs.list.getItems()
		modelActionCreators.createView(view, true, true);
		this.setState({open: false})
	},

	handleCancel: function () {
		var view = this.props.view
		this.setState({
			open: false
		})
	},

	render: function() {
		var view = this.props.view
		var sortList = view.data.sorting

		var sortAttrs = _.pluck(sortList, 'attribute_id').map(parseInt)
		var sortPreview
		var attrSelections = [<option key = {0} value = {0}>-- Select attribute --</option>]

		if (sortList.length === 1) sortPreview = <SortDetail 
			sortSpec = {sortList[0]}
			_remove = {this.removeItem}
			_updateItem = {this.updateItem}
			view = {view}/>
		else if (sortList.length > 1) sortPreview = <div className="menu-item closed menu-sub-item">
			<span className="ellipsis">Multiple sort levels</span></div>
		else if (sortList.length === 0) sortPreview = <div className="menu-item closed menu-sub-item empty-item">
			<span className="ellipsis">Default sort order</span></div>

    	return <div className = "header-section">
			<div className="header-label">
				<span>Ordering:</span>
				<SortList {...this.props} ref = "list"/>
				<span style={{marginLeft: '10px'}}>
					<select style = {{width: "150px", height: "40px"}} className="renamer" onChange = {this.chooseItem}>
					<option>-- Choose -- </option>
					{AttributeStore.query({model_id: view.model_id})
					.filter(attr => fieldTypes[attr.type].sortable && 
						sortAttrs.indexOf(attr.attribute_id))
					.map(attr=>
						<option value={attr.cid || attr.attribute_id}>
							{attr.attribute}
						</option>
					)}
					</select>
				</span>
			</div>

		</div>
	}
});

export default SortMenu;
 