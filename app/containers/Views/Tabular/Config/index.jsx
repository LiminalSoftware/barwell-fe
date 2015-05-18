import React from "react";
import { Link } from "react-router";
import bw from "barwell";
import styles from "./style.less";
import _ from 'underscore';

var TabularViewConfig = React.createClass({
	componentDidMount: function () {
		var view = this.props.view;
		view.on('update', this.render.bind(this));
	},
	render: function() {
		console.log('render TabularViewConfig');
		var _this = this;
		var model = this.props.model;
		var view = this.props.view;
		var viewData = this.props.view.synget(bw.DEF.VIEW_DATA);
		var columns = _.sortBy(_.values(viewData.columns), 'order');

		var colList = columns.map(function (col) {
			return <ColumnDetail config = {col} view= {view} />;
		});

		return <div key="view-detail-bar" className={"view-details " + (this.props.visible ? "" : "hidden")}>
			
			<h3>Attributes <span className="info-box"></span> </h3>
			<table key="attr-table" className="detail-table">
				<tr key="attr-header-row">
					<th key="attr-header-expand"></th>
					<th key="attr-header-name">Name</th>
					<th key="attr-header-visibility">Viz</th>
					<th key="attr-header-width">Width</th>
					<th key="attr-header-display">Show as</th>
				</tr>
				<tbody>{colList}</tbody>
			</table>

			<h3>Sorting</h3>

			<h3>Filter</h3>
			
		</div>;
	}
});

export default TabularViewConfig;


var ColumnDetail = React.createClass({
	getInitialState: function () {
		return {open: false, editing: false, visible: true};
	},
	handleClick: function (event) {
		this.setState({editing: !this.state.editing});
	},
	toggleDetails: function (event) {
		this.setState({open: !this.state.open});
	},
	toggleVisibility: function (event) {
		var data = this.props.view.synget(bw.DEF.VIEW_DATA);
		var colId = this.props.config.id;
		
		data.columns[colId].visible = !data.columns[colId].visible;
		this.props.view.set(bw.DEF.VIEW_DATA, data);
		// TODO: render should automatically trigger when the listener works
		this.forceUpdate();
	},
	render: function () {
		var config = this.props.config;
		var wedgeClasses = "small grayed icon icon-geo-triangle " +
			(this.state.open ? " wedge open" : "wedge closed");
		var name = config.name;
		var nameField = (this.state.editing ? <input type="textbox" value={name}/> : name );
		var key = "attr-" + config.id;
		
		return <tr key={key}>
			<td onClick={this.toggleDetails} key={key + '-expand'}>
				<span className={wedgeClasses}></span>
			</td>
			<td onDoubleClick={this.handleClick} key={key + '-name'}>
				{nameField}
			</td>
			<td onClick={this.toggleVisibility} key={key + '-visibility'}>
				<span className={"clickable icon icon-eye-" + (config.visible ? "3 icon greened":"4 icon grayed")}></span>
			</td>
			<td key={key + '-width'}>{config.width}px</td>
			<td> ?? </td>
		</tr>	
	}
});