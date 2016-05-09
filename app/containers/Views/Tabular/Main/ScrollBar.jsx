import React from "react"
import ReactDOM from "react-dom"
import $ from "jquery"

import _ from 'underscore'
import PureRenderMixin from 'react-addons-pure-render-mixin';

var RHS_PADDING = 100

var ScrollBar = React.createClass ({

	componentWillMount: function () {
		this._debounceHandleScroll = _.throttle(this.handleScroll, 15, true);
	},

	handleScroll: function (e) {
		var scrollVar = this.props.axis === 'vertical' ? 'scrollTop' : 'scrollLeft';
		var outerEl = this.refs.overlay;
		var view = this.props.view;
		var offset = outerEl[scrollVar];

		this.props._setScrollOffset(offset);
	},

	scroll: function (position, relative) {
		var outerEl = this.refs.overlay;
		var scrollVar = (this.props.axis === 'vertical') ? 'scrollTop' : 'scrollLeft';
		var offset =  relative ? outerEl[scrollVar] : 0;
		ReactDOM.findDOMNode(outerEl)[scrollVar] = (offset + position)
	},

	handleMouseWheel: function (e) {
		var delta = (this.props.axis === 'vertical') ? e.deltaY : e.deltaX;
		e.preventDefault();
		this.scroll(delta, true);
	},

	render: function () {
		var view = this.props.view;
		var geo = view.data.geometry;
		var axis = this.props.axis;
		var rowCount = this.props.rowCount;
		var inner = this.props.innerDimension;
		var offset = this.props.offset;
		// var outer = this.props.outerDimension;
		
		var innerStyle = {
			top: 0,
			left: 0,
			position: 'absolute',
			zIndex: 21,
			// background: 'white'
		};

		var style =  (axis === 'vertical') ? {
			position: 'absolute',
			display: 'block',
			top: offset + 'px',
			width: '10px',
			// left: 0,
			right: 0,
			bottom: 0,
		} : {
			position: 'absolute',
			bottom: 0,
			right: 0,
			left: offset,
			height: '10px',
		};
		
		// hack! - need something clickable before the rows load
		if (axis === 'vertical') {
			innerStyle.height = inner + 'px';
			innerStyle.width = '20px';
			// if (rowCount == 0) innerStyle.bottom = 0
			// else innerStyle.height = ((rowCount + 1) * geo.rowHeight + geo.headerHeight) + 'px'	
		} else {
			innerStyle.width = inner  + 'px';
			innerStyle.height = '20px';
		}
		

		return <div className = "scroll-bar-outer"
			style = {style}

			onScroll = {this.handleScroll}
			onMouseDown = {this.props._handleClick}
			onDoubleClick = {this.props._handleEdit}
			ref = "overlay">
				<div className = "scroll-bar-inner"
					style = {innerStyle}
					ref = "overlay-inner">
				</div>
		</div>
	}
})

export default ScrollBar
