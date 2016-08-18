import React, { Component, PropTypes } from 'react'
import update from 'react/lib/update';
import SortConfig from "./SortConfig"
import FilterConfig from "./FilterConfig"
import ColumnConfig from "./ColumnConfig"
import History from "./History"
import FocusStore from "../../stores/FocusStore"


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
				focus={focus}
				idx={0}
				key="columns"/>

			<FilterConfig {...this.props} 
				focus={focus} 
				idx={1}
				key="filter"/>

			<SortConfig {...this.props} 
				focus={focus} 
				key="sort" 
				idx={2}
				isActive={!!(view.data.sorting).length}/>

			<History {...this.props} 
				focus={focus}
				idx={3}
				key="history" />
		</div>
	}
}
