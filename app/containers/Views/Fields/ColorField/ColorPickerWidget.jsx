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
		util.clickTrap(e)
	},


	calcColorPick: function (e) {
		var container = $(ReactDOM.findDOMNode(this.refs.shadePicker))
		var offset = container.offset()
		var lightness = 1 - util.limit(0, 1, (e.clientY - offset.top) / container.height() )
		var saturation = util.limit(0, 1, (e.clientX - offset.left) / container.width() )

		this.setState({l: lightness, s: saturation})
	},

	handleShadeClick: function (e) {
		this.calcColorPick(e)
		this.debounceCommit()
	},

	handleHueClick: function (e) {
		var container = $(ReactDOM.findDOMNode(this.refs.huePicker))
		var offset = container.offset()
		var hue = util.limit(0, 1, (e.clientY - offset.top) / container.height()) * 360

		this.setState({h: hue})
	},

	render: function() {
		var hue = this.state.h
		var height = this.props.height || '80px'
		var saturationEndStop = tinycolor({h: hue, s: 0, l:100}).toRgbString()
		var saturationStartStop = tinycolor({h: hue, s: 100, l:50}).toRgbString()
		var gradientString = `linear-gradient(90deg, ${saturationEndStop} 0%, ${saturationStartStop} 100%)`
		var rainbowFilter = `saturate(${util.makePercent(parseFloat(this.state.s)/100 - 1)}) ` +
			`brightness(${util.makePercent(parseFloat(this.state.l)/100 - 1)})`;
		var colorString = tinycolor(this.state).toRgbString()

		console.log(rainbowFilter)

		return <div className = "poopdown-section" 
			style = {{
				position: 'relative',
				maxHeight: height, 
				height: height, 
				overflowY: 'hidden', 
				overflowX: 'hidden',
				marginTop: '2px',
				marginBottom: '2px'
			}}>
			<div style = {{
				position: 'absolute',
				left: 0,
				width: '78px',
				top: 0,
				bottom: 0,
				background: colorString
			}}/>
			<div className = "saturation-overlay"
				ref = "shadePicker" 
				onWheel = {this.handleWheel}
				onMouseDown = {this.handleShadeClick}
				style = {{height: '100%', left: '80px', right: '14px', display: 'block', background: gradientString, position: 'absolute'}}>
				<div className = "lightness-overlay" style = {{height: '100%', width: '100%', display: 'block'}}>
					<div className = "color-pointer" style = {{
						left: util.makePercent(this.state.s), 
						bottom: util.makePercent(this.state.l)}}/>
				</div>
			</div>
			<div className = "rainbow" 
			ref = "huePicker"
			onClick = {this.handleHueClick}
			style = {{
				right: 0, 
				width: '12px', 
				top: 0, bottom: 0, 
				position: 'absolute', 
				WebkitFiter: rainbowFilter
			}}>
				<div className = "hue-pointer" style = {{top: util.makePercent(hue / 360)}}/>
			</div>
		</div>
	}
});

export default ColorPickerWidget
