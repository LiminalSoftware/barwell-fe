import React from "react";
import _ from 'underscore';
import viewTypes from "../../Views/viewTypes"
import dispatcher from "../../../dispatcher/MetasheetDispatcher"
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

	componentDidMount: function () {
		var view = this.props.view
		ViewStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function () {
		var view = this.props.view
		ViewStore.removeChangeListener(this._onChange);
	},

	_onChange: function () {
		var viewData = ViewStore.get(this.props.view_id)
		this.setState(viewData)
	},

	viewClickerFactory: function (type) {
		var view = this.props.view
		var data = view.data
		data.type = type
		var _this = this
		return function () {
			dispatcher.dispatch({
				type: "VIEW_CREATE",
				data: data
			})
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
				return <tr 
					className = "hoverable"
					key = {"view-type-selector-" + type} 
					onClick = {_this.viewClickerFactory(type)}>
					<td className="width-30 centered clickable padded">
						<span className={"clear icon "+ details.icon}></span>{type}
					</td>
					<td className="width-70 hoverable clickable">
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
						<td className="width-30">Name:</td>
						<td className="width-70">{this.state.name}</td>
					</tr>
					<tr>
						<td className="width-30">Type:</td>
						<td className="width-70" 
						   onClick={this.chgType}>
							<a className="not-really-a-link" onClick={this.chgType}>
								<span className={"icon " + icon}></span>
								{this.state.type}
								<span className="small right-align grayed icon icon-geo-triangle wedge open"></span>
							</a>
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