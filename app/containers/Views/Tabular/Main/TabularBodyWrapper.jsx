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
	render: function () {
		var view = this.props.view
		var model = this.props.model
		var store = this.props.store
		var rows = store ? store.getObjects() : []
		var rowCount = store ? store.getRecordCount() : 0
		var geo = view.data.geometry

		var wrapperStyle = {
			top: (geo.headerHeight + geo.topGutter) + 'px',
			bottom: 0,
			left: geo.leftGutter + 'px',
			width: (this.props.totalWidth + 10) + 'px',
			position: 'absolute',
		}

		return <div className="tabular-tbody-wrapper"
			ref="tbodyWrapper"
			style={wrapperStyle}>
				<TabularTBody ref="tbody" {...this.props}/>
				{this.props.children}
			</div>;
	}
});


export default TabularBodyWrapper
