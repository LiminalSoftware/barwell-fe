import React from "react"
import { RouteHandler } from "react-router"
import styles from "./style.less"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import $ from 'jquery'

import modelActionCreators from "../../../../actions/modelActionCreators.js"

import ModelStore from "../../../../stores/ModelStore"
import KeyStore from "../../../../stores/KeyStore"
import ViewStore from "../../../../stores/ViewStore"
import KeycompStore from "../../../../stores/KeycompStore"
import AttributeStore from "../../../../stores/AttributeStore"
import FocusStore from "../../../../stores/FocusStore"

import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

import fieldTypes from "../../fields"
import TabularTBody from "./TabularTBody"
import TabularTHead from "./TabularTHead"
import ViewUpdateMixin from '../../ViewUpdateMixin.jsx'
import TableMixin from '../../TableMixin.jsx'



var TabularPane = React.createClass ({

	mixins: [ViewUpdateMixin, TableMixin],

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange)
		AttributeStore.addChangeListener(this._onChange)
		ModelStore.addChangeListener(this._onChange)
		FocusStore.addChangeListener(this._onChange)
	},

	componentDidMount: function () {
		$(document.body).on('keydown', this.onKey)
	},

	componentWillUnmount: function () {
		$(document.body).off('keydown', this.onKey)
		ViewStore.removeChangeListener(this._onChange)
		AttributeStore.removeChangeListener(this._onChange)
		ModelStore.removeChangeListener(this._onChange)
		FocusStore.removeChangeListener(this._onChange)
	},
	
	getInitialState: function () {
		return {
			geometry: {
				headerHeight: 35,
				rowHeight: 24,
				topOffset: 12,
				widthPadding: 9
			},
			selection: {
				left: 0, 
				top: 0,
				right: 0,
				bottom: 0
			},
			pointer: {
				left: 0,
				top: 0
			},
			anchor: {
				left: 0, 
				top: 0
			},
			scrollTop: 0,
			focused: false,
			editing: false
		}
	},

	getVisibleColumns: function () {
		var view = this.props.view
		return _.filter(view.data.columnList, 'visible');
	},

	startEdit: function (e) {
		var ptr = this.state.pointer
		this.refs.tabularbody.editCell(ptr.top, ptr.left)
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var columns = this.getVisibleColumns()
		var sorting = this.state.sorting
		var focused = (FocusStore.getFocus() == 'view')
		
		return <div className="view-body-wrapper" onScroll={this.onScroll} ref="wrapper">
				<table id="main-data-table" className="header data-table">
					<TabularTHead  
						key = {"tabular-thead-" + view.view_id} 
						scrollTop = {this.state.scrollTop}
						columns = {columns}
						view = {view} />
					<TabularTBody 
						ref = "tabularbody" 
						key = {"tbody-" + view.view_id}
						model = {model}
						view = {view}
						columns = {columns}
						sorting = {sorting}
						scrollTop = {this.state.scrollTop}
						clicker = {this.onClick}
						dblClicker = {this.startEdit} />
				</table>
				<div 
					className={"pointer" + (focused ? " focused" : "")} 
					ref="anchor" 
					onDoubleClick={this.startEdit} 
					style={this.getPointerStyle()}>
				</div>
				<div 
					className={"selection" + (focused ? " focused" : "")} 
					ref="selection" 
					style={this.getSelectorStyle()}>
				</div>
		</div>
	}
})

export default TabularPane
