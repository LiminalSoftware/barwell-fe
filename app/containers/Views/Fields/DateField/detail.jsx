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

	getDaysInYear: function (center) {
		var weeks = []
		var start = moment(center).subtract(moment(center).day() + 26*7, 'days')
		for (var w = 0; w < 52; w++) {
			var days = []
			for (var d = 0; d < 7; d++) {
				days.push(start.clone().add(w * 7 + d, 'days'))
			}
			weeks.push(days)
		}
		return weeks
	},

	render: function() {
		var value = this.state.date
    var model = this.props.model
    var view = this.props.view
		var obj = this.props.object
		var config = this.props.config
		var weeks = this.getDaysInYear(value)

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
				<table className = "date-detail-week"><tbody>
					{weeks.map(function (days) {
						return <tr className = "week-box">
							{days.map(function (day, idx) {
								var classes = []
								var isLastWeek = (day.clone().add(1, 'week').month() !== day.month())
								var isLastDay = (day.clone().add(1, 'day').month() !== day.month())
								classes.push('day-box')
								if (isLastWeek) classes.push('last-week')
								if (isLastDay || idx === 6) classes.push('last-day')
								if (idx === 0) classes.push('first-day')
								if (day.isSame(value)) classes.push('selected')
								return <td className = {classes.join(' ')}>
									{day.date()}
								</td>
							})}
						</tr>
					})
					}
				</tbody></table>
			</div>
		</div>
	}
});

export default DateDetail
