import React from "react";
import bw from "barwell";
import _ from 'underscore';

var viewTypes = {
	Tabular: {
		type: "Tabular",
		icon: "icon-db-datasheet"
	},
	Cube: {
		type: "Cube",
		icon: "icon-geo-cube"
	},
	Calendar: {
		type: "Calendar",
		icon: "icon-calendar-empty"
	},
	Timeline : {
		type: "Timeline",
		icon: "icon-chart-bars-6"
	}
}

var ViewSelector = React.createClass({
	getInitialState: function () {
		var view = this.props.view
		var name = view.synget(bw.DEF.VIEW_NAME)
		var data = view.synget(bw.DEF.VIEW_DATA)
		var type = data.type
		return {
			renaming: false,
			selectingType: false,
			name: name,
			type: type
		}
	},
	update: function () {
		var view = this.props.view
		var name = view.synget(bw.DEF.VIEW_NAME)
		var data = view.synget(bw.DEF.VIEW_DATA)
		var type = data.type
		this.setState({
			name: name,
			type: type
		})
	},
	componentDidMount: function () {
		var view = this.props.view
		view.on('update', this.update)
	},
	viewClickerFactory: function (type) {
		var view = this.props.view
		var data = view.synget(bw.DEF.VIEW_DATA)
		var _this = this
		return function () {
			data.type = type
			view.set(bw.DEF.VIEW_DATA, data)
			_this.revert()
		}
	},
	revert: function () {
		this.setState({selectingType: false})
	},
	render: function () {
		var view = this.props.view
		var icon = viewTypes[this.state.type].icon
		var typeSelector
		var _this = this
		
		if (this.state.selectingType) {
			var typeEls = _.map(viewTypes, function (details, type) {
				return <li className="detail-cell centered" onClick={_this.viewClickerFactory(type)}>
				<span className={"icon "+ details.icon}></span>{type}
				</li>
			})
			typeSelector = <ul className="selector detail-row">
				{typeEls}
			</ul>
		} else {
			typeSelector = void(0)
		}

		// <WarningBox text="by changing the view type, you may lose your existing configurations"/>

		return <div>
			<h3>View Details</h3>
			<div className="detail-block">
				<div className="detail-row">
					<div className="detail-cell label">Name:</div>
					<div className="detail-cell value">{this.state.name}</div>
				</div>
				<div className="detail-row">
					<div className="detail-cell label">Type:</div>
					<div className="detail-cell value" onDoubleClick={this.chgType}>
						<span className={"icon " + icon}></span>
						{this.state.type}
						<a href="#" onClick={this.chgType}><span className="small right-align grayed icon icon-geo-triangle wedge open"></span></a>
					</div>
				</div>
			{typeSelector}
			
			</div>
		</div>
	},
	chgType: function () {
		this.setState({selectingType: true})
	}
})

var WarningBox = React.createClass({
	render: function () {
		var text = this.props.text;
		return <div className="warning banner">
			<span className="gold icon icon-warning"></span> <span>Warning:</span> <span>{text}</span>
		</div>
	}
})

export default ViewSelector