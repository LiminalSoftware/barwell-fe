import React, { Component, PropTypes } from 'react'
import util from '../../util/util'
import * as ui from '../../util/uiHelpers'

import Dropdown from "../../components/Dropdown"

// MIXINS
import blurOnClickMixin from "../../blurOnClickMixin"
import popdownClickmodMixin from '../../Views/Fields/popdownClickmodMixin'

class ViewContextMenu extends Component {

	constructor (props) {
		super(props)
		this.state = {open: false}
	}

	handleOpenClick = () => {
		this.setState({open: true})
	}
	
	handleClickDelete = () => {
		this.props._parent.handleDelete()
		this.handleBlur()
	}

	handleRename = () => {
		this.props._parent.handleRename()
		this.handleBlur()
	}


	render = () => {
		const model = this.props.model

		return <div className = "popdown-menu context-menu popdown-offset">

			<div className="popdown-pointer-outer"/>
			<div className="popdown-pointer-inner"/>
			
			<div div className = "selectable popdown-item" onClick = {this.handleRename}>
				<span className="icon icon-pencil"/>
				Rename view
			</div>
			<div div className = "selectable popdown-item" onClick = {this.handleClickDelete}>
				<span className="icon icon-trash2"/>	
				Delete view
			</div>
		</div>
	}
}

export default class ViewContext extends Component {
	render () {
		return <Dropdown 
			title="configure view"
			menu={ViewContextMenu} 
			icon="icon-ellipsis"/>
	}
}