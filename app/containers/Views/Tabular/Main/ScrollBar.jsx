import React from "react"
import ReactDOM from "react-dom"
import $ from "jquery"

import _ from 'underscore'
import FocusStore from "../../../../stores/FocusStore"
import PureRenderMixin from 'react-addons-pure-render-mixin';

var RHS_PADDING = 100

var ScrollBar = React.createClass ({
	// mixins: [PureRenderMixin],

	handleScroll: function (e) {
		var scrollVar = this.props.axis === 'vertical' ? 'scrollTop' : 'scrollLeft'
		var outerEl = this.refs.overlay
		var view = this.props.view
		var geo = view.data.geometry
		var offset = outerEl[scrollVar]
		this.props._setScrollOffset(offset)
	},

	scroll: function (position, relative) {
		var outerEl = this.refs.overlay
		var scrollVar = (this.props.axis === 'vertical') ? 'scrollTop' : 'scrollLeft'
		var offset =  relative ? outerEl[scrollVar] : 0
		ReactDOM.findDOMNode(outerEl)[scrollVar] = (offset + position)
	},

	handleMouseWheel: function (e) {
		e.preventDefault()
		var delta = (this.props.axis === 'vertical') ? e.deltaY : e.deltaX
		this.scroll(delta, true)
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
			innerStyle.width = (view.data.floatWidth + view.data.fixedWidth + geo.labelWidth + _.last(view.data.columnList).width + 100) + 'px'
		}
		

		return <div className = "scroll-bar-outer"
			style = {style}
			onScroll = {this.handleScroll}
			ref = "overlay">
				<div className = "scroll-bar-inner"
					style = {innerStyle}
					ref = "overlay-inner">
				</div>
		</div>
	}
})

export default ScrollBar
