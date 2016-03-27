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
import ViewSelector from '../../../ViewSelector'
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
		this.refs.viewSelector.handleBlur();
		this.refs.columnMenu.handleBlur();
	},

	render: function () {
		var childProps = {
			view: this.props.view,
			model: this.props.model,
			_blurSiblings: this.blurSiblings
		};

    	return <div className = "view-config" onClick={this.focus}>
			<ViewSelector {...childProps} ref = "viewSelector"/>
			<ColumnMenu {...childProps} sections = {sections} ref = "columnMenu"/>
		</div>;
	}
});

export default CubeViewInlineConfig;
