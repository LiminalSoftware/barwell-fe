import React from "react"
import ReactDOM from "react-dom"
import $ from "jquery"

import _ from 'underscore'
import FocusStore from "../../../../stores/FocusStore"
import PureRenderMixin from 'react-addons-pure-render-mixin';

var RHS_PADDING = 100

var ScrollOverlay = React.createClass ({
	// mixins: [PureRenderMixin],

	handleClick: function (e) {
		this.props._handleClick(e)
	},

	handleDoubleClick: function (e) {
		this.props._handleDoubleClick(e)
	},

	handleScroll: function (e) {
		var view = this.props.view
		var geo = view.data.geometry
		var outerEl = this.refs.overlay
		var vOffset = outerEl.scrollTop
		var hOffset = outerEl.scrollLeft
		this.props._setScrollOffset(vOffset, hOffset)
	},

	handleMouseWheel: function (e) {
		e.preventDefault()
		var deltaY = e.deltaY;
		var deltaX = e.deltaX;
		var outerEl = this.refs.overlay
		var vOffset = outerEl.scrollTop
		var hOffset = outerEl.scrollLeft
		ReactDOM.findDOMNode(outerEl).scrollTop = (vOffset + deltaY)
		ReactDOM.findDOMNode(outerEl).scrollLeft = (hOffset + deltaX)
	},

	render: function () {
		var _this = this
		var view = this.props.view
		var geo = view.data.geometry
		var store = this.props.store
		var rowCount = store ? _this.props.store.getRecordCount() : 0
		var style = {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0
		}
		var innerStyle = {
			top: 0,
			left: 0,
			width: (view.data.fixedWidth + view.data.floatWidth + RHS_PADDING) + 'px',
			position: 'absolute'
		}
		// hack! - need something clickable before the rows load
		if (rowCount == 0) innerStyle.bottom = 0
		else innerStyle.height = ((rowCount + 1) * geo.rowHeight + geo.headerHeight) + 'px'

		return <div className = "scroll-overlay"
			style = {style}
			onScroll = {this.handleScroll}
			ref = "overlay">
				<div className = "scroll-overlay-inner"
					style = {innerStyle}
					onMouseDown = {this.handleClick}
					onDoubleClick = {this.handleDoubleClick}
					ref = "overlay-inner">
				</div>
		</div>
	}
})

export default ScrollOverlay
