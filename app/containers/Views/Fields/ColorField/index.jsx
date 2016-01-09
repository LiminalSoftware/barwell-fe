import React from "react"
import _ from "underscore"


import styles from "./style.less";

import constant from "../../../../constants/MetasheetConstants"
import modelActionCreators from "../../../../actions/modelActionCreators"

import ColorDetail from "./detail"

import CommitMixin from '../commitMixin'
import editableInputMixin from '../editableInputMixin'
import selectableMixin from '../selectableMixin'
import ColorValidationMixin from './ColorValidationMixin'

var ColorElement = React.createClass({

	mixins: [CommitMixin, selectableMixin, ColorValidationMixin],

	handleEdit: _.noop,

	render: function () {
		var value = this.props.value
		var sleectionClass = (this.state.selected ? ' selected ' : '')
		var className = (this.props.className || '') + ' table-cell '+ selectionClass;
		return <span {...this.props} className={className} onMouseDown = {this.props.handleClick}>
				<span className = {"special-cell-inner color-picker " + selectionClass}>
					<span className = "color-block" style = {{background: this.state.value}}></span>
				</span>
				{this.state.selected ?
					 <span
						className = "editor-icon icon icon-tl-paint"
						onClick = {this.props.handleDetail}></span>
					: null}
		</span>
	}
});

var colorField = {
	element: ColorElement,

	detail: ColorDetail
}

export default colorField;
