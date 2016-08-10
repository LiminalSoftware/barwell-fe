import React from "react"
import update from 'react/lib/update'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import constants from "../../../../constants/MetasheetConstants"
import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"
import constant from "../../../../constants/MetasheetConstants"

import fieldTypes from "../../../fields"
import ColumnUnhider from "./ColumnUnhider"

import util from "../../../../util/util"

var ColumnConfigContext = React.createClass ({

	getInitialState: function () {
		return {
			detailElement: null
		}
	},

	updateColumnConfig: function (patch) {
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
	},

	showDetail: function (element, e) {
		this.setState({detailElement: element})
	},	

	blurMode: function (e) {
		this.setState({detailElement: null})
	},

	sort: function (desc) {
		
		const spec = [{
			attribute_id: this.props.config.attribute_id, 
			descending: !!desc
		}]
		const view = this.props.view
		const updated = update(view, {
			data: {
				sorting: {$set: spec}
			}
		})
		modelActionCreators.createView(updated, true)
	},

	pin: function () {
		this.updateColumnConfig({fixed: true, visible: true})
		this.props.blurContextMenu()
	},

	unpin: function () {
		this.updateColumnConfig({fixed: false})
		this.props.blurContextMenu()
	},

	hideColumn: function () {
		this.updateColumnConfig({visible: false})
		this.props.blurContextMenu()
	},

	deleteColumn: function () {
		const config = this.props.config
		const attribute = AttributeStore.get(config.attribute_id)
		modelActionCreators.destroy('attribute', true, attribute)
	},
	
	renderMainMenu: function () {
		const view = this.props.view
		const config = this.props.config
		const type = fieldTypes[config.type]

		const _this = this
		const innerStyle = {
			top: 0, left: 0,
			width: "350px"
		}

		return <div className="context-menu slide-invert" style={innerStyle} key="main-menu">
			<div className="popdown-item title">
				Change view settings
			</div>
			<div onClick={this.hideColumn} className = "popdown-item selectable">
				<span className="icon icon-eye-crossed"/>
				Hide this column from view
			</div>
			<div onClick={this.showDetail.bind(_this, ColumnUnhider)} 
				className = "popdown-item selectable ">
				<span className="icon icon-eye"/>
				Show hidden columns
				<span className="icon icon-detail-right icon-arrow-right"/>
			</div>

			{
			config.fixed ? 
			<div onClick={this.unpin} className = "popdown-item selectable bottom-divider">
				<span className="icon icon-fingers-scroll-horizontal"/>
				Un-pin this column
			</div>
			:
			<div onClick={this.pin} className = "popdown-item selectable bottom-divider">
				<span className="icon icon-pushpin2"/>
				Pin this column
			</div>
			}

			<div onClick={this.sort.bind(_this, false)} className = "popdown-item selectable">
				<span className="icon icon-sort-amount-asc"/>
				Sort in ascending order
			</div>
			<div onClick={this.sort.bind(_this, true)} className = "popdown-item selectable bottom-divider">
				<span className="icon icon-sort-amount-desc"/>
				Sort in descending order
			</div>
			{/*==============================================================*/}

			

			{/*==============================================================*/}

			{(type.configParts || []).map((part, idx)=> 
			<div className = {`popdown-item selectable 
				${idx + 1 === type.configParts.length ? "bottom-divider" : ""}`}
				key={part.partLabel}
				onClick={this.showDetail.bind(_this, part.element)}>

				<span className={part.getIcon(config)}/>
				{part.partLabel}
				<span className="icon icon-detail-right icon-arrow-right"/>
			</div>
			)}

			{/*==============================================================*/}

			<div className="popdown-item title">
				Change attribute details
			</div>

			<div onClick={this.rename} className = "popdown-item selectable">
				<span className="icon icon-quote-open"/>
				Rename
			</div>

			<div onClick={this.changeType} className = "popdown-item selectable">
				<span className="icon icon-wrench"/>
				Change attribute type
				<span className="icon icon-detail-right icon-arrow-right"/>
			</div>
			<div onClick={this.makeUniq} className = "popdown-item selectable">
				<span className="icon icon-snow2"/>
				Make this attribute unique
			</div>
			<div onClick={this.setDefault} className = "popdown-item selectable">
				<span className="icon icon-stamp"/>
				Set default value for this attribute
				<span className="icon icon-detail-right icon-arrow-right"/>
			</div>
			<div onClick={this.deleteColumn} className = "popdown-item selectable">
				<span className="icon icon-trash2"/>
				Delete this attribute
			</div>
		</div>
	},

	render: function () {
		const view = this.props.view
		let style = Object.assign({}, 
			this.props._getRangeStyle(this.props.rc), {
				height: "0",
				marginLeft: "-1px",
				top: view.data.geometry.headerHeight + 'px',
				position: "absolute",
				minWidth: "350px",
				overflow: "visible",
				pointerEvents: "auto"
		})

		return <ReactCSSTransitionGroup
			{...constants.transitions.slideleft}
			style={style} onClick={util.clickTrap}>
			{this.state.detailElement ? 
				React.createElement(this.state.detailElement, 
					update(this.props, {$merge: {blurSelf: this.blurMode, blurMenu: this.blurMenu}}) )
				: this.renderMainMenu()
			}
		</ReactCSSTransitionGroup>
	}

})

export default ColumnConfigContext