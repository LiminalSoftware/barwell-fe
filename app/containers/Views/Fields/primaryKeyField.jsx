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

var PrimaryKeyElement = React.createClass({
	mixins: [selectableMixin],
	
	render: function () {
		var value = this.props.value
		var style = this.props.style

		return <span style={style} className="table-cell uneditable">
			<span className = {"table-cell-inner " + (this.state.selected ? " selected" : "")}>
				{this.props.value}
			</span>
		</span>
	}
})

var PrimaryKeyField = {
	element: PrimaryKeyElement,
	uneditable: true
}

export default PrimaryKeyField
