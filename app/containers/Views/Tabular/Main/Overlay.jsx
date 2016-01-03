import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import TabularTBody from "./TabularTBody"

var Overlay = React.createClass ({
  	mixins: [PureRenderMixin],

	render: function () {
    var pos = this.props.position
    var view = this.props.view
    var numColsScrolled = this.props.numHiddenCols
    var visibleCols = view.data.visibleCols
    var fixedCols = view.data.fixedCols
    var numFixed = fixedCols.length
    var geo = view.data.geometry
    var pos = this.props.position
    var fudge = this.props.fudge || {}
    var width = 0
    var left = 0
    var classes = this.props.className || ""
    var style

    if (!pos) return null

    visibleCols.forEach(function (col, idx) {
      if (idx >= numFixed && idx - numFixed < numColsScrolled) return
      if (idx < pos.left)
        left += col.width
      else if (idx <= (pos.right || pos.left))
        width += col.width
    })

    style = {
      top: (pos.top * geo.rowHeight + (fudge.top || 0)) + 'px',
      left: (left + (fudge.left || 0)) + 'px',
      minHeight: (geo.rowHeight * ((pos.bottom || pos.top) - pos.top + 1) + (fudge.height || 0)) + 'px',
      minWidth: (width + (fudge.width || 0)) + 'px'
    }

    if (pos && (pos.left === pos.right) && (pos.top === pos.bottom))
      classes +=  ' singleton';
    if (pos && pos.right >= fixedCols.length &&
      pos.right - fixedCols.length < numColsScrolled)
      classes += ' open-right';
    if (pos && pos.left >= fixedCols.length &&
      pos.left - fixedCols.length < numColsScrolled)
      classes += ' open-left';
    if (pos.top === this.props.rowOffset)
      classes += ' top-position'

		return <div
      className={classes}
      style={style}/>;
	}
});


export default Overlay
