import React from "react"
import _ from "underscore"
import $ from "jquery"

import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"

var hasOneField = {
	configRows: React.createClass({
		
		getInitialState: function () {
			var config = this.props.config
			return {label: config.label}
		},

		onLabelChange: function (event) {
			var label = event.target.value
			var config = this.props.config
			var column_id = config.column_id
			var view = this.props.view
			var data = view.data
			var col = data.columns[column_id] 
			var value = event.target.value

			this.setState({'label': label})
			col.label = label
			modelActionCreators.create('view', true, view)
		},

		render: function () {
			var config = this.props.config
			var view = this.props.view
			var style = this.props.style
			var key = "attr-" + config.id
			var model_id = config.related_model_id

			return <tr key = {key + '-label-attribute'} style={style}>
				<td className="no-line"></td>
				<td>Label: </td>
				<td className="right-align" colSpan="2">
					<select onChange={this.onLabelChange} value={this.state.label}>
						{AttributeStore.query({model_id: model_id}).map(function (attr) {
							return <option value={'a' + attr.attribute_id}>{attr.attribute}</option>
						})}
					</select>
				</td>
			</tr>
		}	
	}),

	element: React.createClass({
		render: function () {
			var value = this.props.value
			var config = this.props.config || {}
			var style = this.props.style || {}
			var object = this.props.object

			return <td style={style}>
				<span key="value">{value}</span>
				<span key="expander" class="small grayed icon icon-geo-triangle wedge open"></span>
			</td>
		},
		uneditable: false
	})

}



export default hasOneField