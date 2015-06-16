import React from "react"
import { RouteHandler } from "react-router"
import styles from "./style.less"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"

import ViewUpdateMixin from '../../ViewUpdateMixin.jsx'
import TableMixin from '../../TableMixin.jsx'

import CalendarTHead from './CalendarTHead.jsx'

var CalendarPane = React.createClass ({

	mixins: [ViewUpdateMixin, TableMixin],

	getInitialState: function () {
		return {
			geometry: {
				headerHeight: 35,
				rowHeight: 40,
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
		return [
			{
				id: "Sunday",
				width: "14.3%",
			}
		]
	},

	render: function () {
		var model = this.props.model
		var view = this.props.view
		var id = view.synget(bw.DEF.MODEL_ID)

		return <div className="view-body-wrapper" onScroll={this.onScroll} ref="wrapper">
				<table id="main-data-table" className="header data-table">
					<CalendarTHead  
						key={"calendar-thead-" + id}
						scrollTop={this.state.scrollTop}
						view={view} />	
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
});

export default CalendarPane;