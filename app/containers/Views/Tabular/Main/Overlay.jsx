import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

var Overlay = React.createClass ({
  shouldComponentUpdate: function (nextProps, nextState) {
    return  this.props.position !== nextProps.position || 
            this.props.view !== nextProps.view ||
            this.props.columnOffset !== nextProps.columnOffset ||
            this.props.className !== nextProps.className ||
            this.props.children !== nextProps.children ||
            this.props.focused !== nextProps.focused
  },

  render: function () {
    var classes = this.props.className || ""
    var pos = this.props.position
    var view = this.props.view
    var style = this.props._getRangeStyle(pos, this.props.fudge, this.props.showHiddenHack)

    if (pos && (pos.left === pos.right) && (pos.top === pos.bottom))
      classes += ' singleton';
    if (!pos) return null
    
    return <div
      {...this.props}
      className = {classes}
      style = {style}>
      {this.props.children}
    </div>;
    }
});


export default Overlay
