import React from "react"
import _ from "underscore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"

import commitMixin from './commitMixin'
import editableInputMixin from './editableInputMixin'
import selectableMixin from './selectableMixin'

var ColorElement = React.createClass({

	mixins: [commitMixin, selectableMixin],

	revert: _.noop,

	handleEdit: _.noop,

	validator: function (input) {
		if ((/^#[0-9A-F]{3,6}$/).test(input || ''))	return input
		return null
	},

	parser: function (input) {
		console.log('x')
		return input
	},

	handleClick: function () {

	},

	setValue: function (value) {
		value = (this.parser) ? this.parser(value) : value;
		this.setState({value: value})
	},

	render: function () {
		var value = this.props.value
		var className = (this.props.className || '') + ' table-cell '
			+ (this.state.selected ? ' selected ' : '');
		return <span {...this.props} className={className}>
				<span className = "table-cell-inner color-picker">
					<span className = "color-block" style = {{background: this.state.value}}></span>
					<span className = "editor-icon grayed icon icon-tl-paint"></span>
				</span>
		</span>
	}
});

var colorField = {
	element: ColorElement
}

export default colorField;
