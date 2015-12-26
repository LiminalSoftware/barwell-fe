import React from "react"
import $ from "jquery"
import styles from "./tabularTHStyle.less"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;


var ScrollOverlay = React.createClass ({
	// mixins: [PureRenderMixin],

	handleClick: function (e) {
		this.props._handleClick(e)
	},

	handleScroll: function (e) {
		var view = this.props.view
		var geo = view.data.geometry
		var outerEl = this.refs.overlay
		var vOffset = Math.floor(outerEl.getDOMNode().scrollTop)
		var hOffset = Math.floor(outerEl.getDOMNode().scrollLeft)
		this.props._setScrollOffset(vOffset, hOffset)
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
			height: ((rowCount + 1) * geo.rowHeight + geo.headerHeight) + 'px',
			width: (this.props.totalWidth) + 'px',
			position: 'absolute'
		}
		return <div className = "scroll-overlay"
			style = {style}
			onScroll = {this.handleScroll}
			ref = "overlay">
			<div className = "scroll-overlay-inner"
			style = {innerStyle}
			onMouseDown = {this.handleClick}
			ref = "overlay-inner">
			</div>
		</div>
	}
})

export default ScrollOverlay
