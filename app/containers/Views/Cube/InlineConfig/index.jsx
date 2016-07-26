import React from "react";
import { Link } from "react-router";
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
import ColumnMenu from '../../Tabular/InlineConfig/ColumnMenu'

import sections from './CubeColumnMenu/sections'

var CubeViewInlineConfig = React.createClass({

	mixins: [PureRenderMixin],

	_onChange: function () {
		var view = ViewStore.get(this.props.view.view_id || this.props.view.cid);
		this.setState(view.data);
	},

	getInitialState: function () {
		var view = this.props.view;
		return view.data;
	},

	focus: function () {
		modelActionCreators.setFocus('view-config');
	},

	blurSiblings: function () {
		this.refs.columnMenu.handleBlur();
	},

	getColumnAt: function (pos) {
		var view = this.props.view;
		var columns = view.data.columns;
		var pos = pos || {left: 0, top: 0};

		if (pos.left < 0)
			return columns['a' + view.row_aggregates[view.row_aggregates.length + pos.left]];
		else if (pos.top < 0)
			return columns['a' + view.column_aggregates[view.column_aggregates.length + pos.top]];
		else 
			return columns['a' + view.value];
	},

	render: function () {
		var childProps = {
			_blurSiblings: this.blurSiblings,
			_getColumnAt: this.getColumnAt
		};

    	return <div className = "view-config" onClick={this.focus}>

			<ColumnMenu {...this.props} {...childProps}
				confirmChanges = {false}
				sections = {sections} 
				ref = "columnMenu"/>
		</div>;
	}
});

export default CubeViewInlineConfig;
