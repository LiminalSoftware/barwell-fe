import React from "react"
import _ from "underscore"
import tinycolor from "tinycolor2"

// import styles from "./detailStyle.less"
import { Link } from "react-router"
import util from '../../../../util/util'
import PopDownMenu from "../../../../components/PopDownMenu"
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import CommitMixin from '../commitMixin'
import ColorValidationMixin from './ColorValidationMixin'
import MenuKeysMixin from '../MenuKeysMixin'

var DatePicker = React.createClass({

	mixins: [ColorValidationMixin, CommitMixin, MenuKeysMixin],

	getInitialState: function () {
		var config = this.props.config
		var val = this.props.value ? moment(this.props.value) : moment()
		return {
			year: val.year(),
			month: val.month(),
			date: val
		}
	},

	onChange: function (e) {
		this.setState({year: e.target.value})
	},
	
	clickChoice: function (event) {
		var color = event.target.style.background
		this.setState({value: color})
		this.commitValue(color)
	},

	render: function() {
		var _this = this
    	var model = this.props.model
    	var view = this.props.view
		var obj = this.props.object
		var config = this.props.config
		var weeks = []
		var month = this.state.month
		var year = this.state.year

		var firstDay = moment(`${year}-${month}-01`).startOf('month')

		for (var w = ; w < 5; w++) {

		}

		return <PopDownMenu {...this.props}>
			<li>
				<input 
					value={this.state.year}
					onChange = {this.onChange}/>
			</li>
			<li>
				
			</li>
		</PopDownMenu>
	}
});

export default ColorPicker
