import React, { Component, PropTypes } from 'react'
import update from 'react/lib/update';
import SortConfig from "./SortConfig"
import FilterConfig from "./FilterConfig"
import ColumnConfig from "./ColumnConfig"
import History from "./History"
import FocusStore from "../../../stores/FocusStore"

const viewConfigBarStyle = {
	right: "10px",
	bottom: "20px",
	position: "absolute",
	display: "flex",
	flexDirection: "row",
	zIndex: 100
}

export default class ViewConfigBar extends Component {

	static propTypes = {
		model: PropTypes.object,
		view: PropTypes.object
	}


	render () {
		const view = this.props.view
		const focus = this.props.focus
		
		return <div style={viewConfigBarStyle}>
			<History {...this.props} 
				focus={focus}
				idx={3}
				key="history" />

			<SortConfig {...this.props} 
				focus={focus} 
				key="sort" 
				idx={2}
				isActive={!!(view.data.sorting).length}/>

			<FilterConfig {...this.props} 
				focus={focus} 
				idx={1}
				key="filter"/>

			<ColumnConfig {...this.props} 
				focus={focus}
				idx={0}
				key="columns"/>
		</div>
	}
}
