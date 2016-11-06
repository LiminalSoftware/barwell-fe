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
		this.setState({configElement: el})
	}

	render () {
		const _this = this
		const {view, focus, style} = this.props
		// const {configElement} = this.state
		const viewType = viewTypes[view.type]
		const configElement = viewType.inlineConfigElement

		
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
			showConfigElement: this.showConfigElement,
			key: 'view-' + view.view_id
		}

		const content = React.createElement(viewType.mainElement, childProps)

		// const config = React.createElement(viewType.configElement, childProps)

		const configDetail = configElement ? React.createElement(configElement, childProps) : null

		return <div style={style} id={`view-${view.view_id}`}>
			<div className="model-pane-header">{view.view}</div>
			<div className="wrapper flush" style={{top: 30}}>
			{content}
			</div>
		</div>
	}
}