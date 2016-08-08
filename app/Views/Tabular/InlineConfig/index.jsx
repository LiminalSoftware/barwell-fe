import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../fields"

import ViewStore from "../../../stores/ViewStore"
import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"

import modelActionCreators from "../../../actions/modelActionCreators"
import groomView from '../../groomView'

import PureRenderMixin from 'react-addons-pure-render-mixin';



import ColumnDropdownMenu from './ColumnMenu'
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
		this.refs.columnMenu.handleBlur()
		this.refs.sortMenu.handleBlur()
	},

	getColumnAt: function (viewconifg) {
		var view = this.props.view;
		var data = view.data;
		var pos = (viewconifg instanceof Object) ? (viewconifg.pointer || {}) : {};
		var left = pos.left || 0;
		return data._visibleCols[left];
	},

	render: function() {
		var childProps = {
			_getColumnAt: this.getColumnAt,
			_blurSiblings: this.blurSiblings,
		}

    	return <div className = "view-config" onClick={this.focus}>
    		<SortMenu {...this.props} {...childProps} ref="sortMenu"/>
			<FilterMenu {...this.props} {...childProps} ref="filterMenu"/>
			<ColumnDropdownMenu {...this.props} {...childProps} ref="columnMenu" sections = {sections}/>
		</div>
	}
});

export default TabularViewInlineConfig;
