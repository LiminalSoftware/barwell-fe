import style from './style.less'

import React from "react"
import ReactDOM from "react-dom"

import _ from "underscore"
import tinycolor from "tinycolor2"
import $ from 'jquery'

// import styles from "./detailStyle.less"
import { Link } from "react-router"
import util from '../../../../util/util'
import PopDownMenu from "../../../../components/PopDownMenu"

import PureRenderMixin from 'react-addons-pure-render-mixin';
import CommitMixin from '../commitMixin'
import ColorValidationMixin from './ColorValidationMixin'
import MenuKeysMixin from '../MenuKeysMixin'

const COMMIT_DEBOUNCE = 1000


var makePercent = function (num) {
	return _.isNumber(num) ? 
		Math.round(num * 1000) / 10 + '%'
		: num
}


var ColorPickerWidget = React.createClass({

	getInitialState: function () {
		return this.propsToState(this.props)
	},

	componentWillMount: function () {
		this.debounceCommit = _.debounce(this.commit, COMMIT_DEBOUNCE)
	},

	commit: function () {
		var colorString = tinycolor(this.state).toRgbString()
		this.props._chooseColor(colorString)
	},

	// componentWillReceiveProps: function (props) {
	// 	this.setState(this.propsToState(props))
	// },

	propsToState: function (props) {
		var color = tinycolor(props.color)
		if (!color.isValid()) 
			color = tinycolor('rgba(254,255,255,1)')
		return color.toHsl()
	},

	handleWheel: function (e) {
		var hue = (this.state.h + e.deltaY/20).mod(360);
		this.setState({h: hue})
		this.debounceCommit()
	},


	calcColorPick: function (e) {
		var container = $(ReactDOM.findDOMNode(this))
		var offset = container.offset()
		var lightness = 1 - util.limit(0, 1, (e.clientY - offset.top) / container.height() )
		var saturation = util.limit(0, 1, (e.clientX - offset.left) / container.width() )

		this.setState({l: lightness, s: saturation})
	},

	handleMouseDown: function (e) {
		this.calcColorPick(e)
		this.debounceCommit()
	},

	render: function() {
		var hue = this.state.h

		var saturationEndStop = tinycolor({h: hue, s: 0, l:100}).toRgbString()
		var saturationStartStop = tinycolor({h: hue, s: 100, l:50}).toRgbString()
		var gradientString = `linear-gradient(90deg, ${saturationEndStop} 0%, ${saturationStartStop} 100%)`

		return <div className = "saturation-overlay" 
			onWheel = {this.handleWheel}
			onMouseDown = {this.handleMouseDown}
			style = {{height: '100%', width: '100%', display: 'block', background: gradientString}}>
			<div className = "lightness-overlay" style = {{height: '100%', width: '100%', display: 'block'}}>
				<div className = "color-pointer" style = {{
					left: makePercent(this.state.s), 
					bottom: makePercent(this.state.l)}}/>
			</div>
		</div>
	}
});

export default ColorPickerWidget
