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
		var axis = this.props.axis;
		var inner = this.props.innerDimension;
		var offset = this.props.offset;
		var side = this.props.side || 'right'
		
		var innerStyle = {
			top: 0,
			left: 0,
			position: 'absolute',
			zIndex: 21,
			display: 'block'
		};

		var style =  {
			position: 'absolute',
			display: 'block'
		};

		if (axis === 'vertical' && side === 'left') {
			style.left = 0;
		} else if (axis === 'vertical') {
			style.right = 0
		}
		if (axis === 'vertical') {
			style.top = offset + 'px'
			style.bottom = 0
			style.width = '10px'

			innerStyle.height = inner + 'px';
			innerStyle.width = '20px';
		} else if (axis === 'horizontal') {
			style.bottom = 0;
			style.right = 0;
			style.left = offset + 'px'
			style.height = '10px'

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
