import React, { Component, PropTypes } from 'react'
import ConfigItem from "../ConfigItem"
import ColumnMenu from "./ColumnMenu"

export default class ColumnConfig extends Component {
	getPreview = () => {
		const {view} = this.props
		return <span>Define view</span>
	}
	render () {
		return <ConfigItem {...this.props}
			menu={ColumnMenu}
			icon="icon-cog"
			title="Config"
			preview={this.getPreview()}
			hoverText="Configure column format"/>
	}
}