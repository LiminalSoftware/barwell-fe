import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../fields"

import ViewStore from "../../../../stores/ViewStore"
import ModelStore from "../../../../stores/ModelStore"
import AttributeStore from "../../../../stores/AttributeStore"
import KeyStore from "../../../../stores/KeyStore"
import KeycompStore from "../../../../stores/KeycompStore"

import ColumnList from '../Config/ColumnList'
import ColumnDetail from '../Config/ColumnDetail'

import modelActionCreators from "../../../../actions/modelActionCreators"
import groomView from '../../groomView'

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var sortable = require('react-sortable-mixin');

import ViewSelector from '../../../ViewSelector'
import ColumnMenu from './ColumnMenu'

var TabularViewInlineConfig = React.createClass({

	mixins: [PureRenderMixin],

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange);
		ModelStore.addChangeListener(this._onChange)
		AttributeStore.addChangeListener(this._onChange)
		KeyStore.addChangeListener(this._onChange)
	},

	componentWillUnmount: function () {
		var view = this.props.view
		ViewStore.removeChangeListener(this._onChange)
		ModelStore.removeChangeListener(this._onChange)
		AttributeStore.removeChangeListener(this._onChange)
		KeyStore.removeChangeListener(this._onChange)
	},

	_onChange: function () {
		var view = ViewStore.get(this.props.view.view_id || this.props.view.cid)
		this.setState(view.data)
	},

	getInitialState: function () {
		var view = this.props.view
		return view.data
	},

	focus: function () {
		modelActionCreators.setFocus('view-config')
	},

	render: function() {
		var _this = this
		var view = this.props.view
		var model = this.props.model
		var data = this.state
		var columns = data.columns
    return <div className = "view-config">
			<ViewSelector view = {view} model = {model}/>
			<ColumnMenu columns = {columns}/>
		</div>
	}
});

export default TabularViewInlineConfig;
