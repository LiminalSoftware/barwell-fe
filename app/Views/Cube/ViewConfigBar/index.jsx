import React, { Component, PropTypes } from 'react'
import update from 'react/lib/update';
import SortConfig from "../../ViewConfigBar/SortConfig"
import FilterConfig from "../../ViewConfigBar/FilterConfig"
import ColumnConfig from "../../ViewConfigBar/ColumnConfig"
import FocusStore from "../../../stores/FocusStore"

import sections from "./sections"

export default class ViewConfigBar extends Component {

	static propTypes = {
		model: PropTypes.object,
		view: PropTypes.object
	}

	render () {
		const view = this.props.view
		const focus = this.props.focus
		
		return <div className="view-config-bar">

			<ColumnConfig {...this.props} 
				sections={sections}
				focus={focus}
				idx={0}
				key="columns"/>

			<FilterConfig {...this.props} 
				focus={focus} 
				idx={1}
				key="filter"/>
				
		</div>
	}
}
