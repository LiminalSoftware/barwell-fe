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
			// _.debounce(function () {
			modelActionCreators.create('view', false, view, false)
			// }, 200)
		},
		
		render: function () {
			var config = this.props.config
			var key = "attr-" + config.id
			var style = this.props.style

			return <tr key = {key + '-dateformat'} style={style}>
				<td className="no-line"></td>
				<td className="">Date Format: </td>
				<td className="" colSpan="2">
					<input type="text" value={this.state.dateFormat} onChange={this.onFormatChange}/>
				</td>
			</tr>	
		}	
	}),
	element: React.createClass({

		mixins: [commitMixin, editableInputMixin],
		
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