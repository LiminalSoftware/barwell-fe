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
			{sort.map((s,idx)=><span className="header-item">
				{AttributeStore.get(s.attribute_id).attribute}
				{idx!==sort.length-1 ? "," : ""}
			</span>)}
		</span>
	}

	render () {
		return <ConfigItem
			menu={SortMenu}
			icon="icon-tab"
			hoverText="Sort records"
			preview={this.getPreview()}
			title="Ordering"
			{...this.props}/>
	}
}