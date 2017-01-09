import React, { Component, PropTypes } from 'react'
import { RouteHandler, Link } from "react-router"
import ReactDOM from "react-dom"

import styles from "./style.less"
import detailStyles from "./detail.less"
import ModelStore from "../../stores/ModelStore"
import ViewStore from "../../stores/ViewStore"
import FocusStore from "../../stores/FocusStore"

import ViewConfigStore from "../../stores/ViewConfigStore"
import groomView from '../../Views/groomView'
import fieldTypes from "../../Views/fields"

import viewTypes from "../../Views/viewTypes"
import modelActionCreators from "../../actions/modelActionCreators"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import constants from "../../constants/MetasheetConstants"


export default class ViewPane extends Component {

	constructor (props) {
		super(props)
	}

	render () {
		const _this = this
		const {view, focus, style} = this.props
		const viewType = viewTypes[view.type]
		const configElement = viewType.configElement

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
		const configDetail = configElement ? React.createElement(configElement, childProps) : null

		return <div style={style} id={`view-${view.view_id}`}>
			<div className="model-pane-header">
				<span className={`icon icon--blue ${viewType.icon}`}/>
				<span>{view.view}</span>

				<span style={{maxWidth: 20, flex: 1, minWidth: 10}}/>
				{configDetail}
			</div>
			<div className="wrapper flush" style={{top: 31}}>
			{content}
			</div>
		</div>
	}
}