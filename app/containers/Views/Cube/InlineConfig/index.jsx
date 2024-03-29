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

var CubeViewInlineConfig = React.createClass({

	mixins: [PureRenderMixin],

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

    return <div className = "view-config" onClick={this.focus}>
			<ViewSelector view = {view} model = {model}/>
		</div>
	}
});

export default CubeViewInlineConfig;
