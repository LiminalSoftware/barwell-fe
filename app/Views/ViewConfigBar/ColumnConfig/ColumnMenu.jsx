import React, { Component, PropTypes } from 'react'
import update from 'react/lib/update'
import _ from "underscore"

import FlipMove from 'react-flip-move'

import constants from "../../../constants/MetasheetConstants"

import AttributeStore from "../../../stores/AttributeStore"

import fieldTypes from "../../fields"
import modelActionCreators from "../../../actions/modelActionCreators"
import util from "../../../util/util"

import ColumnDetail from "./ColumnDetail"
import ColumnConfigSection from "./ColumnConfigSection"

const getItemState = (props) => {
	const {view, sections} = props
	let sectionItems = {}
	sections.forEach(s => {
		sectionItems[s.section] = s.selector(view)
	})
	return {sectionItems};
}

export default class ColumnMenu extends Component {

	constructor (props) {
		super(props)
		this.state = getItemState(props)
		this.debounceMoveItem = _.debounce(this.moveItem, 50)
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

	render () {
		const _this = this 
		const {sectionItems} = this.state
		const {view, sections} = this.props

		return <div className="view-config-menu" 
			onClick={util.clickTrap} 
			onMouseDown={util.clickTrap}>
			
			<div  className="menu-item menu-sub-item menu-title">
				Column order and visiblity
			</div>

			{sections.map(s => <ColumnConfigSection 
				{...this.props}
				key={s.section}
				items={sectionItems[s.section]}
				section={s}/> 
			)}

		</div>
	}
}