import React, { Component, PropTypes } from 'react'
import ConfigItem from "../ConfigItem"
import FilterMenu from "./FilterMenu"

export default class FilterConfig extends Component {
	render () {
		return <ConfigItem
			menu={FilterMenu}
			icon="icon-funnel"
			title="Filter"
			hoverText="Filter records"
			{...this.props}/>
	}
}