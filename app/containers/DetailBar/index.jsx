import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../Views/fields"

import ViewStore from "../../stores/ViewStore"
import ModelStore from "../../stores/ModelStore"
import modelActionCreators from "../../actions/modelActionCreators"

var PureRenderMixin = require('react-addons-pure-render-mixin');

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
		var config = this.props.config
		var object = this.props.object
		var value = object[config.column_id]
		var pk = model._pk
		var selector = {}
		var data = view.data
		var fieldType = fieldTypes[config.type]

		if (!(pk in object)) selector = null
		else selector[pk] = object[pk]

		var detail = fieldType.detail ?
			React.createElement(fieldType.detail, {
				view: view,
				model: model,
				object: object,
				config: config,
				value: value,
				selector: selector
			}) : null;

    return <div 
    	className = "detail-bar" 
    	onClick={this.focus}>
			{detail}
		</div>
	}
});

export default DetailBar;
