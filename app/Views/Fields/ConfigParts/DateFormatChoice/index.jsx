import React, { Component, PropTypes } from 'react';
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"
import util from "../../../../util/util"

import commitColumnConfig from "../commitColumnConfig"
import dateStyles from "./dateStyles"


export default {

	partName: "Date format choice",

	partLabel: "Date format",

	getIcon: function (config) {
		return 'icon icon-calendar-31'
	},

	element: class DateConfig extends Component {
		constructor (props) {
			super(props)
			const config = props.config
			const custom = !_.any(dateStyles, ds => ds.formatString === config.formatString)

			this.state = {
				formatString: (config.formatString || 'DD/MM/YYYY'),
				custom: custom
			}
		}

		handleFormatChange = (e) => {
			var value = e.target.value
			this.setState({formatString: value})
		}

		onBlur = (e) => {
			const patch = {
				formatString: this.state.formatString
			}
			commitColumnConfig(
				this.props.view, 
				this.props.config.column_id, 
				patch)
		}

		handleChooseCustom = () => {
			this.setState({custom: true})
		}

		chooseFormat = (format, e) => {
			commitColumnConfig(
				this.props.view, 
				this.props.config.column_id, 
				{formatString: format.formatString})
			
			this.setState({
				formatString: format.formatString,
				custom: false
			})
		}

		render = () => {
			const _this = this
			const config = this.props.config
			const key = "attr-" + config.id

			return <div className = "context-menu">
				<div className = "popdown-item title bottom-divider">
	              Date Format
	        	</div>
				{
					_.map(dateStyles, (dateStyle, dateStyleId) =>
						<div className = {"popdown-item selectable "}
							key = {dateStyle.id}
							onClick = {_this.chooseFormat.bind(_this, dateStyle)}>
							<span className = {"icon icon-calendar-31 " + 
							(_this.state.formatString === dateStyle.formatString ? 'icon-hilite' : 'icon-selectable')}/>
							{dateStyle.description}
						</div>)
				}
				
				<div className = "popdown-item top-divider selectable"
					onClick = {this.handleChooseCustom}>
					<span className={"icon icon-code " + 
					(_this.state.custom ? 'icon-hilite' : 'icon-selectable')}/>
					Custom
				</div>

				{
				this.state.custom ? <div><input type = "text"
					className = "menu-input text-input"
					style = {{textAlign: 'center'}}
					spellCheck = "false"
					value = {this.state.formatString}
					onBlur = {this.onBlur}
					onChange = {this.handleFormatChange}/>
				</div>
				: null
				}

				<div className = "popdown-item selectable top-divider" onClick={this.props.blurSelf}>
					<span className="icon icon-arrow-left icon-detail-left"/>
					<span>Back</span>
				</div>
			</div>
		}
	}
}
