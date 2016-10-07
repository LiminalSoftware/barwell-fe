import React, { Component, PropTypes } from 'react';
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

	rename = () => {
		const colHeader = this.props.element.handleRename()
		this.props.blurContextMenu()
	}

	showDetail = (element, e) => {
		this.setState({detailElement: element})
	}	

	blurMode = (e) => {
		this.setState({detailElement: null})
	}

	sort = (desc) => {
		const view = this.props.view
		const updated = update(view, {
			data: {
				sorting: {$set: [{
					attribute: 'a' + this.props.config.attribute_id, 
					descending: !!desc
				}]}
			}
		})
		modelActionCreators.createView(updated, true)
		this.props.blurContextMenu()
	}

	pin = () => {
		this.updateColumnConfig({fixed: true, visible: true})
		this.props.blurContextMenu()
	}

	unpin = () => {
		this.updateColumnConfig({fixed: false})
		this.props.blurContextMenu()
	}

	hideColumn = () => {
		this.updateColumnConfig({visible: false})
		this.props.blurContextMenu()
	}

	function = () => {
		const config = this.props.config
		const attribute = AttributeStore.get(config.attribute_id)
		modelActionCreators.destroy('attribute', true, attribute)
		this.props.blurContextMenu()
	}

	teardown = (commit) => {
		const el = this.refs.detailElement
		if (el && el.teardown) return el.teardown(commit)
	}
	
	renderMainMenu = () => {
		const view = this.props.view
		const config = this.props.config
		const type = fieldTypes[config.type]
		const sorting = view.data.sorting
		const numVisibleCols = view.data._columnList.filter(col => !col.visible).length
		const currentSort = sorting.length !== 1 ? null :
			(sorting[0].attribute) !== ('a' +config.attribute_id) ?
			null : sorting[0].descending ? 'descending' : 'ascending'

		const _this = this
		
		const innerStyle = {
			top: 0, left: 0,
			width: "350px"
		}

		return <div className="column-context-menu slide-invert" style={innerStyle} key="main-menu">
			<div className="popdown-item title">
				Change view settings
			</div>
			<div onClick={this.hideColumn} className = "popdown-item selectable">
				<span className="icon icon-green icon-selectable  icon-eye-crossed"/>
				Hide this column from view
			</div>
			
			
			<div onClick={this.showDetail.bind(_this, ColumnUnhider)} 
				className = {`popdown-item ${numVisibleCols === 0 ? "un" : ""}selectable`}>
				<span className={`icon ${numVisibleCols===0?'icon-gray':'icon-green'} icon-selectable  icon-eye`}/>
				{numVisibleCols===0 ? "No hidden columns" : "Show hidden columns"}
				<span className="icon icon-detail-right icon-arrow-right"/>
			</div>

			{
			config.fixed ? 
			<div onClick={this.unpin} className = "popdown-item selectable bottom-divider">
				<span className="icon icon-green icon-selectable  icon-fingers-scroll-horizontal"/>
				Un-pin this column
			</div>
			:
			<div onClick={this.pin} className = "popdown-item selectable bottom-divider">
				<span className="icon icon-green icon-selectable  icon-pushpin2"/>
				Pin this column
			</div>
			}

			{type.sortable ?
			<div onClick={this.sort.bind(_this, false)} 
				className = {`popdown-item ${currentSort==='ascending'?'un':''}selectable`}>
				<span className={`icon icon-green icon-selectable  icon-${type.sortIcon}asc`}/>
				{currentSort==='ascending' ? "Sorted in ascending order" : "Sort in ascending order"}
			</div> 
			: null
			}
			{type.sortable ?
			<div onClick={this.sort.bind(_this, true)} 
			className = {`popdown-item bottom-divider ${currentSort==='descending'?'un':''}selectable`}>
				<span className={`icon icon-green icon-selectable  icon-${type.sortIcon}desc`}/>
				{currentSort==='descending' ? "Sorted in descending order" : "Sort in descending order"}
			</div>
			: null
			}
			{/*==============================================================*/}

			

			{/*==============================================================*/}

			{(type.configParts || []).map((part, idx)=> 
			<div className = {`popdown-item selectable 
				${idx + 1 === type.configParts.length ? "bottom-divider" : ""}`}
				key={part.partLabel}
				onClick={this.showDetail.bind(_this, part.element)}>

				<span className={part.getIcon(config) + " icon-green icon-selectable"}/>
				{part.partLabel}
				<span className="icon icon-detail-right icon-arrow-right"/>
			</div>
			)}

			{/*==============================================================*/}

			<div className="popdown-item title">
				Change attribute details
			</div>

			<div onClick={this.rename} className = "popdown-item selectable">
				<span className="icon icon-green icon-selectable icon-quote-open"/>
				Rename
			</div>

			<div onClick={this.changeType} className = "popdown-item selectable">
				<span className="icon icon-green icon-selectable icon-wrench"/>
				Change attribute type
				<span className="icon icon-detail-right icon-arrow-right"/>
			</div>
			<div onClick={this.makeUniq} className = "popdown-item selectable">
				<span className="icon icon-green icon-selectable icon-snow2"/>
				Make this attribute unique
			</div>
			<div onClick={this.showDetail.bind(_this, DefaultValueContext)}
				className = "popdown-item selectable">
				<span className="icon icon-green icon-selectable icon-stamp"/>
				Set default value for this attribute
				<span className="icon icon-detail-right icon-arrow-right"/>
			</div>
			<div onClick={this.deleteColumn} className = "popdown-item selectable">
				<span className="icon icon-green icon-selectable icon-trash2"/>
				Delete this attribute
			</div>
		</div>
	}

	render () {
		const {view, config} = this.props
		
		let style = Object.assign({}, 
			this.props._getRangeStyle(this.props.rc), {
				bottom: 0,
				top: view.data.geometry.headerHeight,
				position: "absolute",
				pointerEvents: "auto",
				overflow: "hidden"
		}, {
			marginLeft: -30,
			marginRight: -30,
			height: "100%",
		})

		const innerStyle = {
			top: 0, left: 30,
			width: "350px"
		}

		return <ReactCSSTransitionGroup
			key = {config.column_id}
			{...constants.transitions.slideleft}
			style={style} onClick={util.clickTrap}>
			{this.state.detailElement ? 
				React.createElement(this.state.detailElement,
					update(this.props, {$merge: {
						ref: "detailElement",
						style: innerStyle,
						blurSelf: this.blurMode, 
						blurMenu: this.blurMenu}}) )
				: this.renderMainMenu()
			}
			
			<HeaderCell {...this.props}
				key={config.column_id}
				ref={"head-" + config.column_id}
				column = {config}
				isOpen = {true}
				idx = {0}
				left = {15}
				top = {-1 * view.data.geometry.headerHeight}
				width = {config.width - 1}/>

		</ReactCSSTransitionGroup>
	}

}