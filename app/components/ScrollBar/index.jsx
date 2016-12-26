import React from "react"
import ReactDOM from "react-dom"
import update from 'react/lib/update'

import styles from "./style.less"

import _ from 'underscore'
import util from "../../util/util"
import PureRenderMixin from 'react-addons-pure-render-mixin';

const RHS_PADDING = 100
const SCROLL_MOUSE_MOVE_THROTTLE = 30

var ScrollBar = React.createClass ({

	// shouldComponentUpdate: function (nextProps, nextState) {
	// 	return this.props.innerDimension !== nextProps.innerDimension ||
	// 	this.props.offset !== nextProps.offset
	// },

	getInitialState: function () {
		return {
			position: 0,
			offset: 0
		}
	},

	componentWillMount: function () {
		this._throttleMouseMove = _.throttle(this.handleMouseMove, SCROLL_MOUSE_MOVE_THROTTLE, true);
	},

	componentDidMount: function () {
		const el = ReactDOM.findDOMNode(this)

		const dimension = el['offset' + 
			(this.props.axis === 'vertical' ? 'Height' : 'Width')]
		this.setState({dimension: dimension})
	},

	componentWillUpdate: function (newProps, newState) {
		if (!this.state.dragging && newState.dragging) {
			addEventListener('mousemove', this._throttleMouseMove)
			addEventListener('mouseup', this.handleMouseUp)
		} else if (this.state.dragging && !newState.dragging) {
		   removeEventListener('mousemove', this._throttleMouseMove)
		   removeEventListener('mouseup', this.handleMouseUp)
		}
	},

	handleMouseWheel: function (e) {
		const {visibleDim, totalDim} = this.props
		const delta = (this.props.axis === 'vertical') ? e.deltaY : e.deltaX;
		const limit = visibleDim > totalDim ? 0 : (1 - visibleDim / totalDim)
		const offset = Math.min(Math.max(this.state.offset + delta/totalDim, 0), limit)
		
		this.doScroll(offset)
		e.preventDefault();
	},

	scrollTo: function (pos) {
		const {visibleDim, totalDim} = this.props
		const limit = visibleDim > totalDim ? 0 : (1 - visibleDim / totalDim)
		const offset = Math.min(Math.max(pos/totalDim, 0), limit)

		this.doScroll(offset)
	},

	doScroll: function (offset) {
		this.setState({offset: offset})
		this.props._setScrollOffset(offset * this.props.totalDim);
	},

	handleMouseUp: function (e) {
		this.setState(update(this.state, {$merge: {
			dragging: false
		}}))
	},

	handleMouseDown: function (e) {
		const {axis} = this.props
		this.setState(update(this.state, {$merge: {
			dragging: true,
			initialDragOffset: this.state.offset,
			rel: axis === 'vertical' ? e.pageY : e.pageX
		}}))
	},

	handleMouseMove: function (e) {
		const {axis, totalDim, visibleDim} = this.props
		const {initialDragOffset, rel} = this.state
		const limit = 1 - visibleDim / totalDim
		const cursorPos = (axis === 'vertical') ? e.pageY : e.pageX
		const target = (cursorPos - rel)/visibleDim + initialDragOffset
		const offset = Math.max(Math.min(target, limit), 0)

		this.doScroll(offset)
	},

	render: function () {
		
		const {axis, totalDim, startOffset, endOffset, side, visibleDim} = this.props

		// if (!visibleDim || (visibleDim > totalDim))
			// return <div className = "scroll-bar-outer" style = {outerStyle}/>

		let outerStyle =  {
			position: 'absolute',
			display: 'block'
		}

		let innerStyle = {}

		if (!visibleDim || (visibleDim > totalDim)) innerStyle.opacity = 0

		if (axis === 'vertical') {
			if (side === 'left') outerStyle.left = 0
			else outerStyle.right = 0
			outerStyle[this.props.side || 'right'] = 0
			outerStyle.top = startOffset
			outerStyle.bottom = endOffset

			outerStyle.width = 20

			innerStyle.top = util.makePercent(this.state.offset)
			innerStyle.height = util.makePercent(visibleDim / totalDim);

		} else if (axis === 'horizontal') {
			outerStyle[this.props.side || 'bottom'] = 0
			outerStyle.right = endOffset
			outerStyle.left = startOffset

			outerStyle.height = 20
			innerStyle.left = util.makePercent(this.state.offset)
			innerStyle.width = util.makePercent(visibleDim / totalDim);
		}

		return <div className = "scroll-bar-outer"
			style = {outerStyle}
			onMouseDown = {util.clickTrap}
			onDoubleClick = {util.clickTrap}
			ref = "overlay">
				<div className = {"scroll-bar-inner-" + axis + (this.state.dragging ? ' scrollbar-dragging' : '')}
					onMouseDown = {this.handleMouseDown}
					style = {innerStyle}
					ref = "overlay-inner">
				</div>
		</div>
	}
})

export default ScrollBar
