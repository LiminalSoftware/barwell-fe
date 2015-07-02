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
import TabularTBody from "./TabularTBody"
import TabularTHead from "./TabularTHead"
import ViewUpdateMixin from '../../ViewUpdateMixin.jsx'




var TabularPane = React.createClass ({

	

	getInitialState: function () {
		return {
			sorting: null
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

	getVisibleColumns: function () {
		var view = this.props.view
		return _.filter(view.data.columnList, 'visible');
	},

	onScroll: function (event) {
		var wrapper = React.findDOMNode(this.refs.wrapper)
		this.setState({scrollTop: wrapper.scrollTop})
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var columns = this.getVisibleColumns()
		var focused = (FocusStore.getFocus() == 'view')
		
		return <div className="view-body-wrapper" onScroll={this.onScroll} ref="wrapper">
				<table id="main-data-table" className="header data-table">
					<TabularTHead  
						key = {"tabular-thead-" + view.view_id} 
						scrollTop = {this.state.scrollTop}
						columns = {columns}
						focused = {focused}
						view = {view} />
					<TabularTBody 
						ref = "tabularbody" 
						key = {"tbody-" + view.view_id}
						model = {model}
						view = {view}
						focused = {focused}
						columns = {columns}
						sorting = {view.data.sorting}
						scrollTop = {this.state.scrollTop}
						/>
				</table>
		</div>
	}
})

export default TabularPane
