import React from "react"
import ReactDOM from "react-dom"

import modelActionCreators from "../../../actions/modelActionCreators"
import fieldTypes from "../../fields"
import _ from "underscore"
import $ from "jquery"

var NUM_LINES = 50

var RowResizer = React.createClass ({

  getInitialState: function () {
		return {
			dragging: false,
			rel: null,
			pos: 0,
		}
	},

	// shouldComponentUpdate: function (nextProps) {
			// return this.props.view !== nextProps.view
	// },

  onResizerMouseDown: function (e) {
    var pos = $(ReactDOM.findDOMNode(this)).offset()
    this.setState({
      dragging: true,
      rel: e.pageY
    })
    e.stopPropagation()
    e.preventDefault()
  },

  onMouseUp: function (e) {
    var view = this.props.view
    var geo = view.data.geometry
    var col = this.props.column

    view.data.geometry.rowHeight = (geo.rowHeight + this.state.pos)
    
    modelActionCreators.createView(updated, true, {safe: true})

    this.setState({
      dragging: false,
      pos: 0
    })
    e.stopPropagation()
    e.preventDefault()
  },

  onMouseMove: function (e) {
     if (!this.state.dragging) return
     this.setState({
        pos: e.pageY - this.state.rel
     })
     e.stopPropagation()
     e.preventDefault()
  },

  componentDidUpdate: function (props, state) {
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
    } else if (!this.state.dragging && state.dragging) {
       document.removeEventListener('mousemove', this.onMouseMove)
       document.removeEventListener('mouseup', this.onMouseUp)
    }
  },

	render: function () {
		var view = this.props.view
		var model = this.props.model
		var geo = view.data.geometry

		var lines = []

		return <span ref = "resizer"
      className = {"row-resizer table-resizer " + (this.state.dragging ? " dragging " : "")}
      onMouseDown = {this.onResizerMouseDown}
      style = {{
        left: 0,
        top: (geo.headerHeight + geo.rowHeight + (this.state.dragging ? (this.state.pos) : -5)) + 'px',
        height: this.state.dragging ? "2px" : "10px",
        width: this.state.dragging ? (this.props.adjustedWidth + 'px') : (geo.labelWidth + 'px')
      }}>
    </span>
	}

});


export default RowResizer
