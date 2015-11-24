import React from "react"
import _ from "underscore"
import $ from "jquery"
import moment from "moment"

import styles from "./booleanStyles.less"
import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"

import commitMixin from './commitMixin'
import editableInputMixin from './editableInputMixin'
import selectableMixin from './selectableMixin'

var CheckboxElement = React.createClass({

	mixins: [commitMixin, selectableMixin],

	revert: _.noop,

	handleEdit: function () {
		this.toggle()
		this.props.handleBlur()
	},

	validator: function (input) {
		return (!!input)
	},

	parser: function (input) {
		return !!input
	},

	handleClick: function (event) {
		this.toggle()
		event.preventDefault()
		event.stopPropagation()
	},

	toggle: function () {
		this.setState({value: !this.props.value})
		this.commitChanges()
	},

	render: function () {
		var value = this.props.value
		var style = this.props.style
		var className = (this.props.className || '') + ' table-cell '
			+ (this.state.selected ? ' selected ' : '');

		// return <span {...this.props} className={this.props.className || '' +
		// 	' checkbox' + (this.state.selected ? ' selected ' : '')}>
		// 	<input type="checkbox" checked={!!value} onChange={this.handleClick}></input>
		// </span>
		return <span {...this.props} className={className}>
				<span className = "table-cell-inner checkbox-inner">
					<span className="checkbox-surround" onClick={this.handleClick}>
						<span className={"check greened icon " + (this.state.value ? "" : "icon-kub-approve")}>
						</span>
					</span>
				</span>
		</span>
	}
});

var booleanField = {
	element: CheckboxElement,
	uneditable: true
}

export default booleanField
