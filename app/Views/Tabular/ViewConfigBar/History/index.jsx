import React, { Component, PropTypes } from 'react'
import ConfigItem from "../ConfigItem"
import HistoryMenu from "./HistoryMenu"

export default class History extends Component {
	render () {
		return <ConfigItem
			menu={HistoryMenu}
			icon="icon-history2"
			hoverText="Change history"
			{...this.props}/>
	}
}