import React, { Component, PropTypes } from 'react';
import _ from "underscore"

import commitColumnConfig from "../commitColumnConfig"


import util from "../../../../util/util"

export default {
	
	partName: 'TextChoice',

	partLabel: 'Font style',

	getIcon: function (config) {
		return " icon " + (config.style === 'none' ? " icon-text-format " : ('icon-' + config.style))
	},

	element: class TextChoice extends Component {
		
		constructor (props) {
			super(props)
			this.state = {
				textConditionAttr: props.config.textConditionAttr,
				style: props.config.style || 'none',
				open: false,
				conditional: false
			}
		}

		choosetextConditionAttr (attributeId) {
			const patch = {textConditionAttr: attributeId}
			commitColumnConfig(
				this.props.view, 
				this.props.config.column_id, 
				patch, 
				true)
			this.setState(patch)
		}

		chooseStyle (style) {
			const patch = {style: style}
			commitColumnConfig(
				this.props.view, 
				this.props.config.column_id, 
				patch, 
				true)
			this.setState(patch)
		}

		renderFontStyleMenu () {
			var _this = this
			var view = this.props.view
			const style = _this.state.style

			return <div key="fontstyle">
				<li className = "popdown-item bottom-divider title " >
					Font Style
				</li>

				<li className = "popdown-item selectable "
				onClick = {_this.chooseStyle.bind(_this, 'bold')}>
					<span className = {`icon icon-bold ${style==='bold'?'icon-hilite':'icon-selectable'}`}/>
					Bold text
				</li>

				<li className = "popdown-item selectable "
				onClick = {_this.chooseStyle.bind(_this, 'italic')}>
					<span className = {`icon icon-italic ${style==='italic'?'icon-hilite':'icon-selectable'}`}/>
					Italic text
				</li>

				<li className = "popdown-item selectable "
				onClick = {_this.chooseStyle.bind(_this, 'none')}>
					<span className = {`icon icon-text-format ${style==='none'?'icon-hilite':'icon-selectable'}`}/>
					No font style
				</li>
			</div>
		}

		render () {
			return <div className = "context-menu" key="color">
				{this.renderFontStyleMenu()}
				<div className = "popdown-item selectable top-divider" onClick={this.props.blurSelf}>
					<span className="icon icon-arrow-left icon-detail-left"/>
					<span>Back</span>
				</div>
			</div>
		}

	}

}