import React, { Component, PropTypes } from 'react'
import util from '../../util/util'
import * as ui from '../../util/uiHelpers'
import _ from "underscore"

import Dropdown from "../../components/Dropdown"

// CONSTANTS
import viewTypes from "../../Views/viewTypes"

// STORES
import ViewStore from "../../stores/ViewStore"

// ACTIONS
import modelActionCreators from "../../actions/modelActionCreators"

class AddViewMenu extends Component {

	constructor (props) {
		super(props)
	}

	createNewView = (type) => {
		const {model} = this.props
		const nameRoot = model.model + ' ' + type
		let iterator = 1
		let name = nameRoot

		while (ViewStore.query({model_id: model.model_id, view: name}).length > 0)
			name = `${nameRoot} ${iterator++}`

		modelActionCreators.createView({
			view: name,
			data: {},
			type: type,
			model_id: model.model_id || model.cid
		}, true)

		this.props.handleBlur()
	}

	render = () => {
		const {model} = this.props
		const _this = this

		return <div className = "popdown-menu popdown-sidebar  popdown-offset" 
			onMouseDown={util.clickTrap}>
			<div className="popdown-pointer-outer"/>
			<div className="popdown-pointer-inner"/>
			<div className="popdown-item title"> add new view of type...</div>
			{_.map(viewTypes, (type, typeKey) =>
        	<div className = "selectable popdown-item" key = {typeKey}
        		onClick = {_this.createNewView.bind(_this, typeKey)}>
            	<span className = {"icon " + type.icon}/>
            	<span className="sidebar-popdown-item-label">{type.type}</span>
            </div>
	        )}
		</div>
	}
}


export default class ViewAddContext extends Component {
	render = () => {
		return <Dropdown {...this.props} 
			title="add new view"
			menu={AddViewMenu} 
			icon="icon-eye-plus"/>
	}
}