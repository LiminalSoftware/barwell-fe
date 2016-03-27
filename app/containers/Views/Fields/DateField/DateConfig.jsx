import React from "react"
import _ from "underscore"
import $ from "jquery"
import moment from "moment"
import styles from "./style.less"
import AttributeStore from "../../../../stores/AttributeStore"
import ModelStore from "../../../../stores/ModelStore"

import constant from "../../../../constants/MetasheetConstants"
import modelActionCreators from "../../../../actions/modelActionCreators"

import PopDownMenu from '../../../../components/PopDownMenu'

import commitMixin from '../commitMixin'
import editableInputMixin from '../editableInputMixin'
import selectableMixin from '../selectableMixin'
import DateValidatorMixin from './dateValidatorMixin'
import keyPressMixin from '../keyPressMixin'
import blurOnClickMixin from '../../../../blurOnClickMixin'
import configCommitMixin from '../configCommitMixin'

import dateStyles from './dateStyles'


var DateFormatChoice = React.createClass({

	partName: 'DateFormatChoice',

	mixins: [blurOnClickMixin, configCommitMixin],

	getInitialState: function () {
		var config = this.props.config;
		var custom = !_.any(dateStyles, ds => ds.formatString === config.formatString)
		return {
			open: false,
			formatString: (config.formatString || 'DD/MM/YYYY'),
			custom: custom
		}
	},

	handleFormatChange: function (e) {
		var value = e.target.value
		this.setState({formatString: value})
	},

	onBlur: function (e) {
		var config = this.props.config
		var view = this.props.view
		var column_id = config.column_id
		var data = view.data
		var col = data.columns[column_id]

		col.formatString = this.state.formatString
		modelActionCreators.createView(view, false, true)
	},

	handleChooseCustom: function () {
		this.setState({custom: true})
	},

	chooseFormat: function (format, e) {
		this.commitChanges({
			custom: false, 
			open: false, 
			formatString: format.formatString
		})
	},

	render: function () {
		var _this = this
		var config = this.props.config
		var key = "attr-" + config.id

		return <span className = "clickable pop-down icon icon-calendar-31"
		onClick = {this.handleOpen}>
		{
			this.state.open ? 
			<PopDownMenu {...this.props}>
			<li className = "bottom-divider">
              Date Format
        	</li>
			{
				_.map(dateStyles, function (dateStyle, dateStyleId) {
					var active = (_this.state.formatString === dateStyle.formatString)
					return <li className = "selectable"
						key = {dateStyle.id}
						onClick = {_this.chooseFormat.bind(_this, dateStyle)}>
						<span className = {"icon icon-chevron-right " + 
							(active ? 'green' : 'hovershow')}/>
						<span className = "icon icon-calendar-31"/>
						{dateStyle.description}
					</li>
				})
			}
			
			<li className = "top-divider selectable" onClick = {this.handleChooseCustom}>
				<span className = {"icon icon-chevron-right " + 
					(this.state.custom ? 'green' : 'hovershow')}/>
				<span className="icon icon-code"/>
				Custom
			</li>

			{
			this.state.custom ? <li><input type = "text"
				className = "menu-input text-input"
				style = {{textAlign: 'center'}}
				spellCheck = "false"
				value = {this.state.formatString}
				onBlur = {this.onBlur}
				onChange = {this.handleFormatChange}/></li>
			: null
			}

			
			</PopDownMenu>
			:
			null
		}
		</span>
	}
})

export default DateFormatChoice