import React from "react";
import _ from 'underscore';
import viewTypes from "../../Views/viewTypes"
import modelActionCreators from "../../../actions/modelActionCreators"
import ViewStore from "../../../stores/ViewStore"

var ViewSelector = React.createClass({

	getInitialState: function () {
		var view = this.props.view
		return {
			renaming: false,
			selectingType: false,
			name: view.view,
			type: view.type
		}
	},

	update: function () {
		var view = this.props.view
		this.setState({
			name: view.view,
			type: view.type
		})
	},
	
	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange);
		this.update()
	},

	componentWillUnmount: function () {
		var view = this.props.view
		ViewStore.removeChangeListener(this._onChange);
	},

	_onChange: function () {
		var viewData = this.props.view.data;
		this.setState(viewData)
	},

	viewClickerFactory: function (type) {
		var _this = this
		var view = this.props.view
		// var data = view.data
		
		return function () {
			view.type = type
			_this.revert()
			modelActionCreators.create('view', true, view, true);
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
				return <tr 
					key = {"view-type-selector-" + type} 
					onClick = {_this.viewClickerFactory(type)}>
					<td className="width-20 centered clickable padded">
						<span className={"clear icon "+ details.icon}></span>{type}
					</td>
					<td className="width-80 hoverable clickable">
						{details.description}
					</td>
				</tr>
			})
			typeSelector = <tbody>
				{typeEls}
			</tbody>
		} else {
			typeSelector = void(0)
		}

		// <WarningBox text="by changing the view type, you may lose your existing configurations"/>

		return <div className="detail-block">
			<h3>View Details</h3>
			<table className="detail-table">
				<tbody>
					<tr>
						<td className="width-20">Name:</td>
						<td className="width-80">{this.state.name}</td>
					</tr>
					<tr>
						<td className="width-20">Type:</td>
						<td className="width-80" 
						   onClick={this.chgType}>
								<span className={"icon " + icon}></span>
								{this.state.type}
								<span className="small right-align grayed icon icon-geo-triangle wedge open"></span>
						</td>
					</tr>
				</tbody>
				{typeSelector}
			</table>
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