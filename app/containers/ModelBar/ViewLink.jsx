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
		const {view, params} = this.props

		e.preventDefault()

		if (("which" in e && e.which === 3) || 
  		("button" in e && e.button === 2)) {
			// right click don't do anything!

  		} else if (e.shiftKey && !this.isActive()) {
			const newViewIds = this.props.params.viewId
				+ "," + (view.cid || view_id)

			this.props.history.push(`${this.getRootPath()}/view/${newViewIds}`)

		} else if (e.shiftKey && this.isActive()) {
			const newViewIds = this.props.activeViews
				.filter(v => v.view_id !== view.view_id)
				.map(v => '' + (v.cid || v.view_id))
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
		const {open} = this.state
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
			<span onDoubleClick = {this.handleRename} className="view-link-inner ellipsis ">
				
				{this.state.name}
			</span>

		return <Link to = {`${this.getRootPath()}/view/${view.view_id}`}
			onClick={this.handleClick}
			onContextMenu = {this.handleShowContext}
			className = {`view-link view-link--${isFocused ? 'focused' : active ? 'active' : ''}`}>

			<span className = {`icon ${viewTypes[view.type].icon}`} style={{color: 'blue'}}/>
			
			<span className="link-label ellipsis">
				{viewDisplay}
			</span>

			<span className="spacer"/>
		
			<ViewContext {...this.props} ref="context"
			style={{visibility: ((active || open) ? "visible" : "hidden")}}
			_parent = {this} direction = "left" visible = {this.state.mouseover}/>

			{active ?
			<span className={`icon icon-arrow-right view-link-arrow${isFocused ? '-selected' : ''}`}/>
			:null}

		</Link>
	}
})

export default ViewLink
