import React from "react"
import _ from "underscore"
import tinycolor from "tinycolor2"

import modelActionCreators from "../../../../actions/modelActionCreators"

var ColorValidationMixin = {
  validator: function (input) {
    if (!input) return null
    return tinycolor(input).toRgbString()
		// if ((/^\s*(#[0-9A-F]{3,6}|rgb\(\d+,\s*\d+,\s*\d+\)|hsl\(\d+\s*,\s*\d+[%]\s*,\s*\d+[%]\s*\))\s*$/i).test(input)){
		// 	return input
		// } else {
		// 	return null
		// }
	},

	parser: function (input) {
		return input
	},
}

export default ColorValidationMixin
