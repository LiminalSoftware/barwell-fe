import React, { Component, PropTypes } from 'react';
import update from 'react/lib/update'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import constants from "../../../../constants/MetasheetConstants"
import modelActionCreators from "../../../../actions/modelActionCreators"
import constant from "../../../../constants/MetasheetConstants"
import fieldTypes from "../../../fields"


import util from "../../../../util/util"

export default class ColumnUnhider extends Component {

	constructor (props) {
		super(props)

		this.state = {
			unhidden: {}
		}
	}

	toggle = (column) => {
		const unidden = update(this.state.unhidden, {
			[column.column_id]: {$apply: (v=>!v)}
		})
	}

	unhide = (column) => {
		const adjacent = this.props.config
		const view = this.props.view
		const updated = update(view, {
			data : {
				columns: {
					[column.column_id]: {
						$merge: {
							visible: true,
							order: (adjacent.order + 0.1)
						}
					}
				}
			}
		})
		modelActionCreators.createView(updated, true)
		this.props.blurContextMenu()
	}

	handleClick = (column, e) => {
		if (e.shiftKey) this.toggle(column)
		else this.unhide(column)
	}

	render () {
		const _this = this
		const view = this.props.view

		return <div className="column-context-menu" style={this.props.style}>
			<div className="popdown-item bottom-divider">
				<span className="title">Unhide columns </span> 
				<span> (shift to select multiple)</span>
			</div>

			{view.data._columnList
			.filter(col => !col.visible)
			.map(column =>
			<div className="popdown-item selectable" 
			key={column.column_id}
			onClick={this.handleClick.bind(_this, column)}>
				<span className="icon icon-eye"/>
				{column.name}
			</div>)}

			<div className="popdown-item top-divider selectable" onClick={this.props.blurSelf}>
				<span className="icon icon-arrow-left icon-detail-left"/>
				<span>Back</span>
			</div>
		</div>
	}

}