import React, { Component, PropTypes } from 'react'
import _ from "underscore"
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

	componentWillMount = () => {
		this._debounceCalibrate = _.debounce(this.calibrate, 100)
		window.addEventListener('resize', this._debounceCalibrate)
	}

	componentDidMount = () => {
		this.calibrate()
	}

	componentDidReceiveProps = () => {
		this.calibrate()
	}

	componentWillUnmount = () => {
		window.removeEventListener('resize', this._debounceCalibrate)
	}

	calibrate = () => {
		console.log('mdlbar calibrate')
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
			<h1 className="branding" width="100" height="25" xmlns="http://www.w3.org/2000/svg">
				metasheet
				{/*<svg>
					<path d="M 5 5 h 10 l 10 10 l 10 -10 h 10 v 23 h -10 v -17 l -10 10 l -10 -10 v 17 h -10 Z" fill="gray"/>
					<path d="M 48 5 h 25 v 4 h -15 v9 h15 v3 h-15 v4 h15 v3 h-25 Z" fill="gray"/>
					<path d="M 76 5 h 24 v 4 h -7 v 19 h-10 v -19 h-7  Z" fill="gray"/>
					<path d="M 104 5 h 17 l 10 23 h-4 l -3 -7 h -8 v7 h -12 Z" fill="gray"/>

					<path d="M 140 5 h 25 v4 h-15 v4 h15 v15 h-25 v-3 h18 v-5 h-18 Z" fill="gray"/>
				</svg>*/}
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
				<div className="mdlbar-section"><span className="model-link">
					<span className="icon icon-exit"/><span>Back to my workspaces</span>
				</span></div>
				<div className="mdlbar-section"><span className="model-link">
						<span className="icon icon-glasses2"/><span>Focus (hide this sidebar)</span>
				</span></div>


				{models.map((mdl, idx) =>
				<ModelSection
					{...this.props}
					_calibrate = {this._debounceCalibrate}
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
