import React from "react";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from "react-router";
import _ from 'underscore';
import $ from 'jquery'

import styles from "./style.less";

import fieldTypes from "../../../fields";

import ColumnList from "./ColumnList";
import ColumnDetail from "./ColumnDetailSingleton";
import ColumnDropdownMenu from "./ColumnDropdownMenu";

import AttributeStore from "../../../../../stores/AttributeStore";
import ViewConfigStore from "../../../../../stores/ViewConfigStore";
import constant from '../../../../../constants/MetasheetConstants';
import util from "../../../../../util/util";

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx";

import PureRenderMixin from 'react-addons-pure-render-mixin';
import blurOnClickMixin from '../../../../../blurOnClickMixin';

import sortable from 'react-sortable-mixin';


var ColumnMenu = React.createClass({

	mixins: [blurOnClickMixin],

	// LIFECYCLE ==============================================================

	componentWillMount: function () {
		AttributeStore.addChangeListener(this._onChange);
	},

	getInitialState: function () {
		return {open: false}
	},

	componentWillUnmount: function () {
		AttributeStore.removeChangeListener(this._onChange);
	},

	_onChange: function () {
		this.forceUpdate();
	},

	// HANDLERS ===============================================================


	// UTILITY ================================================================

	
	// RENDER ===================================================================

	render: function() {
		var _this = this;
		var view = this.props.view;
		var viewconfig = ViewConfigStore.get(view.view_id)
		var data = view.data;
		var columns = view.data.columnList;
		var currentCol = this.props._getColumnAt(viewconfig);
		var numItems = view.data.columnList.length + this.props.sections.length
		
		//set the first section separately so you can't drag on top of it
		var firstSection = this.props.sections[0];
		var firstSectionIsEmpty = firstSection.selector(view).length === 0;

		var transitionProps = {
			transitionName: "fade-in",
			transitionAppear: true,
			transitionEnterTimeout: 500,
			transitionLeaveTimeout: 500,
			transitionAppearTimeout: 500
		};

    	return <div className = "double header-section">
			<div className="header-label">Attributes</div>
			<div className = "model-views-menu" onClick = {util.clickTrap}>
				<ReactCSSTransitionGroup className="model-views-menu-inner" 
					onClick = {_this.blurChildren} {...transitionProps}>
					{ 
					this.state.open ?
					<ColumnDropdownMenu {...this.props} key="dropdownmenu"/>
					: 
					currentCol ? 
					<ColumnDetail
						{...this.props}
						singleton = {true}
						ref = 'columnDetail'
						key = {currentCol.column_id}
						minWidth = "100px"
						_blurChildren = {_this.blurChildren}
						config = {currentCol}/>
					: 
					<div className="singleton menu-item menu-sub-item">
						No selection...
					</div>
					}
				</ReactCSSTransitionGroup>
				<div className={"dropdown" + (this.state.open ? "--open " : " ") 
					+ " icon--small icon icon-chevron-down"} 
					onClick = {this.handleOpen}>
				</div>
			</div>
		</div>;
	}
});

export default ColumnMenu;
