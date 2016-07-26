// LIBS AND SUCH
import React from "react"
import { Link } from "react-router"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

// STORES
import ViewStore from "../../stores/ViewStore"

// CONSTANTS
import viewTypes from '../Views/viewTypes'
import constants from '../../constants/MetasheetConstants'

// COMPONENTS
import ViewContext from "./ViewContext"

// MIXINS
import blurOnClickMixin from "../../blurOnClickMixin"

// ACTIONS
import modelActionCreators from "../../actions/modelActionCreators"

// UTIL
import util from "../../util/util"

const ViewLink = React.createClass ({

	mixins: [blurOnClickMixin],

	getInitialState: function () {
		var view = this.props.view
		return {
			editing: false,
			name: view.view,
			context: false
		}
	},

	// HANDLERS ===============================================================

	handleShowContext: function (e) {
		if (e) e.preventDefault()
		this.refs.context.setState({open: true})

	},

	handleRename: function () {
		this.setState({editing: true})
	},

	handleNameUpdate: function (e) {
		this.setState({name: e.target.value})
	},

	handleDelete: function () {
		var view = this.props.view
		modelActionCreators.destroy("view", true, {view_id: view.view_id})
	},

	handleCommit: function () {
		var view = this.props.view
		this.setState({editing: false})
		if (view.view !== this.state.name) {
			view.view = this.state.name		
			modelActionCreators.create("view", true, view)
		}
	},

	handleClick: function (e) {
		if (("which" in e && e.which === 3) || 
  		("button" in e && e.button === 2)) {
  			this.handleShowContext()
  			e.preventDefault()
			util.clickTrap(e)
  		}
	},

	handleMouseOver: function () {
		this.setState({mouseover: true})
	},

	handleMouseOut: function () {
		this.setState({mouseover: false})
	},

	// RENDER =================================================================

	render: function () {
		const modelPath = this.props.modelPath
		const view = this.props.view
		const active = parseInt(this.props.params.viewId) === view.view_id

		const viewDisplay = this.state.editing ?
			<input 
				className="renamer header-renamer" 
				autoFocus
				ref="renamer" 
				value={this.state.name} 
				onChange={this.handleNameUpdate}
				onMouseDown = {util.clickTrap}
				onBlur={this.commitChanges} /> 
			:
			<span onDoubleClick = {this.handleRename} className="ellipsis view-link">
				<span className = {`icon ${viewTypes[view.type].icon}`}/>
				{this.state.name}
			</span>

		return <Link to = {`${modelPath}/view/${view.view_id}`}
			onContextMenu = {this.handleShowContext}
			className = {`mdlbar-link ${active ? 'mdlbar-link--active' : ''}`}>

			
			{viewDisplay}

			

			
			<ReactCSSTransitionGroup {...constants.transitions.inandout}
				component = "div"
				
				onMouseOver = {this.handleMouseOver}
				onMouseOut = {this.handleMouseOut}
				style = {{float: "right", position: "relative"}}>

				{active ? 
				<span className="icon icon-arrow-right" 
					style={{paddingTop: "2px", position: "absolute", right: "0"}}/>
				:null}


				<ViewContext {...this.props} ref="context"
				style={{float: "right", marginRight: "35px"}}
				_parent = {this} direction = "left" visible = {this.state.mouseover}/>
			</ReactCSSTransitionGroup>

		</Link>
	}
})

export default ViewLink
