import React from "react"
import _ from "underscore"
import tinycolor from "tinycolor2"

import modelActionCreators from "../../../../actions/modelActionCreators"

var ColorValidationMixin = {
	validator: function (input) {
    	if (!input) return 'rgba(255,255,255,0)'
    	var color = tinycolor(input).toRgbString()
		return color;
	},

	parser: function (input) {
		return input
	},
}

export default ColorValidationMixin
