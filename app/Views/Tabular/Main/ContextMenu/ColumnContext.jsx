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

	componentDidMount = () => {
		const detailDom = ReactDOM.findDOMNode(this.refs.detailElement)
		this.setState({height: detailDom.offsetHeight})
	}

	componentDidUpdate = (prevProps, prevState) => {
		if (prevState.detailElement !== this.state.detailElement) {
			const detailDom = ReactDOM.findDOMNode(this.refs.detailElement)
			this.setState({height: detailDom.offsetHeight})
		}
	}

	componentWillMount = () => {
		const {colHeader} = this.props
		colHeader.toggleMenuStyle(true)
	}

	componentWillUnmount = () => {
		const {colHeader} = this.props
		colHeader.toggleMenuStyle(false)
	}

	rename = () => {
		const {colHeader} = this.props
		colHeader.handleRename()
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

	deleteColumn = () => {
		const config = this.props.config
		const attribute = AttributeStore.get(config.attribute_id)
		modelActionCreators.destroy('attribute', true, attribute)
		this.props.blurContextMenu()
	}

	teardown = (commit) => {
		const el = this.refs.detailElement
		if (el && el.teardown) return el.teardown(commit)
	}

	insertRight = () => {
		const {view, config} = this.props
		this.setState({
			detailElement: ColumnAdder,
			insertOrder: config.order - 1 + 0.5
		})
	}
	
	insertleft = () => {
		const {view, config} = this.props
		this.setState({
			detailElement: ColumnAdder,
			insertOrder: config.order - 0.5
		})
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

		return <div key="main-menu " style={INNER_STYLE} ref="detailElement" id="detail-main">
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
			<div className = "popdown-item popdown-inline bottom-divider">
				<span style={{maxWidth: 40}}>Sort: </span>
				<span onClick={this.sort.bind(_this, false)} className="selectable left-divider">
					<span className={`icon icon-green 
						${currentSort === 'ascending' ? 'icon-hilite' : 'icon-selectable'} 
						icon-${type.sortIcon}asc`}/>
					<span>Ascending</span>
				</span>
				<span onClick={this.sort.bind(_this, true)} className="selectable left-divider">
					<span className={`icon icon-green 
						${currentSort === 'descending' ? 'icon-hilite' : 'icon-selectable'} 
						icon-${type.sortIcon}desc`}/>
					<span>Descending</span>
				</span>
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

			<div className = "popdown-item popdown-inline bottom-divider top-divider">
				<span>Add column: </span>
				<span className="selectable left-divider" onClick={this.insertLeft} >
					<span className={`icon icon-green icon-selectable icon-arrow-left`}/>
					<span>To left</span>
				</span>
				<span className="selectable left-divider" onClick={this.insertRight} >
					<span className={`icon icon-green icon-selectable icon-arrow-right`}/>
					<span>To right</span>
				</span>
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
				background: "white",
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

			<div className="popdown-pointer-outer" style={pointerStyle}/>
			<div className="popdown-pointer-inner" style={pointerStyle}/>


			<ReactCSSTransitionGroup
			style={{
				minHeight: this.state.height + 30, 
				maxHeight: this.state.height + 30
			}}
			className={"column-context-menu "}
			{...constants.transitions.slideleft}>

			<div className="popdown-item menu-title">
				Column options:
			</div>

			{this.state.detailElement ? 
				React.createElement(this.state.detailElement,
					update(this.props, {$merge: {
						ref: "detailElement",
						style: INNER_STYLE,
						viewContext: {order: this.state.insertOrder, view_id: view.view_id},
						blurSelf: this.blurMode, 
						blurMenu: this.blurMenu}}) )
				: this.renderMainMenu()
			}

			</ReactCSSTransitionGroup>

			

		</div>
	}

}