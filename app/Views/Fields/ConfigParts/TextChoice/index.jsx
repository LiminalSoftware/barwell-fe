import React, { Component, PropTypes } from 'react';
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"

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
				style: props.config.style,
				open: false,
				conditional: false
			}
		}

		choosetextConditionAttr (attributeId) {
			this.commitChanges({textConditionAttr: attributeId})
		}

		chooseStyle (style) {
			commitChanges({style: style})
		}

		renderFontStyleMenu () {
			var _this = this
			var view = this.props.view

			return <div className = "popdown-section" key="fontstyle">
				<li className = "popdown-item bottom-divider title " >
					Font Style
				</li>

				<li className = {"popdown-item selectable " + (_this.state.style === 'bold' ? 'menu-selected' : '')}
				onClick = {_this.chooseStyle.bind(_this, 'bold')}>
					<span className = "icon icon-bold"/>
					Bold text
				</li>

				<li className = {"popdown-item selectable " + (_this.state.style === 'italic' ? 'menu-selected' : '')}
				onClick = {_this.chooseStyle.bind(_this, 'italic')}>
					<span className = "icon icon-italic"/>
					Italic text
				</li>

				<li className = {"popdown-item selectable " + (_this.state.style === 'none' ? ' menu-selected' : '')}
				onClick = {_this.chooseStyle.bind(_this, 'none')}>
					<span className = "icon icon-text-format"/>
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