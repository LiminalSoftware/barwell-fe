import React, { Component, PropTypes } from 'react'
import update from 'react/lib/update';
import SortConfig from "./SortConfig"
import FilterConfig from "./FilterConfig"
import ColumnConfig from "./ColumnConfig"
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

	componentWillMount = () => {
		// FocusStore.addChangeListener(this.forceUpdate)
	}

	componentWillUnmount = () => {
		// FocusStore.removeChangeListener(this.forceUpdate)
	}

	render () {
		const view = this.props.view
		const focus = FocusStore.getFocus()
		
		return <div style={viewConfigBarStyle}>
			<SortConfig {...this.props} 
				focus={focus} 
				key="sort" 
				isActive={!!(view.data.sorting).length}/>

			<FilterConfig {...this.props} 
				focus={focus} 
				key="filter"/>

			<ColumnConfig {...this.props} 
				focus={focus} 
				key="columns"/>
		</div>
	}
}
