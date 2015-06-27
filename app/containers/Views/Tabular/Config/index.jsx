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
			var attribute = AttributeStore.get(sort.attribute_id);

			return <tr>
				<td>{(attribute || {}).attribute}</td>
				<td><span className = {sortOrderClass}></span>{sortOrderLabel}</td>
				<td><span className = "small showonhover grayed clickable icon icon-kub-remove"></span></td>
			</tr>
		})
		if (sortList.length === 0) {
			sortList = <tr><td className="grayed centered" colSpan="3">No sort order defined</td></tr>;
		}

		return <div className = "grouping">
			<div className = "detail-block">
			<h3>Columns</h3>
			<table className="detail-table">
				<thead><tr key="attr-header-row">
					<th className="width-10"></th>
					<th className="width-30">Name</th>
					<th className="width-30">Viz</th>
					<th className="width-30">Width</th>
				</tr></thead>
				{colList}
			</table>
			</div>
			<div className = "detail-block">
			<h3>Sorting</h3>
			<table key="sort-table" className="detail-table">
				<thead>
				<tr key="sort-header-row">
					<th className="width-60">Column</th>
					<th className="width-30">Sort Order</th>
					<th className="width-10"></th>
				</tr>
			</thead>
				<tbody>{sortList}</tbody>
			</table>
			</div>
			<div className = "detail-block">
			
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
		var column_id = this.props.config.column_id
		var col = view.data.columns[column_id]
		col = _.extend(col, colProps)
		view.data.columns[column_id] = col;

		modelActionCreators.createView(view, true, false)
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

	toggleRightAlign: function (event) {
		var config = this.props.config
		this.commitChanges({align: 'right'})
	},

	toggleCenterAlign: function (event) {
		var config = this.props.config
		console.log('toggle center')
		this.commitChanges({align: 'center'})
	},

	toggleLeftAlign: function (event) {
		var config = this.props.config
		this.commitChanges({align: 'left'})
	},
	
	render: function () {
		var view = this.props.view
		var config = this.props.config
		var wedgeClasses = "small grayed icon icon-geo-triangle " +
			(config.expanded ? " wedge open" : "wedge closed")
		var name = config.name
		var nameField = (this.state.editing ? <input type="textbox" value={name} /> : name)
		var key = "attr-" + config.column_id
		var detailsStyle = {}
		var eyeClasses = "clickable icon icon-eye-" + (config.visible ? "3 ":"4 grayed")
		var fieldType = fieldTypes[config.type]
		var addlRows


		if (!config.expanded) detailsStyle.display = "none"
		if (!!fieldType && fieldType.configRows) 
			addlRows = React.createElement(fieldType.configRows, {
				view: this.props.view,
				config: this.props.config,
				style: detailsStyle
			})
		else addlRows = null

		return <tbody>
			<tr key={key + '-row'}>
				<td 
					className="no-line"
					onClick={this.toggleDetails}>
					<span className={wedgeClasses}></span>
				</td>
				<td onDoubleClick={this.handleClick}>
					{nameField}
				</td>
				<td>
					{ config.expanded ? void(0) :
					<span className={eyeClasses} onClick={this.toggleVisibility}></span> }
				</td>
				<td>
					{config.expanded ? void(0) : (config.width + 'px') }
				</td>
			</tr>
			<tr key={key + '-row-visibility'} style = {detailsStyle}>
				<td className="no-line"></td>
				<td>Visibility: </td>
				<td colSpan="2" className="right-align">
					<span className={eyeClasses} onClick={this.toggleVisibility}></span>
					{config.visible ? "Visible" : "Hidden"}
				</td>
			</tr>
			<tr key={key + '-row-background'} style = {detailsStyle}>
				<td className=	"no-line"></td>
				<td>Background: </td>
				<td colSpan="2" className="right-align">
					<span className="icon grayed icon-tl-paint"></span>Default
				</td>
			</tr>
			<tr key={key + '-row-alignment'} style = {detailsStyle}>
				<td className=	"no-line"></td>
				<td className="width-50">Alignment: </td>
				<td colSpan="2" className="right-align">
					<span className={"clickable icon icon-align-left " 
						+ (config.align === 'left' ? '' : 'grayed')}
						onClick={this.toggleLeftAlign}>
					</span>
					<span className={"clickable icon grayed icon-align-center " 
						+ (config.align === 'center' ? '' : 'grayed')}
						onClick={this.toggleCenterAlign}>
					</span>
					<span className={"clickable icon grayed icon-align-right " 
						+ (config.align === 'right' ? '' : 'grayed')}
						onClick={this.toggleRightAlign}>
					</span>
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