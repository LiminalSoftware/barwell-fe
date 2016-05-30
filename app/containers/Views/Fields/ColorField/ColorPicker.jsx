import React from "react"
import _ from "underscore"
import tinycolor from "tinycolor2"

// import styles from "./detailStyle.less"
import { Link } from "react-router"
import util from '../../../../util/util'
import PopDownMenu from "../../../../components/PopDownMenu"

import PureRenderMixin from 'react-addons-pure-render-mixin';
import CommitMixin from '../commitMixin'
import ColorValidationMixin from './ColorValidationMixin'
import MenuKeysMixin from '../MenuKeysMixin'
import makeColorPickerRows from './makeColorPickerRows'

var NUM_HUES = 10

var ColorPicker = React.createClass({

	mixins: [ColorValidationMixin, CommitMixin, MenuKeysMixin],

	getInitialState: function () {
		return {selection: -1}
	},

	getNumberOptions: function () {
		return NUM_HUES
	},

	clickChoice: function (e) {
		var color = e.target.style.background;
		this.setState({value: color, open: false});
		this.commitValue(color);
	},

	render: function() {
		var _this = this
    	var model = this.props.model
    	var view = this.props.view
		var obj = this.props.object
		var config = this.props.config

		var hue = util.sequence(0, 360, 12).map(Math.round)
		var sat = [0.6].map(e => Math.round(e*100) + '%')
		var lit = [0.5].map(e => Math.round(e*100)  + '%')
		
		var current = obj[config.column_id]

		return <PopDownMenu {...this.props} green = {true}>
			{makeColorPickerRows(current, this.clickChoice)}
		</PopDownMenu>
	}
});

export default ColorPicker
