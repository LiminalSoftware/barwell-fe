import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../../fields"
import $ from 'jquery'

import constant from '../../../../../constants/MetasheetConstants'

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"
import PureRenderMixin from 'react-addons-pure-render-mixin';

var ColumnDetail = React.createClass({

	getInitialState: function () {
		var config = this.props.config
		return {
			open: false,
			yOffset: 0,
			dragging: false,
			rel: null,
			name: config.name
		}
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

	handleNameChange: function (e) {
		this.setState(e.target.value)
	},

	render: function() {
		var _this = this
    var view = this.props.view
    var config = this.props.config
		var fieldType = fieldTypes[config.type] || {}
		var editing = this.props.editing
		var configPartA = ('configA' in fieldType) ?
			React.createElement(fieldType.configA, {
				view: view,
				config: config,
				classes: ""
			}) : <span className = ""/>;
		var configPartB = ('configB' in fieldType) ?
			 React.createElement(fieldType.configB, {
				view: view,
				config: config,
				classes: " "
			}) : <span className = " "/>;

    return <div className={"menu-item tight menu-sub-item column-item " +
			(this.props.dragging ? " dragging " : "")}>

	      <span className = "ellipsis">
					{this.props.open ? <span
						onMouseDown = {_this.handleDrag}
						className="draggable icon grayed icon-Layer_2"
						></span>
					: null}
					{editing ?
						<input className = "menu-input
							text-input" value={this.state.name}
							onChange = {this.handleNameChange}/>
						: <span>{config.name}</span>}
				</span>

				{editing ? null : configPartA}
				{editing ? null : configPartB}

				{editing ? <span
						className="half-column-config "
						onMouseDown = {this.handleDelete}>
							<span className = "icon red icon-cr-remove"></span>
						</span>
					: null}
		</div>
	}
});

export default ColumnDetail;
