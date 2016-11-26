import React, { Component, PropTypes } from 'react'
import AttributeStore from "../../../stores/AttributeStore"
import ConfigItem from "../ConfigItem"
import SortMenu from "./SortMenu"

export default class FilterConfig extends Component {
	getPreview = () => {
		const {view} = this.props
		const sort = view.data.sorting
		return <span>
			Sorted by
			{sort.length > 1 ? ' multiple columns' : sort.map((s,idx)=><span className="view-config-dots">
				{" " + AttributeStore.get(s.attribute.slice(1)).attribute}
				{idx!==sort.length-1 ? "," : ""}
			</span>)}
		</span>
	}

	render () {
		const {view} = this.props
		const sort = view.data.sorting

		return <ConfigItem
			menu={SortMenu}
			isActive={sort && sort.length}
			icon="icon-tab"
			hoverText="Sort records"
			preview={this.getPreview()}
			title="Ordering"
			{...this.props}/>
	}
}