import React from "react";
import { Link } from "react-router";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../../fields";
import $ from 'jquery';

import constants from '../../../../../constants/MetasheetConstants';
import AttributeStore from "../../../../../stores/AttributeStore";

import TypePicker from './TypePicker';

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx";
import PureRenderMixin from 'react-addons-pure-render-mixin';
import sortable from 'react-sortable-mixin';
import util from '../../../../../util/util';

import AttributeConfig from './AttributeConfig';

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
		var attr  = _.clone(AttributeStore.get(config.attribute_id));
		attr.attribute = this.refs.attributeNameInput.value;
		attr._dirty = true;
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

	renderEditMode: function () {
		var _this = this;
	    var view = this.props.view;
	    var model = this.props.model;
	    var config = this.props.config;
		var fieldType = fieldTypes[config.type] || {};
		var configProps = {
			view: view,
			model: model,
			config: config,
			type: this.state.type,
			_chooseType: this.chooseType
		}

		return  <div className = "menu-sub-item">
			<span ref = "grabber" className="draggable drag-grid"/>
			<input className = "menu-input text-input" 
				ref = "attributeNameInput"
				value={this.state.name}
				onBlur = {this.handleBlurName}
				onChange = {this.handleNameChange}/>
			<span>
				<TypePicker
					ref = "typePicker"
					config = {config}
					_blurSiblings = {_this.props._blurSiblings}
					_showPopUp = {_this.props._showPopUp.bind(null, TypePicker, configProps)}
					_chooseType = {_this.chooseType}
					type = {this.state.type}/>
			</span>
			<span>
				<span  className = "pop-down clickable "
					onClick = {_this.handleDelete}>
					<span className = "icon icon-cross-circle"/>
				</span>
				
				{
					React.createElement(AttributeConfig, _.extend(
						{
							key: 'attributeConfig',
							ref: 'attributeConfig',
							model: this.props.model,
							config: config,
							_blurSiblings: _this.props._blurSiblings,
							_showPopUp: _this.props._showPopUp.bind(null, AttributeConfig, configProps)
						},
						configProps
					))
				}
				{
					config._isNew ? 
						<span className = "pop-down pop-down--greensolid">New</span>
						: null
				}
			</span>
			
		</div>
	},

	renderFormatMode: function () {
		var _this = this;
	    var view = this.props.view;
	    var model = this.props.model;
	    var config = this.props.config;
		var fieldType = fieldTypes[config.type] || {};
		var configProps = {
			view: view,
			model: model,
			config: config,
		}

		return <div className = "menu-sub-item">
			{this.props.open ? 
				<span ref = "grabber" className="draggable drag-grid"/> 
				: null
			}
			<span className = "ellipsis">
				<TypePicker
					ref = "typePicker"
					config = {config}
					_blurSiblings = {_this.props._blurSiblings}
					_showPopUp = {_this.props._showPopUp.bind(null, TypePicker, configProps)}
					_chooseType = {_this.chooseType}
					type = {this.state.type}/>
					
				{config.name}
				{
					(model || {}).label_attribute_id === (config || {}).attribute_id ?
						<span className = 'icon icon-tag' style = {{marginLeft: '8px'}}/> : null
				}
			</span>
			<span className = "ellipsis">
			{
				(fieldType.configParts || []) /* config parts associated with the field type*/
				.concat(this.props.viewConfigParts || []) /* config parts passed down from the view*/
				.map(function (part, idx) {
					
					var localProps = {
						key: part.prototype.partName,
						ref: part.prototype.partName,
						_blurSiblings: _this.props._blurSiblings || _this.blurSubMenus,
						_showPopUp: _this.props._showPopUp ? 
							_this.props._showPopUp.bind(null, part, configProps)
							: null
					}
					return React.createElement(part, _.extend(
						localProps,
						configProps
					));
				})
			}
			</span>
			{this.props.open ? 
			<span style={{flexDirection: 'row-reverse', maxWidth: '35px', marginRight: '10px'}}>
				{
					React.createElement(AttributeConfig, _.extend(
						{
							key: 'attributeConfig',
							ref: 'attributeConfig',
							_blurSiblings: _this.props._blurSiblings,
							_showPopUp: _this.props._showPopUp.bind(null, AttributeConfig, configProps)
						},
						configProps
					))
				}
			</span>
			: null}
		</div>
	},

	render: function() {
	    return	<div className="menu-item column-menu-item-width"
			style = {{minWidth: this.props.minWidth, display: 'block'}}>

			{this.props.editing ? 
				this.renderEditMode() 
				: this.renderFormatMode()
			}
		</div>
	}
}

export default ColumnDetailMixin;
