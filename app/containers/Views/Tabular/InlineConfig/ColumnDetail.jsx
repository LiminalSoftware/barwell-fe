import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../fields"
import $ from 'jquery'

import ViewStore from "../../../../stores/ViewStore"
import ModelStore from "../../../../stores/ModelStore"
import AttributeStore from "../../../../stores/AttributeStore"
import KeyStore from "../../../../stores/KeyStore"
import KeycompStore from "../../../../stores/KeycompStore"
import constant from '../../../../constants/MetasheetConstants'

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var ColumnDetail = React.createClass({

	getInitialState: function () {
		return {
			open: false,
			yOffset: 0,
			dragging: false,
			rel: null
		}
	},

	toggleOpenMenu: function () {
		this.setState({open: !this.state.open})
	},

	toggleVisibility: function (event) {
		var config = this.props.config
		this.commitChanges({visible: !config.visible})
	},

	componentWillReceiveProps: function (nextProps) {
	},

	toggleAlign: function (event) {
		var align = this.props.config.align
		if (align === 'left') align = 'center'
		else if (align === 'center') align = 'right'
		else align = 'left'
		this.commitChanges({align: align})
	},

	commitChanges: function (colProps) {
		var view = this.props.view
		var column_id = this.props.config.column_id
		var col = view.data.columns[column_id]

		col = _.extend(col, colProps)
		view.data.columns[column_id] = col;
		modelActionCreators.createView(view, true, true)
	},

	handleDrag: function (event) {
		this.props._onDrag(event, this.props.config)
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
			style = {{marginTop: ((this.props.dragOffset) + 'px'),
							marginBottom: (-1 * (this.props.dragOffset) + 'px')}}
			className={"menu-item menu-sub-item column-item " +
			(this.state.dragging ? " dragging " : "")}>

				{this.props.open ? <span
						className="draggable icon grayed icon-Layer_2"
						onMouseDown = {this.handleDrag}
						></span>
					: null}

	      <span className="double-column-config">
					{config.name}
				</span>

				<span className="column-config">
					<span className={" clickable icon icon-align-" + config.align}
						onClick={this.toggleAlign}>
					</span>
				</span>
				{typeSpecificConfig}
				{this.props.open ? null :
					<div className="dropdown small grayed icon icon-geo-arrw-down" onClick = {this.props._onOpen}></div>

				}
		</div>
	}
});

export default ColumnDetail;
