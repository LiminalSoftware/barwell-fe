import React from "react";
import { Link } from "react-router";
import bw from "barwell";
import styles from "./style.less";
import _ from 'underscore';

var TabularViewConfig = React.createClass({
	getInitialState: function () {
		return {};
	},

	componentDidMount: function () {
		var view = this.props.view
		this.refreshView()
		view.on('update', this.refreshView)
	},

	updateView: function (view) {
		var oldView = this.props.view
		if (oldView) oldView.removeListener('update', this.refreshView)
		view.on('update', this.refreshView)
		this.setState(view.synget(bw.DEF.VIEW_DATA))
	},

	refreshView: function () {
		var view = this.props.view;
		this.setState(view.synget(bw.DEF.VIEW_DATA))
	},

	componentWillReceiveProps: function (props) {
		if (props.view !== this.props.view) this.updateView(props.view);
	},

	render: function() {
		if (!this.state) return
		var _this = this
		var view = this.props.view
		var columns = this.state.columns
		var colList = (this.state.columnList || []).map(function (col) {
			return <ColumnDetail key = {"detail-" + col.id} config = {col} view= {view} />
		})
		var sortList = (this.state.sorting || []).map(function (sort) {
			var sortOrderClass = "small grayed icon icon-arrow-" + (sort.desc ? "up" : "down")
			var sortOrderLabel = sort.desc ? "Ascending" : "Descending"
			return <tr>
				<td>{sort.id}</td>
				<td><span className = {sortOrderClass}></span>{sortOrderLabel}</td>
			</tr>
		})

		return <div key="view-detail-bar">
			<h3>Columns</h3>
			<table className="detail-table">
				<thead><tr key="attr-header-row">
					<th key="attr-header-expand"></th>
					<th key="attr-header-name">Name</th>
					<th key="attr-header-visibility">Viz</th>
					<th key="attr-header-width">Width</th>
					<th key="attr-header-display">Show as</th>
				</tr></thead>
				{colList}
			</table>
			<h3>Sorting</h3>
			<table key="sort-table" className="detail-table">
				<thead>
				<tr key="sort-header-row">
					<th key="sort-header-col">Column</th>
					<th key="sort-header-Desc">Sort Order</th>
				</tr>
			</thead>
				<tbody>{sortList}</tbody>
			</table>
			<h3>Filter</h3>
		</div>
	}
});

export default TabularViewConfig;


var ColumnDetail = React.createClass({
	getInitialState: function () {
		return {
			open: false, 
			editing: false, 
			visible: true,
			width: this.props.config.width,
			visibility: this.props.config.visible
		};
	},
	handleClick: function (event) {
		this.setState({editing: !this.state.editing})
	},
	commitChanges: function () {
		var data = this.props.view.synget(bw.DEF.VIEW_DATA)
		var colId = this.props.config.id
		var col = data.columns[colId]

		col.visible = this.state.visible
		col.width = parseInt(this.state.width) || col.width
		this.props.view.set(bw.DEF.VIEW_DATA, data)
	},
	componentWillReceiveProps: function (props) {
		this.setState({
			width: props.config.width,
			visible: props.config.visible
		})
	},
	updateWidth: function (e) {
		var width = e.target.value
		this.setState({width: width})
	},
	toggleDetails: function (event) {
		this.setState({open: !this.state.open})
	},
	toggleVisibility: function (event) {
		this.state.visible = !this.state.visible
		this.commitChanges()
	},
	render: function () {
		var config = this.props.config
		var wedgeClasses = "small grayed icon icon-geo-triangle " +
			(this.state.open ? " wedge open" : "wedge closed")
		var name = config.name
		var nameField = (this.state.editing ? <input type="textbox" value={name} /> : name )
		var key = "attr-" + config.id
		var detailsStyle = {display: (this.state.open ? "table-cell" : "none")}
		var eyeSpan = <span className={"clickable icon icon-eye-" + (this.state.visible ? "3 green":"4 grayed")}></span>;
		return <tbody>
			<tr key={key + '-row'}>
				<td onClick={this.toggleDetails} key={key + '-expand'}>
					<span className={wedgeClasses}></span>
				</td>
				<td onDoubleClick={this.handleClick} key={key + '-name'}>
					{nameField}
				</td>
				<td onClick={this.toggleVisibility} key={key + '-visibility'}>
					{this.state.open ? void(0) : eyeSpan}
				</td>
				<td key={key + '-width'}>
					{this.state.open ? void(0) : (config.width + 'px') }
				</td>
				<td key={key + '-display'}> 
					{this.state.open ? void(0) : '??'}
				</td>
			</tr>	
			<tr key={key + '-row-background'}>
				<td style={detailsStyle}></td>
				<td style={detailsStyle}> Background: </td>
				<td style={detailsStyle} colSpan="3"> 
					<span className="icon grayed icon-tl-paintbrush"></span>Default
				</td>
			</tr>
			<tr key={key + '-row-visibility'}>
				<td style={detailsStyle}></td>
				<td style={detailsStyle}> Visibility: </td>
				<td colSpan="3" style={detailsStyle}>
				{eyeSpan} {this.state.visible ? "Visible":"Hidden"}
				</td>
			</tr>
			<tr key={key + '-row-width'}>
				<td style={detailsStyle}></td>
				<td style={detailsStyle}> Column width: </td>
				<td colSpan="3" style={detailsStyle}>
					<input value={this.state.width} style={{width: "30px"}} onBlur={this.commitChanges} onChange={this.updateWidth}/>px
				</td>
			</tr>
			<tr key={key + '-row-display'}>
				<td style={detailsStyle}></td>
				<td  colSpan="5" style={detailsStyle}> Show as: </td>
			</tr>
		</tbody>
	}
});