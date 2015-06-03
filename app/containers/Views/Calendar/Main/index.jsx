import React from "react"
import { RouteHandler } from "react-router"
import bw from "barwell"
import styles from "./style.less"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"

var CalendarPane = React.createClass ({
	render: function () {
		console.log('CalendarPane')
		return <div className="no-view-content view-body-wrapper">
			<span className="icon icon-face-dead"></span>Nothing here
		</div>
	}
});

export default CalendarPane;