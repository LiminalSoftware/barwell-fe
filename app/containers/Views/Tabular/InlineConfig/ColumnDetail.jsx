import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../fields"

import ViewStore from "../../../../stores/ViewStore"
import ModelStore from "../../../../stores/ModelStore"
import AttributeStore from "../../../../stores/AttributeStore"
import KeyStore from "../../../../stores/KeyStore"
import KeycompStore from "../../../../stores/KeycompStore"

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var ColumnDetail = React.createClass({

	mixins: [PureRenderMixin],

	getInitialState: function () {
		return {open: false}
	},

	toggleOpenMenu: function () {
		this.setState({open: !this.state.open})
	},

	toggleVisibility: function (event) {
		var config = this.props.config
		this.commitChanges({visible: !config.visible})
	},

	toggleRightAlign: function (event) {
		var config = this.props.config
		this.commitChanges({align: 'right'})
	},

	toggleCenterAlign: function (event) {
		var config = this.props.config
		this.commitChanges({align: 'center'})
	},

	toggleLeftAlign: function (event) {
		var config = this.props.config
		this.commitChanges({align: 'left'})
	},

	commitChanges: function (colProps) {
		var view = this.props.view
		var column_id = this.props.config.column_id
		var col = view.data.columns[column_id]
		col = _.extend(col, colProps)
		view.data.columns[column_id] = col;
		modelActionCreators.createView(view, true, false)
	},

	render: function() {
    var view = this.props.view
    var config = this.props.config
		var fieldType = fieldTypes[config.type]
		var typeSpecificConfig

		if (!!fieldType && fieldType.configRows)
			typeSpecificConfig = React.createElement(fieldType.configRows, {
				view: view,
				config: config
			})
		else typeSpecificConfig = <span className="double-column-config"/>

    return <div
      className="menu-item menu-sub-item column-item">
				{this.props.open ? <span className="icon grayed icon-Layer_2"></span> : null}
	      <span className="double-column-config">
					{config.name}
				</span>
				<span className="column-config">
					<span className={"clickable icon icon-align-left "
						+ (config.align === 'left' ? '' : 'grayed')}
						onClick={this.toggleLeftAlign}>
					</span>
					<span className={"clickable icon icon-align-center "
						+ (config.align === 'center' ? '' : 'grayed')}
						onClick={this.toggleCenterAlign}>
					</span>
					<span className={"clickable icon icon-align-right "
						+ (config.align === 'right' ? '' : ' grayed')}
						onClick={this.toggleRightAlign}>
					</span>
				</span>
				{typeSpecificConfig}
		</div>
	}
});

export default ColumnDetail;
