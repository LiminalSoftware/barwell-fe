import _ from "underscore"
import React from "react"
import ViewStore from "../../stores/ViewStore"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"

import modelActionCreators from "../../actions/modelActionCreators.jsx"

import blurOnClickMixin from '../../blurOnClickMixin';

var Dropdown = React.createClass({

	mixins: [blurOnClickMixin],

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return {
			open: false,
			selection: this.props.selection
		}
	},

	componentWillUnmount: function () {
		if (this.state.open) this.props._clearPopUp()
	},

	// HANDLERS ===============================================================

	handleClick: function (e) {
		this.props._showPopUp(Dropdown, {}, e);
	},

	// UTILITY ================================================================
	
	// RENDER =================================================================

	render: function () {
		var style = this.props.style || {}
		var selection = this.props.choices.filter(c => c.key === this.props.selection)[0] || {}

		return <div className="pop-down pop-stop" 
			style={style}
			onClick = {this.handleClick}>
				{selection.icon ? <span className = {"icon view-icon " + choice.icon}/> : null}
			    {selection.label || 'No selection'}
			
			{
				this.props.open ? 
				<div className = "pop-down-menu">
					{this.props.choices.map(function (choice) {

			        	return <div className = "new-item-choice" key = {choice.key}>
			            	{choice.icon ? <span className = {"icon view-icon " + choice.icon}/> : null}
			            	{choice.label}
			            </div>
			        })}
		        </div>
				:
				null
			}
			</div>
	}
})

export default Dropdown
