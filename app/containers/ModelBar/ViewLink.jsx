// LIBS AND SUCH
import React from "react"
import { Link, browserHistory } from "react-router"

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

// STORES
import ViewStore from "../../stores/ViewStore"

// CONSTANTS
import viewTypes from '../../Views/viewTypes'
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

	shouldComponentUpdate: function (nextProps, nextState) {
		return nextState !== this.state || 
			nextProps.activeViews !== this.props.activeViews ||
			nextProps.focusedViewId === this.props.view.view_id ||
			this.props.focusedViewId === this.props.view.view_id
	},

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

	handleMouseOver: function () {
		this.setState({mouseover: true})
	},

	handleMouseOut: function () {
		this.setState({mouseover: false})
	},

	handleClick: function (e) {
		const _this = this

		e.preventDefault()


		if (("which" in e && e.which === 3) || 
  		("button" in e && e.button === 2)) {
			// right click don't do anything!

  		} else if (e.shiftKey && !this.isActive()) {
			const newViewIds = this.props.params.viewId 
				+ "," + this.props.view.view_id
			this.props.history.push(`${this.getRootPath()}/view/${newViewIds}`)

		} else if (e.shiftKey && this.isActive()) {
			const newViewIds = this.props.activeViews
				.map(v=>v.view_id)
				.filter(id => id !== _this.props.view.view_id)
				.map(id => '' + id)
				.join(",")
				
			this.props.history.push(`${this.getRootPath()}/view/${newViewIds}`)
		} else {
			this.props.history.push(`${this.getRootPath()}/view/${this.props.view.view_id}`)
		}

	},

	getRootPath: function () {
		return `/workspace/${this.props.params.workspaceId}`
	},

	isActive: function () {
		return this.props.activeViews.map(v=>v.view_id).indexOf(this.props.view.view_id) >= 0
	},

	// RENDER =================================================================

	render: function () {
		const view = this.props.view
		const active = this.isActive()
		const isFocused = view.view_id === this.props.focusedViewId

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

		return <Link to = {`${this.getRootPath()}/view/${view.view_id}`}
			onClick={this.handleClick}
			onContextMenu = {this.handleShowContext}
			className = {`mdlbar-link ${isFocused ? 'mdlbar-link--focused' : 
				active ? 'mdlbar-link--active' : ''}`}>

			
			{viewDisplay}
			
			<ReactCSSTransitionGroup {...constants.transitions.inandout}
				component = "div"
				className = "view-link-actions"
				onMouseOver = {this.handleMouseOver}
				onMouseOut = {this.handleMouseOut}>

				{active ? 
				<span className="icon icon-arrow-right" 
					style={{paddingTop: "2px", position: "absolute", right: "0"}}/>
				:null}


				<ViewContext {...this.props} ref="context"
				style={{float: "right", marginRight: "30px"}}
				_parent = {this} direction = "left" visible = {this.state.mouseover}/>
			</ReactCSSTransitionGroup>

		</Link>
	}
})

export default ViewLink
