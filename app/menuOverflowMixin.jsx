import React from "react"
import _ from "underscore"
import util from "./util/util"

import constant from './constants/MetasheetConstants'
import modelActionCreators from "./actions/modelActionCreators.jsx"

var MenuOverflowMixin = {

	componentWillMount: function () {
		this._debounceCalibrateHeight = _.debounce(this.calibrateHeight, 500);
	},

	calibrateHeight: function () {
		var app = document.getElementById('application')
		this.setState({
			windowHeight: app.offsetHeight
		})
	}
}

export default MenuOverflowMixin;