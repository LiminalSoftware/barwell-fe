import _ from "underscore"
import React from "react"
import ViewStore from "../../stores/ViewStore"
import styles from "./style.less"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"

import modelActionCreators from "../../actions/modelActionCreators.jsx"




var NewViewAdder = React.createClass({

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return {
		}
	},

	// HANDLERS ===============================================================

	handleShowChoices: function () {
		this.setState({editing: true})
	},

	// UTILITY ================================================================
	
	// RENDER =================================================================


	render: function () {
		
		return <div className = "menu-item menu-sub-item menu-divider" key = "add-row">
			<div className="menu-divider-inner--green" onClick = {this.handleShowChoices}>
				<span className = "icon icon-plus"/>
				Add new metaphor
			</div>
			{
				this.state.editing ? 
				_.map(viewTypes, function (type, typeKey) {
		        	return <div className = "inner-inner-choice" key = {typeKey}>
		            	<span className = {"large icon view-icon " + type.icon}/>
		            	{type.type}
		            </div>
		        })
				:
				null
			}
		</div>
			
	}
})

export default NewViewAdder
