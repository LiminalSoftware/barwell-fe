import React from "react"
// import styles from "./detailStyle.less"
import { Link } from "react-router"
import moment from "moment"

import constants from '../../../../constants/MetasheetConstants'
import DateValidatorMixin from './dateValidatorMixin'
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import editableInputMixin from '../editableInputMixin'

import CommitMixin from '../commitMixin'
var DateDetail = React.createClass({

	mixins: [PureRenderMixin, DateValidatorMixin, CommitMixin],

	getInitialState: function () {
		var val = this.props.value ? moment(this.props.value) : moment()
		return {
			year: val.year(),
			month: val.month(),
			day: 1,
			date: val,
			rowHeight: 15
		}
	},

	componentDidMount: function () {
		// var el = this.refs.calendarwrapper.getDOMNode()
		// el.scrollTop = (78 * this.state.rowHeight) + 'px'
	},

	incYear: function () {
		this.setState({year: this.state.year + 1})
	},

	decYear: function () {
		this.setState({year: this.state.year - 1})
	},

	handleClickDay: function (date, event) {
		this.setState({date: date})
		this.commitValue(date)
	},

	getDaysInYear: function (center) {
		var weeks = []
		var start = moment(this.state.year + ' 01 01', "YYYY MM DD").startOf('year').startOf('week')
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
		var _this = this
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
					<div className = "closed menu-item menu-sub-item">
						Year:
						<input className = "menu-input text-input"
						value = {this.state.year}/></div>
				</div>
				<div className="dropdown small grayed icon icon-geo-arrw-right" onClick = {this.incYear}></div>
			</div>

			<div className = "color-detail-scroll" ref = "calendarwrapper">
				<table className = "calendar-table"><tbody>
					{weeks.map(function (days, weekIdx) {
						var day = days[0]
						var isFirstWeek = (weekIdx === 0) ||
							(day.clone().subtract(1, 'week').month() !== day.month())
						var numWeeks = Math.ceil((day.clone().endOf('month').date() - day.date() + 1) / 7)
						// console.log('numWeeks: ' + numWeeks)
						return <tr
							className = "week-box"
							key = {"week-" + weekIdx}
							style = {{height: _this.state.rowHeight + 'px'}}>
							{isFirstWeek ?
								<td rowSpan = {numWeeks}
									key = {'label-' + weekIdx}
									className = {"month-label " }>
								{day.format('MMM')}</td> : null}
							{days.map(function (day, idx) {
								var classes = []
								var isLastWeek = (day.clone().add(1, 'week').month() !== day.month())
								var isLastDay = (day.clone().add(1, 'day').month() !== day.month())
								classes.push('day-box')
								if (isLastWeek) classes.push('last-week')
								if (isLastDay || idx === 6) classes.push('last-day')
								if (idx === 0) classes.push('first-day')
								if (day.isSame(value)) classes.push('selected')
								if (day.year() !== _this.state.year) classes.push('different-year')
								return <td
									key = {'day-' + weekIdx + '-' + idx}
									className = {classes.join(' ')}
									onClick = {_this.handleClickDay.bind(null, day)}>
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
