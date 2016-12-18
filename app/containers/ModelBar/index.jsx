import React, { Component, PropTypes } from 'react'
import ReactDOM from "react-dom"
import { Link } from "react-router"

import styles from "./style.less"

import modelActionCreators from '../../actions/modelActionCreators'
import MetasheetDispatcher from '../../dispatcher/MetasheetDispatcher'

import ModelStore from "../../stores/ModelStore"
import ModelConfigStore from "../../stores/ModelConfigStore";
import ViewStore from "../../stores/ViewStore"
import FocusStore from "../../stores/FocusStore"

import MetasheetConst from '../../constants/MetasheetConstants'

import PureRenderMixin from 'react-addons-pure-render-mixin';
import blurOnClickMixin from '../../blurOnClickMixin'

import viewTypes from '../../Views/viewTypes'
import Notifier from '../Notifier'
import ModelContext from './ModelContext'
import ModelSection from './ModelSection'

import ScrollBar from "../../components/ScrollBar"

import util from '../../util/util'

export default class ModelBar extends Component {

	constructor (props) {
		super(props)
		this.state = {
			keyControl: false,
			editing: false,
			scrollOffset: 0
		}
	}
	

	componentDidMount = () => {
		this.calibrate()
	}

	componentDidReceiveProps = () => {
		this.calibrate()
	}

	calibrate = () => {
		const inner = ReactDOM.findDOMNode(this.refs.inner)
		const outer = ReactDOM.findDOMNode(this.refs.outer)

		this.setState({
			innerHeight: inner.clientHeight,
			outerHeight: outer.clientHeight
		})
	}

	setScrollOffset = (offset) => {
		this.setState({scrollOffset: offset})
	}


	// HANDLERS ===============================================================
	
	handleAddModel = (e) => {
		modelActionCreators.createNewModel(this.props.workspaceId)
		e.preventDefault();
	}
	
	
	focus = () => {
		modelActionCreators.setFocus('view-config');
	}

	handleMouseWheel = (e) => {
		this.refs.scroll.handleMouseWheel(e)
	}

	// RENDER =================================================================	

	render = () => {
		const workspaceId = this.props.params.workspaceId
		const models  = ModelStore.query({workspace_id: workspaceId}, 'model');
		const activeViews = this.props.activeViews
		const focus = FocusStore.getFocus()
		const focusedViewId = (/^v\d+/).test(focus) ? parseInt(focus.slice(1)) : null

		return <div className="mdlbar" onClick = {this.focus}>
			<h1 className="branding" width="100" height="30" xmlns="http://www.w3.org/2000/svg">
				<svg>
					<path d="M10 10 H 20 V 20 H 10 L 10 10"/>
				</svg>
			</h1>
			<div className="mdlbar-list" ref="outer" onWheel={this.handleMouseWheel}>
			<div ref="inner" style={{marginTop: -1 * this.state.scrollOffset}}>
				<ScrollBar
					totalDim = {this.state.innerHeight}
					visibleDim = {this.state.outerHeight}
					startOffset = {0}
					endOffset = {0}
					ref = "scroll"
					axis = "vertical"
					side = "left"
					_setScrollOffset = {this.setScrollOffset}/>

				{models.map((mdl, idx) => 
				<ModelSection
					{...this.props}
					index = {idx}
					activeViews = {this.props.activeViews}
					focusedViewId = {focusedViewId}
					key = {`model-link-${mdl.cid || mdl.model_id}`}
					model = {mdl}
					modelPath = {`/workspace/${workspaceId}/model/${mdl.model_id}`}/>
				)}
				<div className="mdlbar-adder" onClick = {this.handleAddModel}>
					<span  className="icon icon-plus"/>
					<span className="ellipsis">Add new dataset</span>
				</div>
			</div>
			</div>
			{/*<Notifier {...this.props}/>*/}
		</div>
	}

}