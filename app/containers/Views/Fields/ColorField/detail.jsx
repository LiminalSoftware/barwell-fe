import React from "react"
import _ from "underscore"
import tinycolor from "tinycolor2"

// import styles from "./detailStyle.less"
import { Link } from "react-router"
import util from '../../../../util/util'
// var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
import CommitMixin from '../commitMixin'
import ColorValidationMixin from './ColorValidationMixin'

var ColorDetail = React.createClass({

	mixins: [PureRenderMixin, ColorValidationMixin, CommitMixin],

	getInitialState: function () {
		return {}
	},

	clickChoice: function (event) {
		var colorChoice = event.target.style.background
		this.commitValue(colorChoice)
	},

	render: function() {
		var _this = this
    var model = this.props.model
    var view = this.props.view
		var obj = this.props.object
		var config = this.props.config

		var hue = util.sequence(0, 360, 17).map(Math.round)
		var sat = [0.8, 0.6, 0.4, 0.2].map(e => Math.round(e*100) + '%')
		var lit = util.sequence(0.3, 0.9, 3).map(e => Math.round(e*100)  + '%')

		// console.log(hue)
		var color = tinycolor(obj[config.column_id]).toRgbString()

		return <div className = "color-detail-inner">
			<div className = "header-label">Color picker </div>
			<div className = "color-detail-scroll">
			{hue.map(function (h) {

					return sat.map(function (s) {
						return <div className = "color-row">
							{lit.map(function (l) {
								var colorChoice = tinycolor('hsl(' + [h, s, l].join(',') + ')').toRgbString()
								return <span className = "color-choice"
									onClick = {_this.clickChoice}
									style = {{background: colorChoice}}>
									{color === colorChoice ?
										<span className = "icon white color-check icon-kub-approve"></span>
										: null}
								</span>
							})}
						</div>
					})
			})}
		</div>
		</div>
	}
});

export default ColorDetail
