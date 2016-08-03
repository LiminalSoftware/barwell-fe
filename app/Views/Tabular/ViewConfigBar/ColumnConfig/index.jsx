import React, { Component, PropTypes } from 'react'
import ConfigItem from "../ConfigItem"
import ColumnMenu from "./ColumnMenu"

export default class ColumnConfig extends Component {
	render () {
		return <ConfigItem
			menu={ColumnMenu}
			icon="icon-wrench"
			hoverText="Configure column format"
			{...this.props}/>
	}
}