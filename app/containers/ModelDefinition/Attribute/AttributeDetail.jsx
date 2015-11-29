import React from "react"
import { Link } from "react-router"

import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"
import modelActionCreators from '../../../actions/modelActionCreators'
import constants from '../../../constants/MetasheetConstants'
import getIconClasses from '../getIconClasses'
import _ from 'underscore'
import util from '../../../util/util'

import ConfirmationMixin from '../ConfirmationMixin'
var sortable = require('react-sortable-mixin');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var AttributeDetail = React.createClass({

	mixins: [PureRenderMixin],

	getInitialState: function () {
		var attribute = this.props.attribute;
		return {
			renaming: false,
			attribute: attribute.attribute,
			type: attribute.type,
			default_value: this.props.default_value,
			open: false
		};
	},

	commitUpdate: function () {
		var attribute = this.props.attribute
		attribute.attribute = this.state.attribute
		attribute.type = this.state.type
		modelActionCreators.create('attribute', false, attribute)
	},

	handleNameUpdate: function (event) {
		this.setState({attribute: event.target.value})
	},

	handleTypeChange: function (event) {
		this.setState({type: event.target.value})
		this.commitUpdate()
	},

	handleDelete: function (event) {
		var attribute = this.props.attribute
		modelActionCreators.destroy('attribute', false, attribute)
		KeycompStore.query({attribute_id: attribute.attribute_id}).forEach(function (keycomp) {
			var key = KeyStore.get(keycomp.key_id)
			key._destroyerType = 'attribute'
			key._destroyerId = attribute.attribute_id
			modelActionCreators.destroy('key', false, key)
		})
		event.preventDefault()
	},

	render: function () {
		var _this = this;
		var col = this.props.attribute;
		var model = this.props.model;
		var keyOrd = this.props.keyOrd;
		var name = col.attribute;
		var keyIcons = [];
		var components = KeycompStore.query({attribute_id: col.attribute_id});
		var typeFieldChoices = Object.keys(constants.fieldTypes).filter(function (type) {
			return type !== 'PRIMARY_KEY'
		}).map(function (type) {
  			return <option value={type} key={type}>
  				{constants.fieldTypes[type]}
  			</option>;
		});

		components.forEach(function (comp, idx) {
			var key = KeyStore.get(comp.key_id)
			if (!key) return;
			var ord = keyOrd[key.key_id]
			keyIcons.push(<span
				key = {'keycomp-' + comp.keycomp_id}
				className={getIconClasses(ord, key)}
				title={key.key}>
				</span>
			);
		});

		if(keyIcons.length === 0) keyIcons.push(<span>-</span>)

		var key = "attribute-" + (col.attribute_id || col.cid);

		var actions = [];

		return <ReactCSSTransitionGroup key={key} transitionName="detail-row" component = "div"
				className={("detail-row ") + (col._dirty?'unsaved':'') + (col._destroy?'destroyed':'') +
				 (this.props.editing ? ' editing ' : null) + (this.state.new ? ' new' : null)}>
				{this.props.editing ?
					<span className="draggable" key="drag-cell">
						<span className="tighter icon icon-Layer_2 model-reorder"></span>
					</span>
					: null
				}
				<span  key={key + '-name'} title={col.attribute_id} className={"width-40 " + (this.props.editing ? " tight" : "")}>
					{this.props.editing ?
					<input ref="renamer"
						className="renamer header-renamer"
						value = {this.state.attribute}
						onChange = {this.handleNameUpdate}
						onBlur = {this.commitUpdate}
						/>
					: col.attribute
					}
				</span>
				{
					!col.attribute_id ?
					<span className="width-30 tight">
						<select name="type" value={col.type} onChange={this.handleTypeChange}>
							{typeFieldChoices}
						</select>
					</span>
					:
					<span className="width-30">
						{constants.fieldTypes[col.type]}
					</span>
				}
				<span  className="centered width-20 tight">
					{keyIcons}
				</span>
				<span className="width-10 grayed">
					{this.props.editing ? <span className="clickable icon icon-kub-trash"
						title="Delete attribute" onClick={this.handleDelete}>
						</span> : null}
				</span>

			</ReactCSSTransitionGroup>


	}
});

export default AttributeDetail
