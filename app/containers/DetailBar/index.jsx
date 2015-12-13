import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../Views/fields"

import ViewStore from "../../stores/ViewStore"
import ModelStore from "../../stores/ModelStore"
import modelActionCreators from "../../actions/modelActionCreators"

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var DetailBar = React.createClass({

	mixins: [PureRenderMixin],

	getInitialState: function () {
		var view = this.props.view
		return view.data
	},

	focus: function () {

	},

	render: function() {
		var _this = this
		var view = this.props.view
		var model = this.props.model
		var data = view.data
		var column = view.data.columnList.filter(col => col.visible)[data.pointer.left]
		var fieldType = fieldTypes[column.type]
		var detail = fieldType.detail ?
			React.createElement(fieldType.detail, {
				view: view,
				model: model,
				column: column
			}) : null;

    return <div className = "detail-bar" onClick={this.focus}>
			{detail}
		</div>
	}
});

export default DetailBar;
