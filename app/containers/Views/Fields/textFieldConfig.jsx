import React from "react"
import _ from "underscore"
import modelActionCreators from "../../../actions/modelActionCreators"

var textFieldConfig = React.createClass({

  getInitialState: function () {
    var config = this.props.config;
    return config
  },

  toggleVisibility: function (event) {
		var config = this.props.config
		this.commitChanges({visible: !config.visible})
	},

	toggleAlign: function (event) {
		var align = this.props.config.align
		if (align === 'left') align = 'center'
		else if (align === 'center') align = 'right'
		else align = 'left'
		this.commitChanges({align: align})
	},

	toggleBold: function (event) {
		var config = this.props.config
		this.commitChanges({bold: !config.bold})
	},

  commitChanges: function (colProps) {
		var view = this.props.view
		var column_id = this.props.config.column_id
		var col = view.data.columns[column_id]

		col = _.extend(col, colProps)
		view.data.columns[column_id] = col;
		modelActionCreators.createView(view, true, true)
	},

  render: function () {
    var config = this.props.config
    var key = "attr-" + config.id
    var style = this.props.style

    return <span>
      <span className={" menu-box clickable icon icon-align-" + config.align}
        onClick={this.toggleAlign}>
      </span>
      <span className={" menu-box clickable icon icon-tl-bold " + (config.bold ? "" : " grayed")}
        onClick={this.toggleBold}>
      </span>
      <span className={" menu-box clickable icon icon-tl-italic " + (config.italic ? "" : " grayed")}
        onClick={this.toggleBold}>
      </span>
      <span className={" menu-box clickable icon icon-tl-brush " + (config.italic ? "" : " grayed")}
        onClick={this.toggleBold}>
      </span>
    </span>
  }
})

export default textFieldConfig
