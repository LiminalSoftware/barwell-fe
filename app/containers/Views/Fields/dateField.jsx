import React from "react"
import _ from "underscore"
import $ from "jquery"
import moment from "moment"

import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"

import commitMixin from './commitMixin'
import editableInputMixin from './editableInputMixin'
import selectableMixin from './selectableMixin'

var dateField = {

	configCleanser: function (config) {
		config.dateFormat = config.dateFormat || "MM/DD/YYYY"
		return config
	},

	configRows: React.createClass({

		getInitialState: function () {
			var config = this.props.config;
			return {dateFormat: (config.dateFormat || 'DD/MM/YYYY')}
		},

		onFormatChange: function (event) {
			var config = this.props.config
			var column_id = config.column_id
			var view = this.props.view
			var data = view.data
			var col = data.columns[column_id]
			var value = event.target.value
			col.dateFormat = value

			this.setState({dateFormat: value})
		},

		onBlur: function (event) {
			var config = this.props.config
			var view = this.props.view
			var column_id = config.column_id
			var data = view.data
			var col = data.columns[column_id]

			col.dateFormat = this.state.dateFormat
			modelActionCreators.createView(view, false, true)
		},

		render: function () {
			var config = this.props.config
			var key = "attr-" + config.id
			var style = this.props.style

			return <span className="double-column-config">
					<input type="text" spellcheck="false" value={this.state.dateFormat} onBlur={this.onBlur} onChange={this.onFormatChange}/>
			</span>
		}
	}),

	element: React.createClass({

		mixins: [commitMixin, editableInputMixin, selectableMixin],

		format: function (value) {
			var config = this.props.config || {}
			var format = config.dateFormat || "DD MMMM YYYY";
			var prettyDate = value ? moment(value).format(format) : ''

			return prettyDate
		},

		validator: function (input) {
			var config = this.props.config || {}
			var format = config.dateFormat || "DD MMMM YYYY";

			return moment(input, format)
		}

	})

}

export default dateField;
