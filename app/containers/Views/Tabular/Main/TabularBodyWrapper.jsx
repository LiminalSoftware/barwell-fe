import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import ModelStore from "../../../../stores/ModelStore"
import ViewStore from "../../../../stores/ViewStore"
import AttributeStore from "../../../../stores/AttributeStore"
import FocusStore from "../../../../stores/FocusStore"
import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'
import createTabularStore from './TabularStore.jsx'
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

import TabularTBody from "./TabularTBody"

var TabularBodyWrapper = React.createClass ({

	// shouldComponentUpdate: function (nextProps, nextState) {
	// 	return nextState.rowOffset !== this.state.rowOffset
	// },

	handleAddRecord: function (event) {
		this.props._addRecord()
		event.nativeEvent.stopPropagation()
		event.stopPropagation()
	},

	render: function () {
		var view = this.props.view
		var model = this.props.model
		var store = this.props.store
		var rows = store ? store.getObjects() : []
		var rowCount = store.getRecordCount()
		var geo = view.data.geometry
		var focused = this.props.focused

		var wrapperStyle = {
			marginTop: (-1* this.props.rowOffset * geo.rowHeight) + 'px',
			top: (geo.headerHeight + geo.topGutter) + 'px',
			bottom: 0,
			left: geo.leftGutter + 'px',
			width: (this.props.totalWidth + 10) + 'px',
			position: 'absolute',
		}

		var newRowBarStyle = {
			top: rowCount * geo.rowHeight + 'px',
			left: 0,
			height: (geo.rowHeight  + 'px'),
			width: (this.props.totalWidth - 1) + 'px'
		}

		return <div
			className = {"tabular-body-wrapper " + (focused ? "focused" : "blurred")}
			ref="tbodyWrapper"
			style={wrapperStyle}>
			<TabularTBody ref="tbody" {...this.props}/>
			{this.props.children}
			<div style = {newRowBarStyle}
				className = "table-cell add-new-row">
				<div className = "table-cell-inner"
					onMouseDown = {this.handleAddRecord}>
					+ Add a new row of data
				</div>
			</div>
		</div>;
	}
});


export default TabularBodyWrapper
