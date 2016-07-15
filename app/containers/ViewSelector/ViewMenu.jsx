import _ from "underscore"
import React from "react"
import ViewStore from "../../stores/ViewStore"
import styles from "./style.less"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"

import modelActionCreators from "../../actions/modelActionCreators.jsx"

import sortable from 'react-sortable-mixin';

import ViewList from './ViewList'
import ViewItemSingleton from './ViewItemSingleton';

import ModelConfigStore from "../../stores/ModelConfigStore";

import menuOverflowMixin from '../../menuOverflowMixin'

import sortItems from './sortItems';

var ViewMenu = React.createClass({

	mixins: [menuOverflowMixin],

	// LIFECYCLE ==============================================================

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange);
		ModelConfigStore.addChangeListener(this._onChange);
		this.calibrateHeight();
	},

	componentWillUnmount: function () {
		ViewStore.removeChangeListener(this._onChange);
		ModelConfigStore.removeChangeListener(this._onChange);
	},

	getInitialState: function () {
		return {editing: false}
	},

	// HANDLERS ===============================================================
	
	_onChange: function () {
		this.forceUpdate()
	},

	handleAddNewView: function (type, e) {
		this.refs.viewList.addNewView(type);
		this.setState({adding: false});
	},

	toggleEdit: function () {
		if (this.state.editing) this.save()
		this.setState({editing: !this.state.editing})
	},

	// UTILITY ================================================================

	save: function () {
		ViewStore.query({model_id: this.props.model.model_id}).map(function (view) {
			if (view._destroy) modelActionCreators.destroy("view", true, view);
			else if (view._dirty)modelActionCreators.create("view", true, view);
		})
		this.setState({editing: false})
	},

	// RENDER =================================================================

	render: function () {
		var _this = this;
		var model = this.props.model;
		var view = this.props.view || {};
		var views = ViewStore.query({model_id: model.model_id}).filter(v => !v._destroy);
		var editing = this.state.editing;
		var config = ModelConfigStore.get(model.model_id) || {};

		views = sortItems(model, views, this.props.config);

		return <div className = "dropdown-menu "
					key = "list-wrapper"
					style = {{minWidth: "250px", maxHeight: (this.state.windowHeight - 100) + 'px'}}>

				<div className = "menu-item menu-sub-item menu-divider" key = "custom-views">
					<div className="menu-divider-inner">
						<span className = "icon icon-binoculars"/>
						All Metaphors
						<span className = {"icon icon-cog config-toggle" 
							+ (this.state.editing ? '--toggled' : '')}
							onClick = {this.toggleEdit}/>
					</div>
				</div>
			
				<ViewList ref = "viewList"
					items = {views}
					editing = {this.state.editing} 
					config = {config}
					{..._this.props}
					key = "orderable-list"/>
			
		</div>
	}
})

export default ViewMenu
