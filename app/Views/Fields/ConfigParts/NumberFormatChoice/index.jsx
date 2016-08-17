import React, { Component, PropTypes } from 'react';
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"
import util from "../../../../util/util"

import commitColumnConfig from "../commitColumnConfig"
import displayStyles from "./displayStyles"

const parseFormatString = function (string) {
	var regex = /^([$€¥£])?\d(,\d)?([.,]\d+)?(%)?$/;
	var str, prefix, commaClause, decimalDigits, suffix;
	var hits = regex.exec(string)
	var format = {}

	if (hits) {
		[str, prefix, commaClause, decimalDigits, suffix] = hits;
		format.numDigits = decimalDigits ? (decimalDigits.length - 1) : 0;
		format.hasCommas = (commaClause === undefined)
		if (prefix !== undefined && suffix === undefined) {
			format.type = 'CURRENCY';
			format.currencySymbol = prefix;
		} else if (suffix === '%' && prefix === undefined) {
			format.type = 'PERCENTAGE';
		} else if (suffix === undefined && prefix === undefined) {
			format.type = 'DECIMAL';
		} else {
			format.type = 'CUSTOM'; 
		}
	}
	else format.type = 'CUSTOM';

	return format;
}

const makeFormatString = function ({prefix, commaClause, decimalDigits, suffix}) {
	let formatString = '';
	if (prefix) formatString += prefix
	formatString += '0'
	if (commaClause) formatString += commaClause
	if (decimalDigits) formatString += decimalDigits
	if (suffix) formatString += suffix
	return formatString
}

export default {

	partName: "Number choice",

	partLabel: "Numeric format",

	getIcon: function (config) {
		var formatAttr = parseFormatString(config.formatString)
		var displayObj = displayStyles[formatAttr.type]
		return ` icon ${displayObj.icon}`;
	},

	element: class NumberConfig extends Component {
		constructor (props) {
			super(props)
			const config = props.config
			const formatAttr = parseFormatString(config.format)
			
			this.state = Object.assign({
				formatString: config.formatString,
				custom: formatAttr.type === 'CUSTOM'
			}, formatAttr)
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

		setDecimalPlaces = (length) => {
			const format = parseFormatString(this.state.formatString);
			let decimalDigits = format.decimalDigits.slice(0,1);
			for (var i = 0; i < length; i++) decimalDigits += '0';
			format.decimalDigits = decimalDigits;
		}

		getPresetsMenu = () => {
			var _this = this
			var config = this.props.config
			var format = config.displayStyle
			var formatAttr = parseFormatString(config.formatString)

			return <div key = "presets">
				<div className="popdown-item title bottom-divider">
					Numeric Format
				</div>
				{
				_.map(displayStyles, function (ds, k) {
					return <div 
						key = {ds.displayStyle} 
						className = "popdown-item selectable " 
						
						onClick = {_this.chooseFormat.bind(_this, ds)}>

						<span className = 
						{`icon ${ds.icon} ${(formatAttr.type===k?'icon-hilite':'icon-selectable')}`}/>
						{ds.description}
					</div>
				})
				}

				<div key="format-header" className = "popdown-item  top-divider "
					onClick = {this.handleChooseCustom}>
					
					<span className = 
					{`icon icon-code ${this.state.custom?'icon-hilite':'icon-selectable'}`}/>
					Custom:
					{
						this.state.custom ?
							<input
								type = "text"
								style = {{textAlign: 'center', width: '120px'}}
								className = "popdown-item menu-input text-input" 
								value = {this.state.formatString}
								onBlur = {this.onBlur}
								onChange = {_this.handleFormatChange}/> 
							: null
						}
				</div>
			</div>
		}

		getCustomMenu = () => {
			var _this = this
			var config = this.props.config
			var format = config.displayStyle
			var formatAttr = parseFormatString(config.formatString)

			
			return <div className = "popdown-section" key="custom">
				<li className="popdown-item title bottom-divider">
					Customize
				</li>
				<li className  = "popdown-item">
					<span className = "clicklabel">Decimal places:</span>
					<span className = "clickbox icon icon-arrow-left"/>
					<span className = "clickbox">{formatAttr.numDigits}</span>
					<span className = "clickbox icon icon-arrow-right"/>
				</li>
				<li className  = "popdown-item">
					<span className = "clicklabel">Thousands separator:</span> 
					<span className={"clickbox " + (formatAttr.commaClause === undefined ? " clickbox-active " : "")}>none</span>
					<span className={"clickbox bold"  + (/[,]\d/.test(formatAttr.commaClause) ? " clickbox-active " : "")}>,</span>
					<span className={"clickbox bold"  + (/[.]\d/.test(formatAttr.commaClause) ? " clickbox-active " : "")}>.</span>
				</li>
				<li className  = "popdown-item">
					<span className = "clicklabel">Decimal mark:</span>
					<span className = "clickbox icon icon-arrow-left"/>
					<span className = "clickbox"></span>
					<span className = "clickbox icon icon-arrow-right"/>
				</li>
			</div>
		}

		render = () => {
			return <div className="context-menu">
				{
				this.getPresetsMenu()
				}
				{
				this.getCustomMenu()
				}
				<div className = "popdown-item selectable top-divider" onClick={this.props.blurSelf}>
					<span className="icon icon-arrow-left icon-detail-left"/>
					<span>Back</span>
				</div>
			</div>;
		}
	}
}
