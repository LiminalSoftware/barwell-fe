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
import ModelContext from "./ModelContext"

const ViewLink = React.createClass ({

	getInitialState: function () {
		return {
			renaming: false,
			context: false
		}
	},

	render: function () {
		const modelPath = this.props.modelPath
		const view = this.props.view
		const active = parseInt(this.props.params.viewId) === view.view_id

		return <Link to = {`${modelPath}/view/${view.view_id}`}
			className = {`mdlbar-link ${active ? 'mdlbar-link--active' : ''}`}>
			<span className = {`icon ${viewTypes[view.type].icon}`}/>
			{view.view}
			
			<ReactCSSTransitionGroup {...constants.transitions.inandout}
				component = "div"
				style = {{float: "right", position: "relative"}}>

				{active ? 
				<span className="icon icon-arrow-right" 
					style={{paddingTop: "2px", position: "absolute", right: "0"}}/>
				:null}
			</ReactCSSTransitionGroup>
		</Link>
	}
})

export default ViewLink
