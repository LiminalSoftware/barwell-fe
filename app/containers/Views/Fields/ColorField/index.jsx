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
		var className = (this.props.className || '') + ' table-cell '
			+ (this.state.selected ? ' selected ' : '');
		return <span {...this.props} className={className}>
				<span className = "table-cell-inner color-picker">
					<span className = "color-block" style = {{background: this.state.value}}></span>
					{this.state.selected ?
						 <span
							className = "editor-icon icon icon-tl-paint"
							onClick = {this.props.handleDetail}></span>
						: null}
				</span>
		</span>
	}
});

var colorField = {
	element: ColorElement,

	detail: ColorDetail
}

export default colorField;
