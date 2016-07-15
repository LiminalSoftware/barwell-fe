import React from "react";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from "react-router";
import _ from 'underscore';
import $ from 'jquery'

import styles from "./style.less";

import fieldTypes from "../../../fields";

import ColumnList from "./ColumnList";
import ColumnDetail from "./ColumnDetailSingleton";

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
		// ViewConfigStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function () {
		AttributeStore.removeChangeListener(this._onChange);
		// ViewConfigStore.removeChangeListener(this._onChange);
		this.refs.popUp
		this.handleCancelChanges()
	},

	componentWillUpdate: function (nextProps, nextState) {
		if (this.state.open && !nextState.open)
			this.handleCancelChanges()
	},

	getInitialState: function () {
		return {
			open: false,
			editing: false,
			context: false,
			popUp: null,
			dirty: false
		};
	},

	_onChange: function () {
		this.forceUpdate();
	},


	// HANDLERS ===============================================================

	handleEdit: function () {
		if (this.refs.list.revertChanges) this.refs.list.revertChanges();
		this.blurChildren()
		this.setState({editing: true, dirty: false, configPart: null});
	},

	handleCancelChanges: function () {
		this.blurChildren()
		this.setState({editing: false})
		this.commitAttributeChanges(false)
	},

	handleSaveChanges: function () {
		this.blurChildren()
		this.setState({open: false})
		this.commitAttributeChanges(true);
	},

	handleAddColumn: function () {
		this.setState({editing: true})
		this.refs.list.blurSiblings();
		this.refs.list.addItem()
	},

	showPopUp: function (part, configProps, e) {
		var offset = $(e.target).closest('.pop-down').offset()
		configProps.style = {
			position: 'fixed',
			left: offset.left + 'px',
			top: offset.top + 'px',
		}
		configProps.open = true;
		configProps.ref = 'popUp'
		
		this.setState({popUpPart: part, popUpConfig: configProps, context: true})
		if (e) util.clickTrap(e)
	},

	// UTILITY ================================================================

	blurChildren: function () {
		this.setState({popUpPart: null})
		if (this.refs.list) this.refs.list.blurSiblings()
	},

	markDirty: function (isDirty) {
		this.setState({dirty: (isDirty === false) ? false : true})
	},

	commitViewUpdates: function () {
		this.setState({dirty: false})
		this.refs.list.commitViewUpdates(true);
	},

	_setScrollOffset: function (offset) {
		// ReactDOM.find columnList
		console.log('scroll: ' + offset)
	},

	commitAttributeChanges: function (save) {
		var _this = this;
		var model = this.props.model;
		
		return AttributeStore.query({model_id: model.model_id}).map(function (attr) {
			if (attr.attribute_id && !save) {
				return modelActionCreators.revert('attribute', attr);
			} 

			else if (!attr.attribute_id && save) {
				var copy = 'Attribute ' + attr.attribute + ' added to model ' + model.model;
				return modelActionCreators.create('attribute', true, attr, {narrative: copy, icon: 'icon-pencil-ruler'});
			} 

			else if (attr.attribute_id && attr._dirty && !attr._destroy && save) {
				var copy = 'Attribute "' + attr.attribute + '"'
				if (attr._server.type !== attr.type) copy += ' type updated'
				else if (attr._server.attribute !== attr.attribute) copy += ' renamed'
				else copy += ' updated'

				return modelActionCreators.create('attribute', true, attr, {narrative: copy, icon: 'icon-pencil-ruler'});
			}

			else if (attr.attribute_id && attr._destroy && save) {
				var copy = 'Attribute "' + attr.attribute + '" removed from model "' + model.model + '"';
				return modelActionCreators.destroy('attribute', true, attr, {narrative: copy, icon: 'icon-pencil-ruler'});
			} 

			else if (attr.attribute_id && attr._destroy && !save) {
				return modelActionCreators.revert('attribute', attr);
			}
		})
		_this.setState({editing: false});
	},

	
	// RENDER ===================================================================

	renderButtonBar: function () {
		var editing = this.state.editing;
		return <div key = "buttons">
			{
				this.props.confirmChanges && this.state.dirty ?
				<div className="menu-item menu-config-row">
					<div className = "menu-sub-item menu-clickable" onClick = {this.commitViewUpdates}>
					<span className = "icon icon-check"/> Update groupings
					</div>
				</div> : null
			}
			{
				editing ?
				<div className="menu-item menu-config-row"
					onClick = {this.handleAddColumn}>
					<div className = "menu-sub-item  menu-clickable">
					<span className = "icon icon-plus"/> Add column
					</div>
				</div> : null
			}
			<div className="menu-item menu-config-row" key="detail-menu-items">
			{
				this.state.editing ?
				<div className = "menu-sub-item  menu-clickable"
					onClick = {this.handleSaveChanges}>
					<span className = "icon icon-check"/>
					Save changes
				</div>
				:
				<div className = "menu-sub-item  menu-clickable"
					onClick = {this.handleEdit}>
					<span className = "icon icon-pencil"/> 
					Edit columns
				</div>
			}
			{
				this.state.editing ?
				<div className = "menu-sub-item menu-clickable"
					onClick = {this.handleCancelChanges}>
					<span className = "icon icon-cross2"/>
					Cancel changes
				</div>
				:
				<div className = "menu-sub-item menu-clickable"
					onClick = {this.handleAddColumn}>
					<span className = "icon icon-plus"/>
					Add column
				</div>
			}
			</div>

		</div>
	},

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

    	return <div className = "double header-section" >
			<div className="header-label">Attributes</div>
				<div className = "model-views-menu">

					<div onClick={this.clickTrap}
						className="model-views-menu-inner">
						{
							this.state.open ? 
							<div className = "dropdown-menu" style = {{minWidth: '550px'}}>
								<div className="menu-sub-item menu-divider" 
									onClick = {_this.blurChildren} 
									style = {{overflowY: 'scroll'}}>
									<div className = "menu-divider-inner" >
										<span className = {"icon " + firstSection.icon} style = {{flexGrow: 0}}/>
										<span style = {{flexGrow: 0}}>{firstSection.label}</span>
									</div>
								</div>
								{firstSectionIsEmpty ? <div className = "menu-sub-item menu-empty-item">{firstSection.emptyText}</div> : null}
								
								<ColumnList 
									{...this.props} ref = "list" 
									_showPopUp = {this.showPopUp}
									_markDirty = {this.markDirty}
									_blurChildren = {_this.blurChildren}
									editing = {this.state.editing}/>
								
								
								<div className="menu-sub-item menu-divider" 
									onClick = {_this.blurChildren} 
									style = {{overflowY: 'scroll'}}>
									<div className = "menu-divider-inner--green" >
										<span className = "icon icon-plus"/>
										<span>Add new attribute</span>
									</div>
								</div>
								
							</div>

							:
							currentCol ? 
							<ColumnDetail
								ref = 'columnDetail'
								key = {currentCol.column_id}
								minWidth = '100px'
								_showPopUp = {_this.showPopUp}
								_blurChildren = {_this.blurChildren}
								config = {currentCol} view = {view}/>
							
							:
							<div className="singleton menu-item menu-sub-item">
								No selection...
							</div>
						}
					{this.state.popUpPart && (this.state.open || this.state.context) ?
						React.createElement(this.state.popUpPart, this.state.popUpConfig)
						: null }
					</div>
				<div className={"dropdown" + (this.state.open ? "--open " : " ") 
					+ " icon--small icon icon-chevron-down"} 
					onClick = {this.handleOpen}>
				</div>
			</div>
		</div>
	}
});

export default ColumnMenu;
