import _ from "underscore"
import React from "react"
import ViewStore from "../../stores/ViewStore"
import styles from "./style.less"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"

import modelActionCreators from "../../actions/modelActionCreators.jsx"

import util from '../../util/util'
import popdownClickmodMixin from '../Views/Fields/popdownClickmodMixin'
import blurOnClickMixin from '../../blurOnClickMixin';

var NewViewAdder = React.createClass({

	mixins: [],

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return {open: false}
	},

	// HANDLERS ===============================================================

	handleOpen: function (e) {
		this.setState({open: true})
		util.clickTrap(e)
	},

	// UTILITY ================================================================
	
	// RENDER =================================================================

	getIcon: function () {
		return 'icon icon-plus'
	},

	getContent: function () {
		return 'Add new view'
	},

	renderChoices: function () {
		return <div className = "popdown-section">
		{_.map(viewTypes, function (type, typeKey) {
        	return <div className = "menu-item menu-sub-item" key = {typeKey}>
            	<span className = {"icon " + type.icon}/>
            	{type.type}
            </div>
        })}
        </div>
	},

	render: function () {
		var style = {
			maxHeight: this.state.open ? '300px' : '40px'
		}

		return <div className="menu-section" style = {style}>
			<div className="menu-item menu-config-row menu-sub-item" 
				onMouseDown = {this.handleOpen}>
				<div className = "menu-divider-inner">
					<span className = "icon icon-plus"/>
					Add new view
				</div>
			</div>
			{this.state.open ? this.renderChoices() : null}
			
		</div>
	}
})

export default NewViewAdder
