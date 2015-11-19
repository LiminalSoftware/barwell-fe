import React from "react";
import _ from 'underscore';
import viewTypes from "../../Views/viewTypes"
import modelActionCreators from "../../../actions/modelActionCreators"
import ViewStore from "../../../stores/ViewStore"

var ViewDetails = React.createClass({

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
			modelActionCreators.createView(view, true, true);
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

		// if (this.state.selectingType) {
		// 	var typeEls = _.map(viewTypes, function (details, type) {
		// 		return <div cl
		// 			key = {"view-type-selector-" + type}
		// 			onClick = {_this.viewClickerFactory(type)}>
		// 			<td className="width-25 centered clickable padded">
		// 				<span className={"clear icon "+ details.icon}></span>{type}
		// 			</td>
		// 			<td className="width-75 hoverable clickable">
		// 				{details.description}
		// 			</td>
		// 		</tr>
		// 	})
		// 	typeSelector = <tbody>
		// 		{typeEls}
		// 	</tbody>
		// } else {
		// 	typeSelector = void(0)
		// }

		// <WarningBox text="by changing the view type, you may lose your existing configurations"/>

		return <div className="detail-block">
			<div className="detail-section-header">
				<h3>View Details</h3>
			</div>
			<div className="detail-table">
					<div className = "header-row">
						<span className="width-25">Name:</span>
						<span className="width-75">{this.state.name}</span>
					</div>
					<div>
						<span className="width-25">Type:</span>
						<span className="width-75 clickable"
						   onClick={this.chgType}>
								<span className={"icon " + icon}></span>
								{this.state.type}
								<span className="small right-align grayed icon icon-geo-triangle wedge open"></span>
						</span>
					</div>
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

export default ViewDetails