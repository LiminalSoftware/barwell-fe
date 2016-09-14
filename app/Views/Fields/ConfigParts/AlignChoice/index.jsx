import React, {Component, PropTypes } from 'react'

import commitColumnConfig from "../commitColumnConfig"

export default {
	
	partName: 'AlignChoice',

	partLabel: 'Text alignment',

	getIcon: function (config) {
		return `icon icon-text-align-${config.align}`;
	},

	element: class AlignConfig extends Component {
		constructor (props) {
			super(props)
			this.state = {
				align: props.config.align,
			}
		}

		handlePick = (align) => {
			commitColumnConfig(
				this.props.view, 
				this.props.config.column_id, 
				{align: align}, 
				true)
			this.props.blurSelf()
		}

		render () {
			const _this = this
			const config = this.props.config

			return <div className="column-context-menu" style={this.props.style}>
				<div className = "popdown-item bottom-divider title">Text Alignment</div>
				{
					['left', 'center', 'right'].map(align =>
						<div key = {align}
						onClick = {_this.handlePick.bind(_this, align)}
						className = {`popdown-item  selectable`}>

							<span className = {`icon icon-text-align-${align} ` + 
							`${align === config.align?'icon-hilite':'icon-selectable'}`}/>
							Align {align}
						</div>
					)
				}
				<div className = "popdown-item selectable top-divider" onClick={this.props.blurSelf}>
					<span className="icon icon-arrow-left icon-detail-left"/>
					<span>Back</span>
				</div>
			</div>
		}
	}
}

