import React from "react";
import sortable from 'react-sortable-mixin';
import viewTypes from "../Views/viewTypes";
import util from '../../util/util.js'
import modelActionCreators from "../../actions/modelActionCreators.jsx"

var ViewItemMovable = React.createClass({

	mixins: [sortable.ItemMixin],

	dragRef: "grabber",

	// LIFECYCLE ==============================================================

	getInitialState: function () {
			var view = this.props.view || {}
			return {
				name: view.view,
				editing: false,
				deleting: false
			}
	},

	// UTILITY ================================================================

	saveChanges: function () {
		console.log('saveChanges ViewItemMovable')
		var view = this.props.view || {};
		
		if (!this.state.deleting && (!view.view_id || view.view !== this.state.name)) {
			view.view = this.state.name
			modelActionCreators.createView(view, true);
		}
		if (this.state.deleting) {
			modelActionCreators.destroy("view", !!view.view_id, view);
		}
	},

	revertChanges: function () {
		var view = this.props.view || {};
		this.setState({editing: false, deleting: false});
		if (!view.view_id) modelActionCreators.destroyView(view, false);
	},


	// HANDLERS ===============================================================

	handleNameChange: function (e) {
		this.setState({name: e.target.value})
	},

	handleClickEdit: function (e) {
		this.setState({editing: true})
		util.clickTrap(e)
	},
	
	handleClickDelete: function (e) {
		var view = this.props.view;
		this.setState({
			name: view.view,
			deleting: true
		})
		util.clickTrap(e)
	},

	handleClickRestore: function (e) {
		var view = this.props.view;
		this.setState({
			editing: false,
			deleting: false,
			name: view.view
		});
		util.clickTrap(e);
	},

	// RENDER =================================================================

	render: function () {
		var view = this.props.view
		var model = this.props.model

		if (view)
			return <div className = "menu-item menu-sub-item menu-clickable "  style = {{minWidth: "300px"}}>
				<span ref = "grabber" className="draggable drag-grid"/>
				<span className = {"icon " + viewTypes[view.type].icon}></span>
				<span className = {"double ellipsis " + (this.state.deleting ? " strike-through" : "")}>
					{this.state.editing  && !this.state.deleting ?
						<input className = "menu-input text-input"
							value = {this.state.name}
							onClick = {util.clickTrap}
							onChange = {this.handleNameChange}/>
						: view.view}
				</span>
				{!this.state.deleting && !this.state.editing?
					<span className = "icon icon-pencil "
						onClick = {this.handleClickEdit}/> : 
					!this.state.deleting ?
						<span className = "icon icon-undo2"
						onClick = {this.handleClickRestore}/>
					: null}
				{this.state.deleting ?
					<span className = "icon icon-undo2"
						onClick = {this.handleClickRestore}/> :
					<span className = "icon icon-cross-circle"
						onClick = {this.handleClickDelete}/>}
			</div>
		else return <div className = "singleton menu-item menu-sub-item no-left-padding ">
			<span className = "large icon icon-pencil-ruler"></span>
			<span className = "double-column-config">Database Configuration</span>
		</div>
	}

})

export default ViewItemMovable
