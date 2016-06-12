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

import modelActionCreators from "../../../../actions/modelActionCreators"
import groomView from '../../groomView'

import PureRenderMixin from 'react-addons-pure-render-mixin';


import ViewSelector from '../../../ViewSelector'
import ColumnMenu from './ColumnMenu/index'
import SortMenu from './SortMenu/index'
import FilterMenu from './FilterMenu'
import sections from './ColumnMenu/sections'

var TabularViewInlineConfig = React.createClass({

	mixins: [PureRenderMixin],

	_onChange: function () {
		
	},
	
	getInitialState: function () {
		var view = this.props.view
		return view.data
	},

	focus: function () {
		modelActionCreators.setFocus('view-config', this.props.focusLevel);
	},

	blurSiblings: function () {
		this.refs.viewSelector.handleBlur()
		this.refs.columnMenu.handleBlur()
		this.refs.sortMenu.handleBlur()
	},

	getColumnAt: function (viewconifg) {
		var view = this.props.view;
		var data = view.data;
		var pos = (viewconifg instanceof Object) ? (viewconifg.pointer || {}) : {};
		var left = pos.left || 0;
		return data.visibleCols[left];
	},

	render: function() {
		var _this = this
		var view = this.props.view
		var viewconfig = this.props.viewconfig
		var model = this.props.model

		var childProps = {
			view: this.props.view,
			viewconfig: this.props.viewconfig,
			model: this.props.model,
			_getColumnAt: this.getColumnAt,
			_blurSiblings: this.blurSiblings,
		}

    	return <div className = "view-config" onClick={this.focus}>
			<ViewSelector {...childProps} ref="viewSelector"/>
			<ColumnMenu {...childProps} ref="columnMenu" sections = {sections}/>
			<SortMenu {...childProps} ref="sortMenu"/>
			<FilterMenu {...childProps} ref="filterMenu"/>
		</div>
	}
});

export default TabularViewInlineConfig;
