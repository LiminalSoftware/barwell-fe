// LIBRARIES
import React from "react";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from "react-router";
import _ from 'underscore';

// STORES
import AttributeStore from "../../../../stores/AttributeStore";
import ViewConfigStore from "../../../../stores/ViewConfigStore";

// UTILITES
import constant from "../../../../constants/MetasheetConstants";
import util from "../../../../util/util";
import modelActionCreators from "../../../../actions/modelActionCreators.jsx";
import PureRenderMixin from 'react-addons-pure-render-mixin';
import blurOnClickMixin from "../../../../blurOnClickMixin";
import sortable from 'react-sortable-mixin';

// COMPONENTS
import ColumnAdder from './ColumnAdder'
import ColumnList from "./ColumnList";


var ColumnDropdownMenu = React.createClass({

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return {
			addingAttribute: false,
		}
	},

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

	handleAddAttribute: function () {
		this.setState({addingAttribute: true})
		this.refs.list.blurSiblings();
	},

	// UTILITY ================================================================

	blurChildren: function () {
		if (this.refs.list) this.refs.list.blurSiblings()
	},

	markDirty: function (isDirty) {
		this.setState({dirty: (isDirty === false) ? false : true})
	},

	commitViewUpdates: function () {
		this.setState({dirty: false})
		this.refs.list.commitViewUpdates(true);
	},
	
	// RENDER ===================================================================

	render: function() {
		var view = this.props.view;
		var columns = view.data._columnList;
		var numItems = view.data._columnList.length + this.props.sections.length
		
		//set the first section separately so you can't drag on top of it
		var firstSection = this.props.sections[0];
		var firstSectionIsEmpty = firstSection.selector(view).length === 0;

    	return <div className = "header-section">
    		<div className="header-label">Attributes</div>

    		<div className="header-config-section">
				<div className="menu-sub-item menu-divider" >
					<span className = {"icon " + firstSection.icon} style = {{flexGrow: 0}}/>
					<span style = {{flexGrow: 0}}>{firstSection.label}</span>
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

				<ColumnAdder {...this.props} config = {{}}/>
				
			</div>					

			
			
		</div>
	}
});

export default ColumnDropdownMenu;

