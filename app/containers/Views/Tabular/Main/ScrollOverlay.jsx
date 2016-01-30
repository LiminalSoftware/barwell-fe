import React from "react"
import ReactDOM from "react-dom"
import $ from "jquery"

import _ from 'underscore'
import FocusStore from "../../../../stores/FocusStore"
import PureRenderMixin from 'react-addons-pure-render-mixin';

var RHS_PADDING = 100

var ScrollOverlay = React.createClass ({
	// mixins: [PureRenderMixin],

	handleScroll: function (e) {
		var scrollVar = this.props.axis === 'vertical' ? 'scrollTop' : 'scrollLeft'
		var outerEl = this.refs.overlay
		var view = this.props.view
		var geo = view.data.geometry
		var offset = outerEl[scrollVar]
		this.props._setScrollOffset(offset)
	},

	handleMouseWheel: function (e) {
		e.preventDefault()
		var outerEl = this.refs.overlay
		var scrollVar = this.props.axis === 'vertical' ? 'scrollTop' : 'scrollLeft'
		var delta = this.props.axis === 'vertical' ? e.deltaY : e.deltaX
		var offset =  outerEl[scrollVar]
		
		ReactDOM.findDOMNode(outerEl)[scrollVar] = (offset + delta)
	},

	render: function () {
		var _this = this
		var view = this.props.view
		var geo = view.data.geometry
		var axis = this.props.axis
		var store = this.props.store
		var rowCount = store ? _this.props.store.getRecordCount() : 0
		
		var innerStyle = (axis === 'vertical') ? {
			top: 0,
			right: 0,
			left: 0,
			position: 'absolute'
		} : {
			top: 0,
			bottom: 0,
			left: 0,
			position: 'absolute'
		};

		var style =  (axis === 'vertical') ? {
			position: 'absolute',
			top: geo.headerHeight + 'px',
			width: '10px',
			right: 0,
			bottom: 0
		} : {
			position: 'absolute',
			bottom: 0,
			right: 0,
			left: 0,
			height: '10px'
		};
		
		// hack! - need something clickable before the rows load
		if (axis === 'vertical') {
			if (rowCount == 0) innerStyle.bottom = 0
			else innerStyle.height = ((rowCount + 1) * geo.rowHeight + geo.headerHeight) + 'px'	
		} else {
			innerStyle.width = (view.data.floatWidth + view.data.fixedWidth + geo.labelWidth + 30) + 'px'
		}
		

		return <div className = "scroll-overlay"
			style = {style}
			onScroll = {this.handleScroll}
			ref = "overlay">
				<div className = "scroll-overlay-inner"
					style = {innerStyle}
					ref = "overlay-inner">
				</div>
		</div>
	}
})

export default ScrollOverlay
