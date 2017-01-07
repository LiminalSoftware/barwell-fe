// LIBS AND SUCH
import React, {Component} from "react"
import {pure} from "recompose"
import { Link } from "react-router"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

// STORES
import ViewStore from "../../stores/ViewStore"

// CONSTANTS
import viewTypes from '../../Views/viewTypes'

// COMPONENTS
import ViewContext from "./ViewContext"
import Renameable from "../../components/Renameable"

// ACTIONS
import modelActionCreators from "../../actions/modelActionCreators"

// UTIL
import util from "../../util/util"

class ViewLink extends Component {

	constructor (props) {
		super(props)
		var view = this.props.view
		this.state = {
			mouseover: false
		}
	}

	// HANDLERS ===============================================================


	handleDelete = (e) => {
		const {view} = this.props
		modelActionCreators.destroy("view", true, {view_id: view.view_id})
	}

	handleMouseOver = () => {
		this.setState({mouseover: true})
	}

	handleMouseOut = () => {
		this.setState({mouseover: false})
	}

	handleRename = (e) => {
		this.refs.renamer.handleEdit(e)
	}

	handleClick = (e) => {
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
			console.log('z')
			history.push(view.link)
		}

	}

	// RENDER =================================================================

	render = () => {
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
					<Renameable ref = "renamer" value={name} commit={renameView.bind(null, viewId)}/>
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
}

export default pure(ViewLink)
