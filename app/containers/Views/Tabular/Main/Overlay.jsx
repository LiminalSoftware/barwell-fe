import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

import TabularTBody from "./TabularTBody"

var Overlay = React.createClass ({
  mixins: [PureRenderMixin],

  getStyle: function () {
    var cols = this.props.columns
    var view = this.props.view
		var geo = view.data.geometry
    var pos = this.props.position
    var fudge = this.props.fudge || {}
		var width = 0
		var left = geo.leftGutter

    if (!pos) return null

		cols.forEach(function (col, idx) {
			if (idx < pos.left)
				left += col.width
			else if (idx <= (pos.right || pos.left))
				width += col.width
		})
		return {
			top: (pos.top * geo.rowHeight + (fudge.top || 0)) + 'px',
			left: (left + (fudge.left || 0))+ 'px',
			minHeight: (geo.rowHeight * ((pos.bottom || pos.top) - pos.top + 1) + (fudge.height || 0)) + 'px',
			minWidth: (width + (fudge.width || 0)) + 'px'
		}
	},

	render: function () {
		return <div
      className={this.props.className}
      style={this.getStyle()}> </div>;
	}
});


export default Overlay
