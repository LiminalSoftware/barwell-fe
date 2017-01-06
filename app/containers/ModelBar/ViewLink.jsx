// LIBS AND SUCH
import React from "react"
import {pure} from "recompose"
import { Link } from "react-router"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

// STORES
import ViewStore from "../../stores/ViewStore"

// CONSTANTS
import viewTypes from '../../Views/viewTypes'
import constants from '../../constants/MetasheetConstants'

// COMPONENTS
import ViewContext from "./ViewContext"
import Renameable from "../../components/Renameable"

// MIXINS
import blurOnClickMixin from "../../blurOnClickMixin"

// ACTIONS
import modelActionCreators from "../../actions/modelActionCreators"

// UTIL
import util from "../../util/util"

const ViewLink = React.createClass ({

	getInitialState: function () {
		var view = this.props.view
		return {
			editing: false,
			name: view.view,
			context: false
		}
	},

	// HANDLERS ===============================================================


	handleDelete: function (e) {
		const {view} = this.props
		modelActionCreators.destroy("view", true, {view_id: view.view_id})
	},

	handleMouseOver: function () {
		this.setState({mouseover: true})
	},

	handleMouseOut: function () {
		this.setState({mouseover: false})
	},

	handleClick: function (e) {
		const _this = this
		const {view, active, focused, history} = this.props

		e.preventDefault()

		if (("which" in e && e.which === 3) ||
  		("button" in e && e.button === 2)) {
			// right click don't do anything!

  	} else if (e.shiftKey && !active) {
			const newViewIds = view.view_id
			history.push(view.link)
		} else if (e.shiftKey && active) {
			const newViewIds = this.props.activeViews
				.filter(v => v.view_id !== view.view_id)
				.map(v => '' + (v.cid || v.view_id))
				.join(",")

			history.push(`/workspace/${view.workspaceId}/view/${newViewIds}`)
		} else {
			history.push(view.link)
		}

	},

	getRootPath: function () {
		return `/workspace/${this.props.params.workspaceId}`
	},

	// RENDER =================================================================

	render: function () {
		const {view, renameView,
			view: {active, focused, view_id: viewId, view: name}} = this.props

		// if (active || focused)
			// console.log(view)

		return <Link to = {view.link}
			onContextMenu = {this.handleShowContext}
			className = {`view-link view-link--${
				focused ? 'focused' :
				active ? 'active' :
				'inactive'}`}>

			<span className = {`icon ${viewTypes[view.type].icon}`} />
			<span className="ellipsis view-link-label"
				onClick={this.handleClick}>
					<Renameable value={name} commit={renameView.bind(null, viewId)}/>
			</span>

			<span className="spacer"/>

			<ViewContext {...this.props} ref="context"
				style={{visibility: (active ? "visible" : "hidden")}}
				_parent = {this} direction = "left" visible = {this.state.mouseover}/>

			{active ?
			<span className={`icon icon-arrow-right view-link-arrow${focused ? '-selected' : ''}`}/>
			:null}

		</Link>
	}
})

export default pure(ViewLink)
