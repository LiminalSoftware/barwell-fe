import React, { Component, PropTypes } from 'react'
import {pure} from "recompose"
import _ from "underscore"
import ReactDOM from "react-dom"
import { Link } from "react-router"

import styles from "./style.less"

import modelActionCreators from '../../actions/modelActionCreators'
import MetasheetDispatcher from '../../dispatcher/MetasheetDispatcher'

import ModelStore from "../../stores/ModelStore"
import ViewStore from "../../stores/ViewStore"
import FocusStore from "../../stores/FocusStore"

import MetasheetConst from '../../constants/MetasheetConstants'

import viewTypes from '../../Views/viewTypes'
import Notifier from '../Notifier'
import ModelContext from './ModelContext'
import ModelSection from './ModelSection'

import ScrollBar from "../../components/ScrollBar"

import util from '../../util/util'

class ModelBar extends Component {

	constructor (props) {
		super(props)
		this.state = {
			keyControl: false,
			editing: false,
			scrollOffset: 0,
		}
	}

	componentWillMount = () => {
		this._debounceCalibrate = _.debounce(this.calibrate, 100)
		window.addEventListener('resize', this._debounceCalibrate)
	}

	componentDidMount = () => {
		this.calibrate()
	}

	componentDidUpdate = () => {
		// this.calibrate()
	}

	componentWillUnmount = () => {
		window.removeEventListener('resize', this._debounceCalibrate)
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
		const _this = this
    const {modelList, history, onExpandClick} = this.props
		const style = {minWidth: 300, maxWidth: 300}

		return <div className="mdlbar" onClick = {this.focus} style={style}>
			<h1 className="branding" style={{display: "flex"}}>
				<span>metasheet</span>
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

				<div className="special-link" onClick = {this.props._toggleSidebar}>
					<span className="icon icon-exit"/><span>Back to my workspaces</span>
				</div>
				<div className="special-link">
						<span className="icon icon-glasses2"/><span>Focus (hide this sidebar)</span>
				</div>

				{modelList.map((mdl, idx) => <ModelSection
					{..._this.props}
					calibrate = {_this._debounceCalibrate}
					key = {mdl.model_id}
					index = {idx}
					model = {mdl}/>
				)}
				<div className="mdlbar-adder" onClick = {this.handleAddModel}>
					<span  className="icon icon-plus"/>
					<span className="ellipsis">Add new dataset</span>
				</div>
			</div>
			</div>
		</div>
	}

}

export default pure(ModelBar)
