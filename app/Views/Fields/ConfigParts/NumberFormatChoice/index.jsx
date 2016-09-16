import React, { Component, PropTypes } from 'react'
import update from 'react/lib/update'
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"
import util from "../../../../util/util"

import constants from "../../../../constants/MetasheetConstants"

import commitColumnConfig from "../commitColumnConfig"
import displayStyles from "./displayStyles"

const parseFormatString = function (string) {
	const regex = /^([$€¥£])?(\s*)([\(])?\d(([,.'])?\d)?(([.,]|\[[.,]\])?(\d*))?(\))?(a)?(\))?([$€¥£%])?$/;
	let str, prefix, space, leftParen, commaClause, thousandMark, decimalClause, decimalMark, decimalDigits, rightParen, abbr, rightParen2, suffix;
	const hits = regex.exec(string)
	let format = {}

	if (hits) {
		[str, prefix, space, leftParen, commaClause, thousandMark, decimalClause, decimalMark, decimalDigits, rightParen, abbr, rightParen2, suffix] = hits;
		format.prefix = prefix
		
		format.optionalDecimal = decimalMark && decimalMark.slice(0,1) === '['
		format.decimalMark = format.optionalDecimal ? decimalMark.slice(1,2) : decimalMark

		format.numDigits = (decimalDigits || '').length
		format.thousandMark = thousandMark
		format.hasParens = (!!leftParen && (!!rightParen || !!rightParen2))
		format.space = space
		
		format.suffix = suffix
		format.abbreviated = abbr !== undefined

		if (prefix !== undefined && suffix === undefined) {
			format.type = format.hasParens ? format.abbreviated ? 'FINANCIAL' : 'ACCOUNTING' : 'CURRENCY';
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

const makeFormatString = function ({prefix, thousandMark, hasParens, space, numDigits, decimalMark, suffix, abbreviated}) {
	
	let str = `${prefix || ''}${space || ''}${hasParens ? '(' : ''}0${thousandMark ? (thousandMark + '0') : ''}${decimalMark || ''}${numDigits ? Array(numDigits + 1).join('0') : ''}${suffix || ''}${hasParens ? ')' : ''}${abbreviated ? 'a' : ''}`
	console.log(str)
	return str
}

export default {

	partName: "Number choice",

	partLabel: "Numeric format",

	getIcon: function (config) {
		var displayObj = displayStyles[config.numericFormatType]
		return ` icon ${displayObj ? displayObj.icon : "icon-icons2"}`;
	},

	element: class NumberConfig extends Component {
		constructor (props) {
			super(props)
			const config = props.config
			const formatAttr = parseFormatString(config.format)

			this._debounceUpdateFormat = _.debounce(this.updateFormat, 1000)
			
			this.state = Object.assign({
				formatString: config.formatString,
				formatAttr: formatAttr,
				custom: formatAttr.type === 'CUSTOM'
			}, formatAttr)
		}

		componentWillUnmount = () => {
			this.handleBlur()
		}

		handleFormatChange = (e) => {
			const value = e.target.value
			const attr = parseFormatString(value)
			this.setState({
				formatString: value,
				formatAttr: attr ? attr : this.state.formatAttr
			})
			
		}

		updateFormat = (formatString) => {
			const formatAttr = parseFormatString(formatString)
			this.setState({formatAttr: formatAttr})
		}

		handleBlur = () => {
			const {formatString, formatAttr} = this.state
			const prefix = formatAttr.prefix || ''
			const truncFormatString = formatString.slice(prefix.length)
			const patch = {
				formatString: truncFormatString,
				prefix: formatAttr.prefix
			}
			commitColumnConfig(
				this.props.view, 
				this.props.config.column_id, 
				patch)
		}

		handleChooseCustom = () => {
			this.setState({custom: true})
		}

		setFormat = (formatString) => {
			commitColumnConfig(
				this.props.view, 
				this.props.config.column_id, 
				{formatString: formatString})

			this.setState({
				formatString: format.formatString,
				formatAttr: parseFormatString(format.formatString)
			})
		}

		setFormatAttr = (attr, value) =>  {
			const config = this.props.config
			const format = config.displayStyle
			let formatAttr = update(this.state.formatAttr, {
				[attr]: {$set: value}
			})

			this.setState({
				formatString: makeFormatString(formatAttr),
				formatAttr: formatAttr
			})
		}

		choosePreset = (format, e) => {
			commitColumnConfig(
				this.props.view, 
				this.props.config.column_id, 
				{formatString: format.formatString})
			
			this.setState({
				formatString: format.formatString,
				custom: false
			})
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
						
						onClick = {_this.choosePreset.bind(_this, ds)}>

						<span className = 
						{`icon ${ds.icon} ${(formatAttr.type===k?'icon-hilite':'icon-selectable')}`}/>
						{ds.description}
						<span style={{marginLeft: "8px", color: constants.colors.GRAY_3}}>(e.g., {ds.example})</span>
					</div>
				})
				}

				<div key="format-header" className = "popdown-item  top-divider "
					onClick = {this.handleChooseCustom}>
					<span className = 
					{`icon icon-code ${this.state.custom?'icon-hilite':'icon-selectable'}`}/>
					Custom
				</div>
				
				{
				this.state.custom ?
				<div className = "popdown-item">
					<input
						type = "text"
						style = {{textAlign: 'center', width: '120px'}}
						className = "menu-input text-input flush" 
						value = {this.state.formatString}
						onBlur = {this.handleBlur}
						onChange = {_this.handleFormatChange}/> 
				</div>
				: null}
			</div>
		}


		getCustomMenu = () => {
			var _this = this
			var config = this.props.config
			var format = config.displayStyle
			var formatAttr = parseFormatString(config.formatString)

			
			return <div className = "popdown-section" key="custom">
				<li className="popdown-item title bottom-divider top-divider">
					Customize
				</li>
				<li className  = "popdown-item popdown-item-flush bottom-divider">
					<span className = "clicklabel" style={{minWidth: 150}}>
						Decimal places:
					</span>
					<span className = "clickbox icon icon-arrow-left"
						onClick={this.setFormatAttr.bind(this, 'numDigits', Math.max(formatAttr.numDigits - 1, 0))}/>
					<span className = "clickbox">
						{formatAttr.numDigits}
					</span>
					<span className = "clickbox icon icon-arrow-right"
						onClick={this.setFormatAttr.bind(this, 'numDigits', formatAttr.numDigits + 1)}/>
				</li>
				

				<li className  = "popdown-item popdown-item-flush bottom-divider">
					<span className = "clicklabel" style={{minWidth: 150}}>Thousand separator:</span> 
					<span className={"clickbox commabold "  + 
						(formatAttr.thousandMark === ',' ? " clickbox-active " : "")}
						onClick={this.setFormatAttr.bind(this, 'thousandMark', ',')}>
						,
					</span>
					<span className={"clickbox commabold "  + 
						(formatAttr.thousandMark === '.' ? " clickbox-active " : "")}
						onClick={this.setFormatAttr.bind(this, 'thousandMark', '.')}>
						.
					</span>
					<span className={"clickbox " + (!formatAttr.thousandMark ? " clickbox-active " : "")}
						onClick={this.setFormatAttr.bind(this, 'thousandMark', '')}>
						none
					</span>
				</li>

				<li className  = "popdown-item popdown-item-flush ">
					<span className = "clicklabel" style={{minWidth: 150}}>Decimal mark:</span>
					<span className={"clickbox commabold "  + 
						(formatAttr.decimalMark === ',' ? " clickbox-active " : "")}
						onClick={this.setFormatAttr.bind(this, 'decimalMark', ',')}>,</span>
					<span className={"clickbox commabold "  + 
						(formatAttr.decimalMark === '.' ? " clickbox-active " : "")}
						onClick={this.setFormatAttr.bind(this, 'decimalMark', '.')}>.</span>
				</li>
			</div>
		}

		render = () => {
			return <div className="column-context-menu" style={this.props.style}>
				{
				this.getPresetsMenu()
				}
				{
				// this.state.custom ?
				// this.getCustomMenu()
				// : null
				}
				<div className = "popdown-item selectable top-divider" onClick={this.props.blurSelf}>
					<span className="icon icon-arrow-left icon-detail-left"/>
					<span>Back</span>
				</div>
			</div>;
		}
	}
}
