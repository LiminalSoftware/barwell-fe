import React from "react"
import { RouteHandler } from "react-router"
import styles from "./style.less"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import $ from 'jquery'
import fieldTypes from "../../fields"
import TabularTBody from "./TabularTBody"
import TabularTHead from "./TabularTHead"
import ViewUpdateMixin from '../../ViewUpdateMixin.jsx'
import TableMixin from '../../TableMixin.jsx'

var TabularPane = React.createClass ({

	mixins: [ViewUpdateMixin, TableMixin],

	componentDidMount: function () {
		$(document.body).on('keydown', this.onKey)
	},

	componentWillUnmount: function () {
		$(document.body).off('keydown', this.onKey)
	},
	
	getInitialState: function () {
		return {
			geometry: {
				headerHeight: 35,
				rowHeight: 22,
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
		return _.filter(
			this.state.columnList, 
			function(col) {return col.visible})
	},

	commitChanges: function () {
		var obj = this.state.editorObj
		var col = this.state.editorCol
		var val = this.state.editorVal
		obj.set(col.id, val)
		this.revert()
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var columns = this.getVisibleColumns()
		var sorting = this.state.sorting
		
		var inputter = <input
			ref = "inputter" 
			className = "input-editor" 
			type = "text" 
			value = {this.state.editorVal}
			onChange = {this.handleEditUpdate}
			onBlur = {this.commitChanges} />
		
		return <div className="view-body-wrapper" onScroll={this.onScroll} ref="wrapper">
				<table id="main-data-table" className="header data-table">
					<TabularTHead  
						key={"tabular-thead-" + view.view_id} 
						scrollTop={this.state.scrollTop}
						columns={columns}
						view={view} />
					<TabularTBody 
						ref="tabularbody" 
						key={"tbody-" + view.view_id}
						model={model}
						view={view}
						columns={columns}
						sorting={sorting}
						scrollTop={this.state.scrollTop}
						clicker={this.onClick}
						dblClicker={this.startEdit} />
				</table>
				<div 
					className={"pointer" + (this.state.focused ? " focused" : "")} 
					ref="anchor" 
					onDoubleClick={this.startEdit} 
					style={this.getPointerStyle()}>
					{this.state.editing ? inputter : ""}
				</div>
				<div 
					className={"selection" + (this.state.focused ? " focused" : "")} 
					ref="selection" 
					style={this.getSelectorStyle()}>
				</div>
		</div>
	}
})

export default TabularPane