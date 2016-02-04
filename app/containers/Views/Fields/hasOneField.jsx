import React from "react"
import _ from "underscore"
import $ from "jquery"

import styles from "./hasOneStyles.less"

import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"
import selectableMixin from './selectableMixin'
import blurOnClickMixin from '../../../blurOnClickMixin'

var hasOneField = {
	configCleanser: function (config) {
		var label = config.label
		var model_id = config.related_model_id
		var model = ModelStore.get(model_id)
		var attribute_id = label.substring(1)
		var attribute = AttributeStore.get(attribute_id)
		if (!attribute) config.label = ModelStore.label_attribute_id
		return config
	},

	configB: React.createClass({

		mixins: [blurOnClickMixin],

		getInitialState: function () {
			var config = this.props.config
			return {
				open: false
			}
		},

		onLabelChoice: function (e, attribute_id) {
			var config = this.props.config
			var column_id = config.column_id
			var view = this.props.view
			var col = view.data.columns[column_id]
			col.label = 'a' + attribute_id
			modelActionCreators.createView(view, false, true)
			this.setState({open: false})
		},

		render: function () {
			var _this = this
			var config = this.props.config
			var view = this.props.view
			var style = this.props.style
			var key = "attr-" + config.id
			var model_id = config.related_model_id
			var label_attribute_id = (config.label || "").substring(1)
			var attribute = AttributeStore.get(label_attribute_id) || {}

			return <span className="double-column-config">
					<span className = "pop-down" onClick = {this.handleOpen}>
						{attribute.attribute}
					</span>
					{
					this.state.open ?
					<ul className="pop-down-menu">
						{AttributeStore.query({model_id: model_id}).map(function (attr) {
							return <li
								onClick = {_this.onLabelChoice.bind(_this, attr.attribute_id)}
								key = {attr.attribute_id}>
									<span className = {'small icon icon-geo-circle ' +
              							(attribute.attribute_id  === attr.attribute_id ? 'green' : 'hovershow')}/>
									{attr.attribute}
								</li>
						})}
					</ul>
					: null
					}
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
