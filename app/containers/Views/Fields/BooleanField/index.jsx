import React from "react"
import _ from "underscore"
import $ from "jquery"
import moment from "moment"

import styles from "./booleanStyles.less"
import AttributeStore from "../../../../stores/AttributeStore"
import ModelStore from "../../../../stores/ModelStore"

import constant from "../../../../constants/MetasheetConstants"
import modelActionCreators from "../../../../actions/modelActionCreators"

import commitMixin from '../commitMixin'
import editableInputMixin from '../editableInputMixin'
import selectableMixin from '../selectableMixin'

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

	handleClick: function (e) {
		this.toggle()
		e.preventDefault()
		e.stopPropagation()
		e.nativeEvent.stopPropagation()
	},

	toggle: function () {
		this.commitValue(!this.state.value)
	},

	render: function () {
		var value = this.props.value
		var style = this.props.style
		var selectionClass = (this.state.selected ? ' selected ' : '')
		var className = (this.props.className || '') + ' table-cell '
			+ selectionClass;

		return <span {...this.props} className={className}>
			<span className = {"special-cell-inner checkbox-inner " + selectionClass}
				style = {{lineHeight: this.props.rowHeight + 'px'}}>
				<span className="checkbox-surround" onClick={this.handleClick}>
					<span className={"check green icon " + (this.state.value ? "icon-kub-approve" : "")}>
					</span>
				</span>
			</span>
		</span>
	}
});

var booleanField = {
	sortable: true,
	defaultAlign: 'center',
	element: CheckboxElement,
	uneditable: true
}

export default booleanField
