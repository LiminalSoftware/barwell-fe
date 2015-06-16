import React from "react"
import $ from "jquery"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"

var CalendarTHead = React.createClass ({
	render: function () {
		var model = this.props.model
		var view = this.props.view
		var style = {top: (this.props.scrollTop || 0) + 'px'}
		
		return <thead id="calendar-view-header" ref="thead" style={style}>
			<tr>
				<th className="calendar-th">Sunday</th>
				<th className="calendar-th">Monday</th>
				<th className="calendar-th">Tuesday</th>
				<th className="calendar-th">Wednesday</th>
				<th className="calendar-th">Thursday</th>
				<th className="calendar-th">Friday</th>
				<th className="calendar-th">Saturday</th>
			</tr>
		</thead>
	}
})

export default CalendarTHead