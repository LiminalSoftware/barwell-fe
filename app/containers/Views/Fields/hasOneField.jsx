import React from "react"
import _ from "underscore"
import $ from "jquery"

import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"
import selectableMixin from './selectableMixin'

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
			modelActionCreators.createView(view, false, true)
		},

		render: function () {
			var config = this.props.config
			var view = this.props.view
			var style = this.props.style
			var key = "attr-" + config.id
			var model_id = config.related_model_id

			return <span className="column-config">
					<select onChange={this.onLabelChange} value={this.state.label}>
						{AttributeStore.query({model_id: model_id}).map(function (attr) {
							return <option value={'a' + attr.attribute_id}>{attr.attribute}</option>
						})}
					</select>
			</span>
		}
	}),

	element: React.createClass({
		mixins: [selectableMixin],

		render: function () {
			var value = this.props.value
			var config = this.props.config || {}
			var style = this.props.style || {}
			var object = this.props.object

			return <span className="table-cell" style={style}>
				<span className="pick-one table-cell-inner">{(config.label) ? (value[config.label] || "...") : "..." }</span>
				<span key="expander" className="small grayed icon icon-geo-triangle wedge open"></span>
			</span>
		},
		uneditable: false
	})

}



export default hasOneField
