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

	getInitialState: function () {
		return {
			ascending: this.props.ascending
		}
	},

	remove: function () {
		this.props._remove(this.props.sortSpec)
	},

	switch: function () {
		var spec = this.props.sortSpec
		spec.ascending = !spec.ascending
		this.props._updateItem(spec)
	},

	render: function() {
	    var view = this.props.view
	    var spec = this.props.sortSpec
		var attr = AttributeStore.get(spec.attribute_id)

	    return <div className="menu-item tight menu-sub-item">
			{this.props.editing ? <span
				onMouseDown = {this.handleDrag}
				className="draggable half-column-config tight icon grayed icon-Layer_2"/> : null }
      		<span className = "ellipsis">{attr.attribute}</span>

			<span onClick={this.switch}
				className={"half-column-config tight icon grayed icon-sort-az-" + (spec.ascending ? 'high' : 'low')}>
			</span>
			<span onClick={this.remove} 
				className="half-column-config tight icon grayed icon-cr-remove"></span>
		</div>
	}
});

export default SortDetail;
