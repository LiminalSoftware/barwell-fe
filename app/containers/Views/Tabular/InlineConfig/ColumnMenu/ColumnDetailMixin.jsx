import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../../fields"
import $ from 'jquery'

import constants from '../../../../../constants/MetasheetConstants'
import AttributeStore from "../../../../../stores/AttributeStore";

import TypePicker from './TypePicker'

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"
import PureRenderMixin from 'react-addons-pure-render-mixin';
import sortable from 'react-sortable-mixin';
import util from '../../../../../util/util'

var ColumnDetailMixin = {

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		var config = this.props.config || {}
		return {
			open: false,
			yOffset: 0,
			dragging: false,
			rel: null,
			name: config.name,
			type: config.type
		}
	},

	// HANDLERS ===============================================================

	chooseType: function (type) {
		this.setState({
			type: type,
			open: false
		});
		var config = this.props.config
		var attr  = AttributeStore.get(config.attribute_id)
		attr.type = type;
		modelActionCreators.create('attribute', false, attr);
	},

	handleNameChange: function (e) {
		this.setState({name: e.target.value})
	},

	handleBlurName: function (e) {
		var config = this.props.config
		var attr  = AttributeStore.get(config.attribute_id);
		attr.attribute = this.refs.attributeNameInput.value
		modelActionCreators.create('attribute', false, attr);
	},

	handleDelete: function (e) {
		var config = this.props.config
		var attr  = AttributeStore.get(config.attribute_id)
		modelActionCreators.destroy('attribute', false, attr)
		e.preventDefault()
	},

	// UTILITY ================================================================

	commitViewChanges: function (colProps) {
		var view = this.props.view
		var column_id = this.props.config.column_id
		var col = view.data.columns[column_id]

		col = _.extend(col, colProps)
		view.data.columns[column_id] = col;
		modelActionCreators.createView(view, true, true)
	},

	blurSubMenus: function () {
		var _this = this;
		var config = this.props.config
		var fieldType = fieldTypes[config.type] || {}
		this.setState({configPart: null})
		if (fieldType.configParts) fieldType.configParts.forEach(function (el) {
			var part = _this.refs[el.prototype.partName]
			if (part) part.handleBlur();
			
		})
		if (this.refs.typePicker) this.refs.typePicker.handleBlur();
	},

	// RENDER ===================================================================

	render: function() {
		var _this = this;
	    var view = this.props.view;
	    var model = this.props.model;
	    var config = this.props.config;
		var fieldType = fieldTypes[config.type] || {};
		var editing = this.props.editing

	    return <div className={"menu-item" +
				(this.singleton ? " singleton " : " menu-item-stacked ")}>
				<div className = "menu-sub-item">
		      	<span className = "ellipsis">
					{
					this.props.open ? 
					<span ref = "grabber"
					      className="draggable icon grayed icon-menu"/>
					: null
					}

					{
					editing ?
					<input className = "menu-input text-input" 
						ref = "attributeNameInput"
						value={this.state.name}
						onBlur = {this.handleBlurName}
						onChange = {this.handleNameChange}/>
					: <span>{config.name}</span>
					}
				</span>
				
				{editing ? 
					<span>
						<TypePicker {...this.props} 
							ref = "typePicker"
							_chooseType = {_this.chooseType}
							type = {this.state.type}/>
					</span>
					:
					<span>
					{
						(fieldType.configParts || []) /* config parts associated with the field type*/
							.concat(this.props.viewConfigParts || []) /* config parts passed down from the view*/
							.map(function (part, idx) {
							return React.createElement(part, {
								_blurSiblings: _this.props._blurSiblings || _this.blurSubMenus,
								key: part.prototype.partName,
								ref: part.prototype.partName,
								spaceTop: _this.props.spaceTop,
								spaceBottom: _this.props.spaceBottom,
								_handleConfigClick: _this.handleConfigClick ? 
									_this.handleConfigClick.bind(_this, part)
									: null,
								view: view,
								model: model,
								config: config,
								classes: ""
							});
					})
					}
					</span>
				}
				{
					
				}
				{
				(editing && this.state.type !== 'PRIMARY_KEY') ?       
				<span  className = "icon icon-cross-circle" onClick = {this.handleDelete}/>
				: null
				}
				{
				editing ?       
				<span  className = "icon icon-cog"></span>
				: null
				}
				</div>
				{
					this.state.configPart ? 
					React.createElement(this.state.configPart, _.extend({menuInline: true}, _this.props))
					: 
					null
				}
			</div>
	}
}

export default ColumnDetailMixin;
