import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../fields"
import ViewUpdateMixin from '../../ViewUpdateMixin.jsx'

import ViewStore from "../../../../stores/ViewStore"
import ModelStore from "../../../../stores/ModelStore"
import AttributeStore from "../../../../stores/AttributeStore"
import KeyStore from "../../../../stores/KeyStore"
import KeycompStore from "../../../../stores/KeycompStore"

import modelActionCreators from "../../../../actions/modelActionCreators.js"
import groomView from '../../groomView'

var TabularViewConfig = React.createClass({
	
	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange);
		ModelStore.addChangeListener(this._onChange)
		AttributeStore.addChangeListener(this._onChange)
		KeyStore.addChangeListener(this._onChange)
	},

	componentWillUnmount: function () {
		var view = this.props.view
		ViewStore.removeChangeListener(this._onChange);
		ModelStore.removeChangeListener(this._onChange)
		AttributeStore.removeChangeListener(this._onChange)
		KeyStore.removeChangeListener(this._onChange)
	},

	_onChange: function () {
		var view = ViewStore.get(this.props.view.view_id || this.props.view.cid)
		this.setState(view.data)
	},
	
	getInitialState: function () {
		var view = this.props.view
		return view.data
	},

	render: function() {
		var _this = this
		var view = groomView(this.props.view)
		var data = this.state
		var columns = data.columns

		var colList = (data.columnList || []).map(function (col) {
			return <ColumnDetail key = {"detail-" + col.attribute_id} config = {col} view= {view} />
		})
		var sortList = (data.sorting || []).map(function (sort) {
			var sortOrderClass = "small grayed icon icon-arrow-" + (sort.descending ? "up" : "down")
			var sortOrderLabel = sort.descending ? "Ascending" : "Descending"
			return <tr>
				<td>{sort.id}</td>
				<td><span className = {sortOrderClass}></span>{sortOrderLabel}</td>
				<td><span className = "clickable icon icon-trash"></span></td>
			</tr>
		})

		return <div className = "grouping">
			<div className = "detail-block">
			<h3>Columns</h3>
			<table className="detail-table">
				<thead><tr key="attr-header-row">
					<th key="attr-header-expand"></th>
					<th key="attr-header-name">Name</th>
					<th key="attr-header-visibility">Viz</th>
					<th key="attr-header-width">Width</th>
				</tr></thead>
				{colList}
			</table>
			</div>
			<div className = "detail-block">
			<h3>Sorting</h3>
			<table key="sort-table" className="detail-table">
				<thead>
				<tr key="sort-header-row">
					<th key="sort-header-col">Column</th>
					<th key="sort-header-Desc">Sort Order</th>
					<th></th>
				</tr>
			</thead>
				<tbody>{sortList}</tbody>
			</table>
			</div>
			<div className = "detail-block">
			<h3>Filter</h3>
			</div>
		</div>
	}
});

export default TabularViewConfig;


var ColumnDetail = React.createClass({

	getInitialState: function () {
		return {editing: false}
	},
	
	commitChanges: function (colProps) {
		var view = this.props.view
		var attribute_id = this.props.config.attribute_id
		var col = view.data.columns[attribute_id]
		col = _.extend(_.clone(col), colProps)
		view.data.columns[attribute_id] = col;

		modelActionCreators.createView(view)
	},

	updateWidth: function (e) {
		var width = e.target.value
		this.setState({tempWidth: width})
	},
	
	toggleDetails: function (event) {
		this.commitChanges({expanded: (!this.props.config.expanded)})
	},
	
	toggleVisibility: function (event) {
		var config = this.props.config
		this.commitChanges({visible: !config.visible})
	},
	
	render: function () {
		var config = this.props.config
		var wedgeClasses = "small grayed icon icon-geo-triangle " +
			(config.expanded ? " wedge open" : "wedge closed")
		var name = config.name
		var nameField = (this.state.editing ? <input type="textbox" value={name} /> : name)
		var key = "attr-" + config.id
		var detailsStyle = {}
		var eyeClasses = "clickable icon icon-eye-" + (config.visible ? "3 ":"4 grayed")
		var fieldType = fieldTypes[config.type]
		var addlRows

		if (!config.expanded) detailsStyle.display = "none"
		if (!!fieldType && fieldType.configRows) addlRows = fieldType.configRows(config, detailsStyle)
		else addlRows = null

		return <tbody>
			<tr key={key + '-row'}>
				<td 
					className="width-10 no-line"
					onClick={this.toggleDetails}>
					<span className={wedgeClasses}></span>
				</td>
				<td 
					className="width-50"
					onDoubleClick={this.handleClick}>
					{nameField}
				</td>
				<td className="width-20">
					{ config.expanded ? void(0) :
					<span className={eyeClasses} onClick={this.toggleVisibility}></span> }
				</td>
				<td className="width-20">
					{config.expanded ? void(0) : (config.width + 'px') }
				</td>
			</tr>
			<tr key={key + '-row-details'} style = {detailsStyle}>
				<td className=	"width-10 no-line"></td>
				<td className="width-50">Background: </td>
				<td colSpan="2" className="right-align">
					<span className="icon grayed icon-tl-paintbrush"></span>Default
				</td>
			</tr>
			<tr key={key + '-row-visibility'} style = {detailsStyle}>
				<td className="width-10 no-line"></td>
				<td className="width-50">Visibility: </td>
				<td colSpan="2" className="right-align">
					<span className={eyeClasses} onClick={this.toggleVisibility}></span>
					{config.visible ? "Visible" : "Hidden"}
				</td>
			</tr>
			<tr key={key + '-row-width'} style = {detailsStyle}>
				<td></ td>
				<td> Column width: </td>
				<td colSpan="2" className="right-align">
					<input value={this.state.width} style={{width: "30px"}} onBlur={this.commitChanges} onChange={this.updateWidth}/>px
				</td>
			</tr>
			{addlRows}
		</tbody>
	}
});