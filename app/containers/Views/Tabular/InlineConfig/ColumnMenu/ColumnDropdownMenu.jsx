// LIBRARIES
import React from "react";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from "react-router";
import _ from 'underscore';

// STORES
import AttributeStore from "../../../../../stores/AttributeStore";
import ViewConfigStore from "../../../../../stores/ViewConfigStore";

// UTILITES
import constant from '../../../../../constants/MetasheetConstants';
import util from "../../../../../util/util";
import modelActionCreators from "../../../../../actions/modelActionCreators.jsx";
import PureRenderMixin from 'react-addons-pure-render-mixin';
import blurOnClickMixin from '../../../../../blurOnClickMixin';
import sortable from 'react-sortable-mixin';

// COMPONENTS
import ColumnAdder from './ColumnAdder'
import ColumnList from "./ColumnList";


var ColumnDropdownMenu = React.createClass({

	// LIFECYCLE ==============================================================

	componentWillMount: function () {
		AttributeStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function () {
		AttributeStore.removeChangeListener(this._onChange);
	},

	_onChange: function () {
		this.forceUpdate();
	},

	// HANDLERS ===============================================================

	handleAddColumn: function () {
		this.setState({editing: true})
		this.refs.list.blurSiblings();
		this.refs.list.addItem()
	},

	// UTILITY ================================================================

	blurChildren: function () {
		if (this.refs.list) this.refs.list.blurSiblings()
		this.props._clearPopUp()
	},

	markDirty: function (isDirty) {
		this.setState({dirty: (isDirty === false) ? false : true})
	},

	commitViewUpdates: function () {
		this.setState({dirty: false})
		this.refs.list.commitViewUpdates(true);
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

	render: function() {
		var view = this.props.view;
		var columns = view.data.columnList;
		var numItems = view.data.columnList.length + this.props.sections.length
		
		//set the first section separately so you can't drag on top of it
		var firstSection = this.props.sections[0];
		var firstSectionIsEmpty = firstSection.selector(view).length === 0;

    	return <div className = "dropdown-menu" style = {{minWidth: '550px'}} onMouseDown = {util.clickTrap}>
			<div className="menu-sub-item menu-divider" >
				<div className = "menu-divider-inner" >
					<span className = {"icon " + firstSection.icon} style = {{flexGrow: 0}}/>
					<span style = {{flexGrow: 0}}>{firstSection.label}</span>
				</div>
			</div>

			{firstSectionIsEmpty ? 
			<div className = "menu-sub-item menu-empty-item">
				{firstSection.emptyText}
			</div> 
			: null}
						
			<ColumnList 
				{...this.props} ref = "list" 
				_markDirty = {this.markDirty}
				_blurChildren = {this.blurChildren}/>

			<div className="menu-sub-item menu-divider" >

				<ColumnAdder {...this.props} />
			
				<div className = "menu-divider-inner--green" onClick = {this.addRelation} >
					<span className = "icon icon-plus"/>
					<span>Add new relation</span>
				</div>

			</div>						
		</div>
	}
});

export default ColumnDropdownMenu;

