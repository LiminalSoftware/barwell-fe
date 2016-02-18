import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import TabularTBody from "./TabularTBody"

var Overlay = React.createClass ({
  shouldComponentUpdate: function (nextProps, nextState) {
    return  this.props.position !== nextProps.position || 
            this.props.view !== nextProps.view ||
            this.props.numColsScrolled !== nextProps.numColsScrolled
  },

	render: function () {
    var pos = this.props.position
    var view = this.props.view
    var numColsScrolled = this.props.numHiddenCols
    var visibleCols = view.data.visibleCols
    var fixedCols = view.data.fixedCols
    var numFixed = fixedCols.length
    var geo = view.data.geometry
    var fudge = this.props.fudge || {}
    var width = 0
    var left = geo.leftGutter + geo.labelWidth + 1
    var classes = this.props.className || ""
    var style = this.props.style || {}

    if (pos && (pos.left === pos.right) && (pos.top === pos.bottom))
      classes +=  ' singleton';

    if (!pos) return null

    visibleCols.forEach(function (col, idx) {
      if (idx >= numFixed && idx < numFixed + numColsScrolled) return
      if (idx < pos.left)
        left += col.width
      else if (idx <= (pos.right || pos.left) )
        width += col.width
    })

    style.top = (pos.top * geo.rowHeight + (fudge.top || 0)) + 'px'
    style.left = (left + (fudge.left || 0)) + 'px'
    style.height = (geo.rowHeight * ((pos.bottom || pos.top) - pos.top + 1) + (fudge.height || 0)) + 'px'
    style.width = (width + (fudge.width || 0)) + 'px'

		return <div
      className={classes}
      style={style}>
      {this.props.children}
    </div>;
    }
});


export default Overlay
