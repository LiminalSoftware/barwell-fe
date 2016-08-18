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

// import ColumnDetail from "./ColumnDetail"


export default class ColumnMenu extends Component {

	constructor (props) {
		super(props)
		
	}

	render () {
		const _this = this
		const view = this.props.view
		const items = this.state.items

		return <div className="view-config-menu" 
			style={{right: -45 * this.props.idx - 15 + 'px'}} 
			onClick={util.clickTrap} onMouseDown={util.clickTrap}>
			<div className="menu-pointer-outer" style={{right: 45 * this.props.idx + 30 + 'px'}}/>
			<div className="menu-pointer-inner" style={{right: 45 * this.props.idx + 30 + 'px'}}/>
			
			
		</div>
	}
}