import React from "react"
import { RouteHandler } from "react-router"
import bw from "barwell"
import styles from "./style.less"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"

var CalendarViewConfig = React.createClass({

	getInitialState: function () {
		return {};
	},

	render: function() {
		console.log('CalendarViewConfig')
		return <div className = "grouping">
			<div className = "detail-block">
			<h3>Format</h3>
			</div>
			<div className = "detail-block">
			<h3>Contents</h3>
			<table className="detail-table">
				<thead><tr key="attr-header-row">
					<th key="attr-header-expand"></th>
					<th key="attr-header-name">Name</th>
					<th key="attr-header-visibility">Viz</th>
					<th key="attr-header-width">Width</th>
				</tr></thead>
			</table>
			</div>
		</div>
	}
});

export default CalendarViewConfig;