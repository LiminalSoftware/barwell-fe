import React from "react"
import _ from "underscore"
import $ from "jquery"

import styles from "./hasOneStyles.less"

import AttributeStore from "../../../stores/AttributeStore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"
import selectableMixin from './selectableMixin'

var hasOneField = {
	configA: React.createClass({

		getInitialState: function () {
			var config = this.props.config
			return {label: config.label}
		},

		onLabelChange: function (event) {
			var label = event.target.value
			var config = this.props.config
			var column_id = config.column_id
			var view = this.props.view
			var col = view.data.columns[column_id]

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

			return <span className="double-column-config">
					<select className="menu-input selector" onChange={this.onLabelChange} value={this.state.label}>
						{AttributeStore.query({model_id: model_id}).map(function (attr) {
							return <option
								value = {'a' + attr.attribute_id}
								key = {attr.attribute_id}>
									{attr.attribute}
								</option>
						})}
					</select>
			</span>;
		}
	}),

	element: React.createClass({
		mixins: [selectableMixin],

		render: function () {
			var array = this.props.value
			var config = this.props.config || {}
			var style = this.props.style || {}
			var object = this.props.object
			var value = (array instanceof Array ? array[0][config.label] : '')
			var className = (this.props.className || '') + ' table-cell '
				+ (this.state.selected ? ' selected ' : '');

			return <span
				className = {className}
				style={style} >
				<span className="pick-one table-cell-inner">
				{this.props.value ?
					<span className="has-many-bubble">{value}</span>
					: null
				}
				{this.state.selected ?
					 <span
						className = "editor-icon icon icon-search"
						onClick = {this.props.handleDetail}></span>
					: null}
				</span>
			</span>
		},
		uneditable: false
	})

}



export default hasOneField
