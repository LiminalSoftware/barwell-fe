import React from "react"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import AlignChoice from "./AlignChoice"
import ColorChoice from "./ColorChoice"
import TextChoice from "./TextChoice"

var textFieldConfig = React.createClass({

  getInitialState: function () {
    var config = this.props.config;

    return {
      align: config.align,
      showAlignMenu: false,
      bold: false,
      italic: false,
      background: null
    }
  },

  toggleVisibility: function (event) {
		var config = this.props.config
		this.commitChanges({visible: !config.visible})
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

  showAlignMenu: function () {

  },

  render: function () {
    var config = this.props.config
    var key = "attr-" + config.id
    var style = this.props.style

    return <span className = {this.props.classes}>
      <AlignChoice {...this.props}/>
      <ColorChoice {...this.props}/>
      <TextChoice {...this.props}/>
    </span>
  }
})

export default textFieldConfig
