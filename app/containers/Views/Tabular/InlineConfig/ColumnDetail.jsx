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

	toggleAlign: function (event) {
		var align = this.props.config.align
		if (align === 'left') align = 'center'
		else if (align === 'center') align = 'right'
		else align = 'left'
		this.commitChanges({align: align})
	},

	toggleBold: function (event) {
		var config = this.props.config
		this.commitChanges({bold: !config.bold})
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
		this.props._startDrag(event, this.props.config)
		event.preventDefault()
	},

	handleDelete: function (event) {

	},

	render: function() {
		var _this = this
    var view = this.props.view
    var config = this.props.config
		var fieldType = fieldTypes[config.type]
		var editing = this.props.editing
		var typeSpecificConfig

		if (!!fieldType && fieldType.configRows)
			typeSpecificConfig = React.createElement(fieldType.configRows, {
				view: view,
				config: config,
				classes: editing ? " col-editing " : ""
			})
		else typeSpecificConfig = <span
			className= "double-column-config"
			key="type-specific"/>

    return <div
			className={"menu-item tight menu-sub-item column-item " +
			(this.props.dragging ? " dragging " : "")}>

	      <span
					className = {"column-config " + (editing ? " " : "")}
					key = "name">
					{this.props.open ? <span
						onMouseDown = {_this.handleDrag}
						className="draggable icon grayed icon-Layer_2"
						></span>
					: null}
					{config.name}
				</span>

				{editing ? null :
					<span className = {"column-config " + (editing ? "  " : "")} key = "column">
						<span className={" clickable icon icon-align-" + config.align}
							onClick={this.toggleAlign}>
						</span>
						<span className={" clickable icon icon-tl-bold " + (config.bold ? "" : " grayed")}
							onClick={this.toggleBold}>
						</span>
						<span className={" clickable icon icon-tl-italic " + (config.italic ? "" : " grayed")}
							onClick={this.toggleBold}>
						</span>
						<span className={" clickable icon icon-tl-brush " + (config.italic ? "" : " grayed")}
							onClick={this.toggleBold}>
						</span>
					</span>
				}
				{
				editing ? null : typeSpecificConfig
				}

				{editing ? <span
						className="half-column-config "
						onMouseDown = {this.handleDelete}>
							<span className = "icon red icon-cr-delete"></span>
						</span>
					: null}
		</div>
	}
});

export default ColumnDetail;
