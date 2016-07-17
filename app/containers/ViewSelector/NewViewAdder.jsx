import _ from "underscore"
import React from "react"
import ViewStore from "../../stores/ViewStore"
import styles from "./style.less"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"

import modelActionCreators from "../../actions/modelActionCreators.jsx"

import blurOnClickMixin from '../../blurOnClickMixin';

var NewViewAdder = React.createClass({

	mixins: [blurOnClickMixin],

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return {open: false}
	},

	// HANDLERS ===============================================================

	handleClick: function (e) {
		console.log('handleClick')
		this.props._showPopUp(NewViewAdder, {}, e);
	},

	// UTILITY ================================================================
	
	// RENDER =================================================================

	render: function () {
		console.log('open: ' + this.props.open)
		var style = this.props.style || {}
		style.zIndex = '510'

		return <div className="menu-divider-inner--green pop-stop" 
			style={style}
			onClick = {this.handleClick}>
				<span style = {{display: 'block'}}>
					<span className = "icon icon-plus"/>
					Add new view
				</span>
			
			{
				this.props.open ? 
				<div className = "">
					{_.map(viewTypes, function (type, typeKey) {
			        	return <div className = "new-item-choice" key = {typeKey}>
			            	<span className = {"large icon view-icon " + type.icon}/>
			            	{type.type}
			            </div>
			        })}
		        </div>
				:
				null
			}
			</div>
	}
})

export default NewViewAdder
