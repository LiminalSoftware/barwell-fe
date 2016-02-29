import React from "react"
import _ from "underscore"

import AttributeStore from "../../../../stores/AttributeStore"
import ModelStore from "../../../../stores/ModelStore"

import modelActionCreators from "../../../../actions/modelActionCreators"

var hasSomeConfigB = React.createClass({

	handleEdit: function () {

	},

	getInitialState: function () {
		var view = this.props.view
		var config = this.props.config
		return {label: config.label}
	},

	render: function () {
		var config = this.props.config
		var view = this.props.view
		var style = this.props.style
		var key = "attr-" + config.id
		var model_id = config.related_model_id

		return <span className="double-column-config"
			
		</span>
	}
})

export default hasSomeConfigA