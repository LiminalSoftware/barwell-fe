import React from "react"
import _ from "underscore"
import update from 'react/lib/update'
import moment from "moment"
import { Link } from "react-router"
import util from "../../util/util"

const calculateState = function (props) {
	var val = props.value ? moment(props.value) : moment();
	var config = props.config || {}
	return {
		year: val.year(),
		month: val.month(),
		date: val.format(config.formatString)
	}
}


var DatePicker = React.createClass({

	getInitialState: function () {
		return calculateState(this.props);
	},

	componentWillReceiveProps: function (next) {
		this.setState(calculateState(next))
	},

	componentDidMount: function () {
		this._debounceChooseYear = _.debounce(this.chooseYear, 500);
	},

	chooseMonth: function (e) {
		this.setState({month: e.target.value})
	},

	chooseYear: function (e) {
		this.setState({year: e.target.year})
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

		var monthChoices = [];

		for (var monthNum = 0; monthNum < 12; monthNum++) {
			var monthName = moment('1999-' + (monthNum > 8 ? (monthNum + 1) : ('0' + (monthNum + 1))) + '-01').format('MMMM')
			monthChoices.push(<option value = {monthNum}>{monthName}</option>)
		}

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
						<span className = {classes} >
							{firstDay.format('D')}
						</span>
				</span>;

				firstDay.add(1, 'd');
			}
			weeks.push(<div className = "popdown-item menu-row" key = {firstDay.format('MMDDYYYY')}>{week}</div>);
		}
		
		return <div className="popdown-menu"
			onMouseDown = {util.clickTrap} 
			onDoubleClick = {util.clickTrap}>

			<div className = "popdown-item bottom-divider menu-row gray">
				<span className = "menu-choice">
					<span className = "icon green icon-arrow-left"
					style = {{float: 'left'}}
					onClick = {this.handleDecMonth} />
				</span>
				<span className = "menu-choice menu-choice--double">
					<select className = "menu-input selector" value = {this.state.month} onChange = {this.chooseMonth}>
						{monthChoices}
					</select>
				</span>
				<span className = "menu-choice" style = {{position: 'relative'}}>
					<input className = "input-editor" 
						style = {{width: '50px'}} 
						value = {_this.state.year} 
						onChange = {_this._debounceChooseYear}/>
				</span>
				<span className = "menu-choice" style={{textAlign: 'right', float: 'right'}}>
					<span className = "icon green icon-arrow-right"
					style = {{float: 'right', textAlign: 'right'}}
					onClick = {this.handleIncMonth} />
				</span>
			</div>
			{weeks}
		</div>
	}
});

export default DatePicker
