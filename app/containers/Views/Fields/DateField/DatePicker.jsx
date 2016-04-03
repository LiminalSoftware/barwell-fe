import React from "react"
import _ from "underscore"
import moment from "moment"


import { Link } from "react-router"
import util from '../../../../util/util'
import PopDownMenu from "../../../../components/PopDownMenu"

import CommitMixin from '../commitMixin'
import DateValidatorMixin from './DateValidatorMixin'
import MenuKeysMixin from '../MenuKeysMixin'

var DatePicker = React.createClass({

	mixins: [DateValidatorMixin, CommitMixin, MenuKeysMixin],

	getInitialState: function () {
		return this.calculateState(this.props);
	},

	componentWillReceiveProps: function (next) {
		this.setState(this.calculateState(next))
	},

	calculateState: function (props) {
		var val = this.props.value ? moment(this.props.value) : moment();
		var config = props.config
		return {
			year: val.year(),
			month: val.month(),
			date: val.format(config.formatString)
		}
	},

	handleIncMonth: function (e) {
		if (this.state.month === 11) {
			this.setState({
				month: 0,
				year: this.state.year + 1
			})
		} 
		else this.setState({month: this.state.month + 1})
		util.clickTrap(e)
	},

	handleDecMonth: function (e) {
		if (this.state.month === 0) {
			this.setState({
				month: 11,
				year: this.state.year - 1
			})
		} 
		else this.setState({month: this.state.month - 1})
		util.clickTrap(e)
	},

	onChange: function (e) {
		this.setState({date: e.target.value});
	},
	
	clickChoice: function (date, e) {
		this.setState({value: date});
		this.commitValue(date);
		util.clickTrap(e)
	},



	render: function() {
		var _this = this
    	var model = this.props.model
    	var config = this.props.config
    	var view = this.props.view

		var value = this.props.value
		var date = moment(value);
		if (!date.isValid()) date = moment();

		var month = this.state.month;
		var year = this.state.year;

		console.log('month: ' + month)
		console.log('year: ' + year)

		var firstDay = moment([year, month]);
		firstDay = firstDay.subtract(firstDay.day(), 'day');
		var stopDay = firstDay.clone().add(1, 'month');
		stopDay = stopDay.add(7 - stopDay.day());

		var header = <li className = "menu-row">{
			['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
			.map(d => <span className = "menu-choice"  key = {d}>
				{d}
			</span>)
		}</li>;
		var weeks = [header];

		while (firstDay.isBefore(stopDay)) {
			var week = new Array(7);

			for (var i = 0; i < 7; i++) {
				var classes = (firstDay.month() === month ? '' : ' date-out-of-month ') + 
					(firstDay.isSame(date, 'd') ? ' date-selected ' : '');
				week[i] = <span 
					style = {{textAlign: 'center'}}
					className = {"menu-choice--date "}
					onClick = {this.clickChoice.bind(this, firstDay.clone())}
					key = {firstDay.format('MMDDYYYY')}>
						<span className = {classes}>
							{firstDay.format('D')}
						</span>
				</span>;

				firstDay.add(1, 'd');
			}
			weeks.push(<li className = "menu-row" key = {firstDay.format('MMDDYYYY')}>{week}</li>);
		}
		
		return <PopDownMenu {...this.props} onMouseDown = {util.clickTrap}>
			<li className = "bottom-divider menu-row">
				<span className = "menu-choice icon icon-chevron-left"
					style = {{textAlign: 'left'}}
					onClick = {this.handleDecMonth} />
				<span className = "menu-choice menu-choice--double">{moment([year, month]).format('MMMM YYYY')}</span>
				<span className = "menu-choice icon icon-chevron-right"
					style = {{textAlign: 'right'}}
					onClick = {this.handleIncMonth} />
			</li>
			{weeks}
		</PopDownMenu>
	}
});

export default DatePicker
