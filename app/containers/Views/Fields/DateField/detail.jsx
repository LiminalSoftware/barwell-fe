import React from "react"
// import styles from "./detailStyle.less"
import { Link } from "react-router"
import moment from "moment"

import constants from '../../../../constants/MetasheetConstants'
import DateValidatorMixin from './dateValidatorMixin'
// var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var DateDetail = React.createClass({

	mixins: [PureRenderMixin, ],

	getInitialState: function () {
		var val = this.props.value ? moment(this.props.value) : moment()
		return {
			year: val.year(),
			month: val.month(),
			day: 1,
			date: val
		}
	},

	incYear: function () {
		this.setState({year: this.state.year + 1})
	},

	decYear: function () {
		this.setState({year: this.state.year - 1})
	},

	render: function() {
    var model = this.props.model
    var view = this.props.view
		var obj = this.props.object
		var config = this.props.config

		return <div className = "color-detail-inner">
			<div className = "header-label">Date picker</div>
			<div className = "model-views-menu">
				<div className="dropdown small grayed icon icon-geo-arrw-left" onClick = {this.decYear}></div>
				<div className = "model-views-menu-inner">
					<div className = "closed menu-item menu-sub-item">{this.state.year}</div>
				</div>
				<div className="dropdown small grayed icon icon-geo-arrw-right" onClick = {this.incYear}></div>
			</div>
			<div className = "model-views-menu">
				<div className="dropdown small grayed icon icon-geo-arrw-left" onClick = {this.decMonth}></div>
				<div className = "model-views-menu-inner">
					<div className = "closed menu-item menu-sub-item">{this.state.month}</div>
				</div>
				<div className="dropdown small grayed icon icon-geo-arrw-right" onClick = {this.incMonth}></div>
			</div>
			<div className = "color-detail-scroll">
			</div>
		</div>
	}
});

export default DateDetail
