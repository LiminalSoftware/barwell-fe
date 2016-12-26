import React, { Component, PropTypes } from 'react';
import ReactDOM from "react-dom"
import update from 'react/lib/update'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import constants from "../../../../constants/MetasheetConstants"
import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"
import constant from "../../../../constants/MetasheetConstants"

import fieldTypes from "../../../fields"
import ColumnUnhider from "./ColumnUnhider"
import DefaultValueContext from "./DefaultValueContext"

import HeaderCell from "../TableHeader/HeaderCell"

import util from "../../../../util/util"

import ColumnAdder from "../../../../components/ColumnAdder"

const INNER_STYLE = {
	position: "absolute",
	top: 30, left: 0,
	right: 0,
	height: 'auto',
	display: "flex",
	flexDirection: "column",
	overflow: "hidden"
}

export default class ColumnConfig extends Component {

	constructor (props) {
		super(props)
		this.state = {detailElement: null}
	}

	updateColumnConfig = (patch) => {
		const view = this.props.view
		const column = this.props.config
		
		modelActionCreators.createView(update(view, {
			data: {
				columns: {
					[column.column_id]: {
						$merge: patch
					}
				}
			}
		}), true)
	}

	renderMainMenu = () => {
		const view = this.props.view
		const config = this.props.config
		const type = fieldTypes[config.type]
		const _this = this

		return <div key="main-menu " style={INNER_STYLE} ref="detailElement" id="detail-main">
			<div onClick={this.hideColumn} className = "popdown-item selectable">
				<span className="icon icon-green icon-selectable  icon-sigma"/>
				Sum
			</div>
			<div onClick={this.hideColumn} className = "popdown-item selectable">
				<span className="icon icon-green icon-selectable  icon-sigma"/>
				Count
			</div>
			<div onClick={this.hideColumn} className = "popdown-item selectable">
				<span className="icon icon-green icon-selectable  icon-sigma"/>
				Count distinct
			</div>
			<div onClick={this.hideColumn} className = "popdown-item selectable">
				<span className="icon icon-green icon-selectable  icon-sigma"/>
				Count non-empty
			</div>
			<div onClick={this.hideColumn} className = "popdown-item selectable">
				<span className="icon icon-green icon-selectable  icon-sigma"/>
				Range
			</div>
			<div onClick={this.hideColumn} className = "popdown-item selectable">
				<span className="icon icon-green icon-selectable  icon-sigma"/>
				Maximum
			</div>
			<div onClick={this.hideColumn} className = "popdown-item selectable">
				<span className="icon icon-green icon-selectable  icon-sigma"/>
				Minimum
			</div>
		</div>
	}

	render () {
		const {view, config} = this.props
		const windowWidth = document.getElementById('application').clientWidth
		const viewLeft = document.getElementById(`view-${view.view_id}`).getBoundingClientRect().left
		let pointerStyle={}
		let style = Object.assign(
			{},
			this.props._getRangeStyle(this.props.rc), 
			{
				bottom: 0,
				top: view.data.geometry.headerHeight + 5,
				position: "absolute",
				pointerEvents: "auto",
				marginLeft: -1,
				height: "100%",
				dropShadow: "0 0 0 4px white"
			}
		)

		if (style.left + viewLeft > windowWidth - 410){
			style.marginLeft = -350 + config.width - 2
			pointerStyle.left = 350 - config.width + 10
		}
		
		return <div
			key = {config.column_id}
			style={style} onClick={util.clickTrap}>

			<div className="popup-pointer-outer" style={pointerStyle}/>
			<div className="popup-pointer-inner" style={pointerStyle}/>


		</div>
	}

}