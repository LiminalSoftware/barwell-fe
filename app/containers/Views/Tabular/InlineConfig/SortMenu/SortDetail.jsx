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
import PureRenderMixin from 'react-addons-pure-render-mixin';

var SortDetail = React.createClass({

	mixins: [PureRenderMixin],

	getInitialState: function () {
		return {
			ascending: true
		}
	},

	remove: function () {
		var view = this.props.view
		var config = this.props.config
		view.data.sorting = _.filter(view.data.sorting,
			sort => sort.attribute_id !== config.attribute_id)
		modelActionCreators.createView(view, true, false)
	},

	switch: function () {
		this.setState({ascending: !this.state.ascending})
	},

	render: function() {
    var view = this.props.view
    var config = this.props.config
	var attr = AttributeStore.get(config.attribute_id)

    return <div className="menu-item tight menu-sub-item">
			{this.props.editing ? <span
				onMouseDown = {this.handleDrag}
				className="draggable half-column-config tight icon grayed icon-Layer_2"/> : null }
      		<span className = "ellipsis">{attr.attribute}</span>

			<span onClick={this.switch}
				className={"half-column-config tight icon grayed icon-sort-az-" + (config.descending ? 'high' : 'low')}>
			</span>
			<span onClick={this.remove} className="half-column-config tight icon small grayed icon-kub-remove"></span>
		</div>
	}
});

export default SortDetail;
