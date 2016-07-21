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

	mixins: [blurOnClickMixin],

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
		console.log('bbbbb');
		list.addItem(item);
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

		AttributeStore.query({model_id: view.model_id}).forEach(function (attr) {
			var type = fieldTypes[attr.type]
			if (_.contains(sortAttrs, attr.attribute_id)) return;
			if (!type || !type.sortable) return
			var attribute_id = (attr.cid || attr.attribute_id)
			attrSelections.push({label: attr.attribute, key: attribute_id});
		})

    	return <div className = "header-section">
			<div className="header-label">
				Ordering
				<div className="dropdown icon--small icon icon-chevron-down" onClick = {this.handleOpen}></div>
			</div>
			<div className="header-config-section">
				<div key = "menu" className="dropdown-menu" style = {{minWidth: "300px"}}>
					<SortList {...this.props} ref = "list"/>
					<div className = "menu-item menu-sub-item">
						<span>
							<Dropdown _choose = {this.chooseItem}
								choices = {attrSelections}/>
						</span>
					</div>
				</div>
				
			</div>

		</div>
	}
});

export default SortMenu;
