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
		return { name: view.view }
	},

	// UTILITY ================================================================


	// HANDLERS ===============================================================

	handleNameChange: function (e) {
		this.setState({name: e.target.value})
	},

	handleBlurName: function (e) {
		var view = this.props.view;
		view.view = this.state.name
		modelActionCreators.create("view", false, view);
	},
	
	handleClickDelete: function (e) {
		var view = this.props.view;
		modelActionCreators.destroy("view", false, view);
		util.clickTrap(e)
	},

	// RENDER =================================================================

	render: function () {
		var view = this.props.view
		var model = this.props.model

		if (view)
			return <div className = "menu-item menu-sub-item  "  style = {{minWidth: "250px"}}>
				<span ref = "grabber" className="draggable drag-grid"/>
				<span className = {"icon " + viewTypes[view.type].icon}></span>
				<span className = {"double ellipsis " + (this.state.deleting ? " strike-through" : "")}>
					<input className = "menu-input text-input"
						value = {this.state.name}
						onClick = {util.clickTrap}
						onBlur = {this.handleBlurName}
						onChange = {this.handleNameChange}/>
				</span>
				<span style = {{maxWidth: '30px', textAlign: 'center'}}>
					<span className = "icon icon-circle-minus"
						onClick = {this.handleClickDelete}/>
				</span>
			</div>
		else return <div className = "singleton menu-item menu-sub-item no-left-padding ">
			<span className = "large icon icon-pencil-ruler"></span>
			<span className = "double-column-config">Designer</span>
		</div>
	}

})

export default ViewItemMovable
