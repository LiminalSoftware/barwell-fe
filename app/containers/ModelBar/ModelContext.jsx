import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import subHeader from "./subHeader.less"

import _ from "underscore"

import modelActionCreators from '../../actions/modelActionCreators'
import MetasheetDispatcher from '../../dispatcher/MetasheetDispatcher'

import ModelStore from "../../stores/ModelStore"
import ViewStore from "../../stores/ViewStore"
import MetasheetConst from '../../constants/MetasheetConstants'

import viewTypes from '../Views/viewTypes'
import Notifier from '../Notifier'
import util from '../../util/util'

var ModelContext = React.createClass ({

	getInitialState: function () {
		return {
			deleting: false
		}
	},
	
	handleClickDelete: function () {
		this.setState({deleting: true})
	},

	handleCancelDelete: function () {
		this.setState({deleting: false})
	},

	render: function() {
		
		var model = this.props.model

		return <ul className = "pop-up-menu" 
		onClick = {util.clickTrap}
		style = {{
			position: 'absolute',
			bottom: '100%',
			left: 0
		}}>	
			<span className = "pop-up-pointer-outer"/>
			<span className = "pop-up-pointer-inner"/>
			<div div className = "selectable popdown-item" onClick = {this.props._rename}>Rename model</div>
			
			{this.state.deleting ?
				<div className = "selectable popdown-item">Delete this model?</div>
				:
				<div div className = "selectable popdown-item" onClick = {this.handleClickDelete}>Delete model</div>
			}
			{this.state.deleting ?
				<div div className = "selectable popdown-item" onClick={this.props._delete}>Delete</div>
				: null
			}
			{this.state.deleting ?
				<div div className = "selectable popdown-item" onClick={this.handleCancelDelete}>cancel</div>
				: null
			}
		</ul>
	}
})

export default ModelContext
