import React from "react"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
var blurOnClickMixin = require('../../../../blurOnClickMixin')

var AlignChoice = React.createClass({

  mixins: [blurOnClickMixin],

  _timer: null,

  getInitialState: function () {
    return {
      align: this.props.config.align,
      open: false
    }
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({align: this.props.config.align})
  },

  commitChanges: function (colProps) {
		var view = this.props.view
		var column_id = this.props.config.column_id
		var col = view.data.columns[column_id]

		col = _.extend(col, colProps)
		view.data.columns[column_id] = col;
    this.setState(colProps)
		modelActionCreators.createView(view, true, true)
	},

  toggleAlign: function (event) {
		var align = this.props.config.align
		if (align === 'left') align = 'center'
		else if (align === 'center') align = 'right'
		else align = 'left'
		this.commitChanges({align: align})
	},

  alignLeft: function () {
    this.commitChanges({align: "left"})
    this.handleBlur()
  },
  alignCenter: function () {
    this.commitChanges({align: "center"})
    this.handleBlur()
  },
  alignRight: function () {
    this.commitChanges({align: "right"})
    this.handleBlur()
  },

  render: function () {
    var align = this.state.align

    return <span
        className={"pop-down clickable icon icon-align-" + this.state.align + ""}
        onMouseDown = {this.handleOpen}>
        {
        this.state.open ? <ul className = "pop-down-menu" style = {{
          top: (align === "left" ? "0" :
          align === "center" ? "-100%" : "-200%")
        }}>
          <li className = "icon icon-align-left" onClick = {this.alignLeft}></li>
          <li className = "icon icon-align-center" onClick = {this.alignCenter}></li>
          <li className = "icon icon-align-right" onClick = {this.alignRight}></li>
        </ul> : null
        }
    </span>;
  }
})

export default AlignChoice
