import React, { Component, PropTypes } from 'react'
import util from '../../util/util'
import * as ui from '../../util/uiHelpers'

import Dropdown from "../../components/Dropdown"

class ModelContextMenu extends Component {

	constructor (props) {
		super(props)

		this.state = {open: false}
	}

	componentWillUpdate = ui.blurListeners.bind(this)

	handleOpenClick = () => {
		this.setState({open: true})
	}
	
	handleClickDelete = () => {
		this.setState({deleting: true})
	}

	handleConfirmDelete = (e) => {
		modelActionCreators.destroy('model', true, this.props.model)
	}

	handleCancelDelete = () => {
		this.setState({deleting: false})
	}

	handleRename = () => {
		this.props._parent.handleRename()
		this.handleBlur()
	}

	render = () => {
		const {model} = this.props

		return <div className = "popdown-menu popdown-sidebar " style={{maxWidth: 200, minWidth: 200}}>

			<div className="popdown-pointer-outer"/>
			<div className="popdown-pointer-inner"/>

			<div className = "popdown-item title">modify details...</div>

			<div className = "selectable popdown-item" onClick = {this.handleRename}>
				<span className="icon icon-pencil"/>
				Rename model
			</div>
			
			{this.state.deleting ?
			<div className = "selectable popdown-item">
				Delete this model?
			</div>
			:
			<div div className = "selectable popdown-item" 
				onClick = {this.handleClickDelete}>
				<span className="icon icon-trash2"/>	
				Delete model
			</div>
			}
			{this.state.deleting ?
				<div div className = "selectable popdown-item" 
					onClick={this.handleConfirmDelete}>Delete</div>
				: null
			}
			{this.state.deleting ?
				<div div className = "selectable popdown-item" 
					onClick={this.handleCancelDelete}>Nevermind</div>
				: null
			}
		</div>
	}
}


export default class ModelContext extends Component {
	render = () => {
		return <Dropdown 
			title="configure model"
			menu={ModelContextMenu} 
			icon="icon-ellipsis" {...this.props}/>
	}
}