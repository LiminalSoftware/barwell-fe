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
		var config = this.props.config
		var val = this.props.value ? moment(this.props.value) : moment()
		return {
			year: val.year(),
			month: val.month(),
			date: val.format(config.formatString)
		}
	},

	onChange: function (e) {
		this.setState({date: e.target.value});
	},
	
	clickChoice: function (e, date) {
		// this.setState({value: color})
		// this.commitValue(color)
	},

	render: function() {
		var _this = this
    	var model = this.props.model
    	var config = this.props.config
    	var view = this.props.view

		var obj = this.props.object
		var value = obj[config.column_id];
		var date = moment(value);
		if (!date.isValid()) date = moment();
		var month = date.month();
		var year = date.year();


		// var format = config.formatString || "DD MMMM YYYY";
		// var prettyDate = date.format(format);

		var firstDay = moment([year, month]);
		firstDay = firstDay.subtract(firstDay.day(), 'd');
		var lastDay = date.endOf('month');
		lastDay = lastDay.add(7 - lastDay.day() );
		var numDays = lastDay.diff(firstDay, 'd')
		var d = 0;
		var w = 0;
		var header = <li className = "color-row">{
			['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
			.map(d => <span className = "color-choice"  key = {d}>
				{d}
			</span>)
		}</li>;
		var weeks = [header];

		console.log("lastDay.date(): " + lastDay.date());
		console.log("firstDay.date(): " + firstDay.date());
		console.log("numDays " + numDays);

		while (d < numDays) {
			var week = new Array(7);
			for (var i = 0; i < 7; i++) {
				firstDay.add(1, 'd');
				week[i] = <span className = "date-choice"  key = {d}>
					{firstDay.date()}
				</span>;
				d += 1;
			}
			weeks.push(<li className = "color-row" key = {d}>{week}</li>);
		}
		

		return <PopDownMenu {...this.props}>
			<li className = "bottom-divider">{date.format('MMMM')}</li>
			{weeks}
		</PopDownMenu>
	}
});

export default DatePicker
