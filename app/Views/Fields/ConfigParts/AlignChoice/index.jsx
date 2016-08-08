import React, { Component, PropTypes } from 'react'
import update from 'react/lib/update'

import _ from "underscore";
import modelActionCreators from "../../../../actions/modelActionCreators";
import util from "../../../../util/util"

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

		align = (align) => {
			console.log('align: ' + align)
			const view = this.props.view
			const config = this.props.config

			const updated = update(view, {
				data : {
					columns: {
						[config.column_id]: {
							$set: {
								align: align
							}
						}
					}
				}
			})
			modelActionCreators.create("view", true, updated)
			this.props.blurSelf()
		}

		render () {
			const _this = this
			const config = this.props.config

			return <div className="context-menu">
				<div className = "popdown-item bottom-divider title">Text Alignment</div>
				{
					['left', 'center', 'right'].map(align =>
						<div key = {align}
						onClick = {_this.align.bind(_this, align)}
						className = {`popdown-item  selectable`}>

							<span className = {`icon icon-text-align-${align} 
								${align === config.align?'icon-hilite':'icon-selectable'}`}/>
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

