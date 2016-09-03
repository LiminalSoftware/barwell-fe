import React from "react"
import ReactDOM from "react-dom"
import update from 'react/lib/update'

import styles from "./style.less"

import _ from 'underscore'
import util from "../../../../util/util"
import PureRenderMixin from 'react-addons-pure-render-mixin';

var RHS_PADDING = 100

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
		this._throttleMouseMove = _.throttle(this.handleMouseMove, 30, true);
		// this._debounceHandleScroll = _.throttle(this.handleScroll, 15, true);
		this._debounceHandleScroll = this.handleScroll
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

	handleScroll: function (e) {
		this.props._setScrollOffset(this.state.offset * this.props.totalDim);
	},

	handleMouseWheel: function (e) {
		const {visibleDim, totalDim} = this.props
		const delta = (this.props.axis === 'vertical') ? e.deltaY : e.deltaX;
		const limit = 1 - visibleDim / totalDim
		const offset = Math.min(Math.max(this.state.offset + delta/totalDim, 0),limit)
		this.setState(update(this.state, {
			offset: {$set: offset}
		}))
		this._debounceHandleScroll()
		e.preventDefault();
		
	},

	handleMouseUp: function (e) {
		this.setState(update(this.state, {$merge: {
			dragging: false
		}}))
	},

	handleMouseDown: function (e) {
		this.setState(update(this.state, {$merge: {
			dragging: true,
			initialDragOffset: this.state.offset,
			rel: this.props.axis === 'vertical' ? e.pageY : e.pageX
		}}))
	},

	handleMouseMove: function (e) {
		const {axis, totalDim, offset, visibleDim} = this.props
		const {initialDragOffset, rel} = this.state
		const limit = 1 - visibleDim / totalDim
		const cursorPos = (axis === 'vertical') ? e.pageY : e.pageX
		const target = (cursorPos - rel)/visibleDim + initialDragOffset
		const dragOffset = Math.max(Math.min(target, limit), 0)

		this.setState(update(this.state, {$merge: {
	      offset: dragOffset
		}}))

		this._debounceHandleScroll()
	},

	render: function () {
		
		const {axis, totalDim, offset, side, visibleDim} = this.props

		if (!visibleDim || (visibleDim > totalDim))
			return <div className = "scroll-bar-outer" style = {outerStyle}/>

		var outerStyle =  {
			position: 'absolute',
			display: 'block'
		}

		var innerStyle = {}

		if (axis === 'vertical' && side === 'left') {
			outerStyle.left = 0;
		} else if (axis === 'vertical') {
			outerStyle.right = 0
		}
		if (axis === 'vertical') {
			outerStyle.right = 0
			outerStyle.top = offset
			outerStyle.bottom = 15

			outerStyle.width = 25

			innerStyle.top = util.makePercent(this.state.offset)
			innerStyle.height = util.makePercent(visibleDim / totalDim);

		} else if (axis === 'horizontal') {
			outerStyle.bottom = 0
			outerStyle.right = 15
			outerStyle.left = offset

			outerStyle.height = 25
			innerStyle.left = util.makePercent(this.state.offset)
			innerStyle.width = util.makePercent(visibleDim / totalDim);
		}

		return <div className = "scroll-bar-outer"
			style = {outerStyle}

			onScroll = {this.handleScroll}
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
