import _ from "underscore"
import React from "react"
import { Link } from "react-router"

import fieldTypes from "../../../fields"

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"
import blurOnClickMixin from '../../../../../blurOnClickMixin';
import popdownClickmodMixin from '../../../Fields/popdownClickmodMixin'

var ColumnAdder = React.createClass({

	mixins: [blurOnClickMixin, popdownClickmodMixin],

	// LIFECYCLE ==============================================================

	partname: 'NewAttributePicker',

	// classes: 'popdown-borderless',

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return {open: false}
	},

	// HANDLERS ================================================================

	

	// RENDER ===================================================================

	getIcon: function () {
		return  " icon icon-plus"
	},

	// getContent: function () {
	// 	return 'Add new attribute'
	// },

	menuWidth: '550px',

	renderMenu: function () {
		var config = this.props.config
		var fieldType = fieldTypes[config.type] || {}
		if (fieldType.unchangeable) return <div className = "popdown-section">
			This attribute cannot be changed.
		</div>
		else return <div className="popdown-section">
			<div className="popdown-item bottom-divider title">
				Choose Attribute Type:
			</div></div>
	},
})

export default ColumnAdder