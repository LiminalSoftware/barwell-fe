import React, { Component, PropTypes } from 'react';
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"
import util from "../../../../util/util"

import ColorPickerWidget from '../../../../components/ColorPickerWidget'
import commitColumnConfig from "../commitColumnConfig"

var palette = [
	'rgb(77,179,113)',
	'rgb(230,122,25)',
	'rgb(179,77,77)',
	 
	'rgb(186,224,133)',
	'rgb(240,233,117)',
	'rgb(255, 192, 184)',

	'rgb(121,160,211)',
	'rgb(205,200,200)'
];

export default {
	partName: "ColorChoice",

	partLabel: "Background color",

	getIcon: function (config) {
		const active = config.colorAttr || config.color
		return `icon icon-bucket ${active?"active":""}`;
	},

	element: class BackgroundConfig extends Component {
		
		constructor (props) {
			super(props)
			const config = props.config
			this.state = {
				colorAttr: config.colorAttr,
				colorConditionAttr: config.colorConditionAttr,
				colorConditional: !!config.colorConditionAttr,
				chooser: !!config.colorAttr ? 'colorAttr' : !!config.color ? 
						(_.contains(palette, config.color) ? 'palette' : 'custom') 
						: 'nocolor',
				color: config.color,
				adjustColor: !(this.props.config.adjustColor === false),
				open: false
			}
		}

		chooseColor = (attributeId) => {
			const patch = {
				colorAttr: attributeId,
				color: null,
				adjustColor: this.state.adjustColor
			}
			this.setState(patch)
			commitColumnConfig(
				this.props.view, 
				this.props.config.column_id, 
				patch)
		}

		chooseFixedColor = (color) => {
			this.commitChanges({color: color})
		}

		chooseCustom = () => {
			this.setState({chooser: 'custom'})
		}

		choosePalette = () => {
			this.setState({chooser: 'palette'})
		}

		chooseCondition = (attr) => {
			this.commitChanges({colorConditionAttr: attr})
		}

		chooseNone = () => {
			this.commitChanges({
				chooser: null, 
				color: null, 
				conditional: false, 
				colorAttr: null
			})
		}

		commitChanges = (patch) => {
			const {view, config} = this.props
			this.setState(patch)
			commitColumnConfig(view, config.column_id, patch)
		}

		handleAdjustCheck = () => {
			this.commitChanges({adjustColor: !this.state.adjustColor})
		}

		handleToggleConditional = () => {
			this.commitChanges({colorConditional: !this.state.colorConditional})
		}

		blurChildren = () => {
			const conditionDropdown = this.refs.conditionDropdown;
			if (conditionDropdown) conditionDropdown.handleBlur()
		}

		// RENDER ===================================================================

		renderConditional = () => {
			const _this = this
			const {view, model} = this.props
			var {colorConditional, colorConditionAttr} = this.state
			var boolAttrs = AttributeStore.query({type: 'BOOLEAN', model_id: view.model_id})

			return <div key="color-condition">
				<div className="popdown-item title top-divider">
					Conditional
				</div>
				<div key = "no-condition" className={"popdown-item selectable "}
					onClick = {_this.chooseCondition.bind(_this, null)}>
					<span className = {" icon icon-square  " + 
							(!colorConditionAttr ?"icon-hilite":"icon-selectable")}/>
					<span>No condition</span>
				</div>
				{
				boolAttrs.map(function (attr) {
					return <div key = {attr.attribute_id} className = "popdown-item selectable "
						onClick = {_this.chooseCondition.bind(_this, attr.attribute_id)}>
						<span className = {" icon icon-check-square  " + 
							(colorConditionAttr === attr.attribute_id ? "icon-hilite":"icon-selectable")}/>
						{attr.attribute}
					</div>
				})
				}
				
			</div>
		}

		renderColorSection = () => {
			var _this = this
			var {view} = this.props
			const {chooser} = this.state
			var colorAttrs = AttributeStore.query({type: 'COLOR', model_id: view.model_id})
			var customHeight = (this.state.chooser === 'custom' ? '80px' : '0');
			

			return <div key="color">

				<div key = "color-divider " 
					className = 'popdown-item title'>
					Cell color:
				</div>

				{
				colorAttrs.map(function (attr) {
					return <div key = {attr.attribute_id} className = {"popdown-item selectable "
						+ (_this.state.colorAttr === attr.attribute_id ? ' menu-selected' : '')}
						onClick = {_this.chooseColor.bind(_this, attr.attribute_id)}>
						<span className = {" icon icon-bucket  " +
							(_this.state.colorAttr === attr.attribute_id ?"icon-hilite":"icon-selectable")}/>
						{attr.attribute}
					</div>
				})
				}
				
				<div className = "popdown-item selectable"
					onClick = {_this.chooseNone}>
					<span className = {"icon icon-3d-glasses " + 
					(chooser === 'nocolor' ?"icon-hilite":"icon-selectable")}/>
					No cell color
				</div>

				<div className = "popdown-item selectable "
					onClick = {_this.choosePalette}>
					<span className = {"icon icon-color-sampler " + 
					(chooser === 'palette'?"icon-hilite":"icon-selectable")}/>
					Quick colors
				</div>

				{
					chooser === 'palette' ? 
					<div className = "popdown-item menu-row"> {
						palette.map(function (color) {
							console.log(color)
							return <span className = "menu-choice" key = {color} style = {{background: color}}
							onMouseDown = {_this.chooseFixedColor.bind(_this, color)}>
								{
									(color === _this.state.color) ? 
									<span className = "icon icon-check icon--small" 
									style = {{color: 'white', textAlign: 'right', lineHeight: '25px'}} /> : null
								}
							</span>;
						})
					} </div>
					: null
				}

				<div className = "popdown-item selectable "
					onClick = {_this.chooseCustom}>
					<span className = {"icon icon-code " + 
					(chooser === 'custom'?"icon-hilite":"icon-selectable")}/>
					Custom color
				</div>
				
				
				{
				this.state.chooser === 'custom' ?	
				<ColorPickerWidget  color = {this.state.color} height = {customHeight} 
					_chooseColor = {this.chooseFixedColor}/>
				: null
				}



				{
				this.state.colorAttr ?
				<div className = "popdown-item top-divider">
				Auto-lighten colors: <input type="checkbox"
					onChange = {_this.handleAdjustCheck}
					checked = {_this.state.adjustColor} />
				</div>
				: null
				}
				

			</div>
		}

		render () {
			return <div style={this.props.style}>
				<div className = "popdown-filler">
				{this.renderColorSection()}
				{this.renderConditional()}
				</div>
				<div className = "popdown-item selectable top-divider" onClick={this.props.blurSelf}>
					<span className="icon icon-arrow-left icon-detail-left"/>
					<span>Back</span>
				</div>
			</div>
		}

	}
}
