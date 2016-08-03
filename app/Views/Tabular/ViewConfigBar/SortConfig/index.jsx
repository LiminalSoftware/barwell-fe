import React, { Component, PropTypes } from 'react'
import ConfigItem from "../ConfigItem"
import SortMenu from "./SortMenu"

export default class FilterConfig extends Component {
	render () {
		return <ConfigItem
			menu={SortMenu}
			icon="icon-sort-alpha-asc"
			hoverText="Sort records"
			{...this.props}/>
	}
}