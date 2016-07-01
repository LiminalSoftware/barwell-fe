import React from "react";
import { Link } from "react-router";
import _ from 'underscore';
import fieldTypes from "../../fields"

import ViewStore from "../../../../stores/ViewStore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import groomView from '../../groomView'

import PureRenderMixin from 'react-addons-pure-render-mixin';
import ViewSelector from '../../../ViewSelector'
import ColumnMenu from '../../Tabular/InlineConfig/ColumnMenu'

import sections from './VennColumnMenu/sections'

var VennViewInlineConfig = React.createClass({

	mixins: [PureRenderMixin],

	_onChange: function () {
		this.forceUpdate()
	},

	focus: function () {
		modelActionCreators.setFocus('view-config');
	},

	blurSiblings: function () {
		this.refs.viewSelector.handleBlur();
		this.refs.columnMenu.handleBlur();
	},

	getColumnAt: function (pos) {
		var view = this.props.view;
		var columns = view.data.columns;
		return columns[0];
	},

	render: function () {
		var childProps = {
			view: this.props.view,
			model: this.props.model,
			viewconfig: this.props.viewconfig,
			_blurSiblings: this.blurSiblings,
			_getColumnAt: this.getColumnAt
		};

    	return <div className = "view-config" onClick={this.focus}>
			<ViewSelector {...childProps} ref = "viewSelector"/>
			<ColumnMenu {...childProps} 
				confirmChanges = {true}
				sections = {sections}
				ref = "columnMenu"/>
		</div>;
	}
});

export default VennViewInlineConfig;
