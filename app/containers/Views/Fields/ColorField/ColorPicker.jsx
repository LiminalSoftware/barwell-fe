import React from "react"
import _ from "underscore"
import tinycolor from "tinycolor2"

// import styles from "./detailStyle.less"
import { Link } from "react-router"
import util from '../../../../util/util'
import PopDownMenu from "../../../../components/PopDownMenu"
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import CommitMixin from '../commitMixin'
import ColorValidationMixin from './ColorValidationMixin'
import MenuKeysMixin from '../MenuKeysMixin'

var NUM_HUES = 10

var ColorPicker = React.createClass({

	mixins: [ColorValidationMixin, CommitMixin, MenuKeysMixin],

	getInitialState: function () {
		return {selection: -1}
	},

	getNumberOptions: function () {
		return NUM_HUES
	},

	clickChoice: function (event) {
		var color = event.target.style.background
		this.setState({value: color})
		this.commitValue(color)
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
		
		var color = tinycolor(obj[config.column_id]).toRgbString()

		return <PopDownMenu {...this.props}>
			{hue.map(function (h) {
				var colorChoice = tinycolor('hsl(' + [h, sat[0], lit[0]].join(',') + ')').toRgbString()
				return <li> <span className = "color-choice"
					onClick = {_this.clickChoice}
					style = {{background: colorChoice}}>
					{color === colorChoice ?
						<span className = "icon white color-check icon-kub-approve"></span>
						: null}
				</span></li>
			})}
		</PopDownMenu>
	}
});

export default ColorPicker
