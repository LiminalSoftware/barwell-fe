import React, { Component, PropTypes } from 'react'
import update from 'react/lib/update'
import _ from "underscore"

import FlipMove from 'react-flip-move'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import constants from "../../../constants/MetasheetConstants"

import AttributeStore from "../../../stores/AttributeStore"

import fieldTypes from "../../fields"
import modelActionCreators from "../../../actions/modelActionCreators"
import util from "../../../util/util"

import ColumnDetail from "./ColumnDetail"


export default class ColumnConfigSection extends Component {

	constructor (props) {
		const {section, view} = props
		super(props)
	}

	moveItem = (dragIndex, hoverIndex) => {
		const { items } = this.state
    	const dragItem = items[dragIndex]

		this.setState(update(this.state, {
			items: {
				$splice: [
					[dragIndex, 1],
					[hoverIndex, 0, dragItem]
				]
			}
		}))
	}

	toggleVisibility = (item) => {

	}

	render () {
		const _this = this
		const {view, section, items} = this.props

		return <div>
			<div className="menu-item menu-sub-item menu-section-divider">
				<span className="divider-label">{section.label}</span>
			</div>
			{items.map(item=>
			<ColumnDetail item={item} key={item.column_id}/>
			)}
		</div>
	}
}