import React, { Component, PropTypes } from 'react'
import { RouteHandler, Link } from "react-router"
import ReactDOM from "react-dom"

import styles from "./style.less"
import detailStyles from "./detail.less"
import ModelDefinition from "../ModelDefinition"
import ModelStore from "../../stores/ModelStore"
import ViewStore from "../../stores/ViewStore"
import FocusStore from "../../stores/FocusStore"

import ViewConfigStore from "../../stores/ViewConfigStore"
import ModelConfigStore from '../../stores/ModelConfigStore'
import groomView from '../../Views/groomView'
import fieldTypes from "../../Views/fields"

import ChangeHistory from '../../Views/ChangeHistory'

import viewTypes from "../../Views/viewTypes"
import modelActionCreators from "../../actions/modelActionCreators"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import constants from "../../constants/MetasheetConstants"


export default class ViewPane extends Component {

	constructor (props) {
		super(props)
		this.state = {
			configElement: null
		}
	}

	showConfigElement = (el) => {
		console.log('showConfigElement')
		this.setState({configElement: el})
	}

	render () {	
		const _this = this
		const {view, focus} = this.props
		const {configElement} = this.state

		const viewType = viewTypes[view.type]
		const model = ModelStore.get(view.model_id);
		const viewconfig = {}
		const viewStr = 'v' + view.view_id
		const isFocused = (viewStr === focus.split('-')[0])

		const childProps =  {
			model: model,
			view: view,
			focused: isFocused,
			focus: focus,
			viewconfig: viewconfig,
			showConfigElement: this.showConfigElement
		}

		const content = React.createElement(viewType.mainElement, childProps)

		const config = React.createElement(viewType.configElement, childProps)

		const configDetail = configElement ? React.createElement(configElement, childProps) : null

		return <div className="model-views" >
			
			<div className="model-pane-header" style={{position: "relative"}}>
				<span className="view-label">
					<span className={`icon ${viewType.icon}`} style={{marginTop: "1px"}}/>
					{view.view}
				</span>
				
				<span className="view-pane-rhs-cap">
					<span className="icon icon-cross" style={{marginLeft: "auto"}}/>
				</span>
			</div>

			{configDetail}

			<ReactCSSTransitionGroup
				ref="pane"
				key="model-panes"
				className="model-pane"
				{...constants.transitions.fadeinout}>

				{content}

			</ReactCSSTransitionGroup>

		</div>
	}
}