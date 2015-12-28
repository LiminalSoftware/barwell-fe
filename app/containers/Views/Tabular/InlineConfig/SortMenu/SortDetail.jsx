import React from "react";
import { Link } from "react-router";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import ViewStore from "../../../../../stores/ViewStore"
import ModelStore from "../../../../../stores/ModelStore"
import AttributeStore from "../../../../../stores/AttributeStore"
import KeyStore from "../../../../../stores/KeyStore"
import KeycompStore from "../../../../../stores/KeycompStore"

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var SortDetail = React.createClass({

	mixins: [PureRenderMixin],

	remove: function () {
		var view = this.props.view
		var config = this.props.config
		view.data.sorting = _.filter(view.data.sorting,
			sort => sort.attribute_id !== config.attribute_id)
		modelActionCreators.createView(view, true, false)
	},

	switch: function () {
		var view = this.props.view
		var config = this.props.config
		view.data.sorting = view.data.sorting.map(function (sort) {
			if (sort.attribute_id === config.attribute_id)
				sort.descending = !sort.descending
			return sort
		})
		modelActionCreators.createView(view, true, false)
	},

	render: function() {
    var view = this.props.view
    var config = this.props.config
		var attr = AttributeStore.get(config.attribute_id)
    return <div className="menu-item menu-sub-item">
      {attr.attribute}

			<span onClick={this.switch}
				className={"icon grayed left-pad icon-sort-az-" + (config.descending ? 'high' : 'low')}>
			</span>
			<span onClick={this.remove} className="icon small grayed icon-kub-remove"></span>
		</div>
	}
});

export default SortDetail;
