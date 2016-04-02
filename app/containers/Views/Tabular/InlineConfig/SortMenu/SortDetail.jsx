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
import sortable from 'react-sortable-mixin';


var SortDetail = React.createClass({

	mixins: [sortable.ItemMixin],

	dragRef: "grabber",

	getInitialState: function () {
		var spec = this.props.sortSpec
		return {
			descending: spec.descending
		}
	},

	remove: function () {
		this.props._remove(this.props.sortSpec)
	},

	switch: function () {
		var spec = this.props.sortSpec
		spec.descending = !spec.descending
		this.props._updateItem(spec)
	},

	render: function() {
	    var view = this.props.view
	    var spec = this.props.sortSpec
		var attr = AttributeStore.get(spec.attribute_id)
		var fieldType = fieldTypes[attr.type];

	    return <div className="menu-item tight menu-sub-item">
			{this.props.editing ? <span
				ref = "grabber"
				className="draggable half-column-config tight icon grayed icon-menu"/> : null }
      		<span className = "ellipsis">{attr.attribute}</span>

			<span onClick={this.switch}
				className={"half-column-config tight icon icon-" + fieldType.sortIcon + (spec.descending ? 'desc' : 'asc')}>
			</span>
			<span onClick={this.remove} 
				className="half-column-config tight icon icon-cross-circle"></span>
		</div>
	}
});

export default SortDetail;
