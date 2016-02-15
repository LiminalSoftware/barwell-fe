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

		return <ul className = "pop-down-menu" 
		onClick = {util.clickTrap}
		style = {{
			position: 'absolute',
			top: '100%',
			left: 0
		}}>	
			<span className = "pop-down-pointer-outer"/>
			<span className = "pop-down-pointer-inner"/>
			<li onClick = {this.props._rename}>Rename model</li>
			
			{this.state.deleting ?
				<li>Delete this model?</li>
				:
				<li onClick = {this.handleClickDelete}>Delete model</li>
			}
			{this.state.deleting ?
				<li onClick={this.props._delete}>Delete</li>
				: null
			}
			{this.state.deleting ?
				<li onClick={this.handleCancelDelete}>cancel</li>
				: null
			}
		</ul>
	}
})

export default ModelContext
