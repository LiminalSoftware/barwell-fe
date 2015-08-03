import React from "react"
import { RouteHandler } from "react-router"
import styles from "./style.less"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import $ from 'jquery'

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"

import ModelStore from "../../../../stores/ModelStore"
import KeyStore from "../../../../stores/KeyStore"
import ViewStore from "../../../../stores/ViewStore"
import KeycompStore from "../../../../stores/KeycompStore"
import AttributeStore from "../../../../stores/AttributeStore"
import FocusStore from "../../../../stores/FocusStore"

import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

import fieldTypes from "../../fields"
import CubeColTHead from "./CubeColTHead"
import CubeRowTHead from "./CubeRowTHead"
import OverflowHider from "./OverflowHider"

var CubePane = React.createClass ({

	getInitialState: function () {
		return {
			scrollTop: 0,
			scrollLeft: 0
		}
	},

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange)
		AttributeStore.addChangeListener(this._onChange)
		ModelStore.addChangeListener(this._onChange)
		FocusStore.addChangeListener(this._onChange)
	},

	componentWillUnmount: function () {
		ViewStore.removeChangeListener(this._onChange)
		AttributeStore.removeChangeListener(this._onChange)
		ModelStore.removeChangeListener(this._onChange)
		FocusStore.removeChangeListener(this._onChange)
	},

	_onChange: function () {
		this.forceUpdate()
	},

	onScroll: function (event) {
		var wrapper = React.findDOMNode(this.refs.wrapper)
		this.setState({
			scrollTop: wrapper.scrollTop, 
			scrollLeft: wrapper.scrollLeft
		})
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var focused = (FocusStore.getFocus() == 'view')
		
		return <div className="view-body-wrapper" onScroll={this.onScroll} ref="wrapper">
				<table id="main-data-table" className="header data-table">
					<CubeColTHead 
						key = {"cube-col-thead-" + view.view_id}
						config = {view.data}
						focused = {focused}
						dimension = 'column'
						scrollTop = {_this.state.scrollTop}
						view = {view} />
					<CubeRowTHead 
						key = {"cube-row-thead-" + view.view_id}
						config = {view.data}
						focused = {focused}
						dimension = 'row'
						scrollLeft = {_this.state.scrollLeft}
						view = {view} />
					<OverflowHider
						scrollLeft = {_this.state.scrollLeft}
						scrollTop = {_this.state.scrollTop}
						view = {view} />

				</table>
		</div>
	}
})

export default CubePane
