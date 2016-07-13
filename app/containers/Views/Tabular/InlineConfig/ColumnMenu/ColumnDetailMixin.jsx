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

	render: function() {
		var _this = this;
	    var view = this.props.view;
	    var model = this.props.model;
	    var config = this.props.config;
		var fieldType = fieldTypes[config.type] || {};
		var editing = this.props.editing

	    return	<ReactCSSTransitionGroup
					transitionEnterTimeout={500}
					transitionLeaveTimeout={300}
					transitionName="slide-in"
					className={"menu-item" +
						(this.singleton ? " singleton " : " menu-item-stacked column-menu-item-width")}
					style = {{minWidth: this.props.minWidth, display: 'block'}}
					component = "div">

				<div className = {"menu-sub-item " + (this.props._isNew ? " new-menu-sub-item" : "")}>
				{
				this.props.open ? 
				<span ref = "grabber" className="draggable drag-grid"/>
				: null
				}

		      	<span className = {editing ? "" : "ellipsis"}>
					{
					editing ?
					<input className = "menu-input text-input" 
						ref = "attributeNameInput"
						value={this.state.name}
						onBlur = {this.handleBlurName}
						onChange = {this.handleNameChange}/>
					: <span className = {"type-icon icon icon-" + fieldType.icon}/>
					}
					{
					editing ? 
					null
					:
					<span>{config.name}</span>
					}
				</span>
				
				{editing ?
					<span>
						<TypePicker {...this.props}
							ref = "typePicker"
							_blurSiblings = {_this.props._blurSiblings}
							_handleConfigClick = {_this.handleConfigClick.bind(_this, TypePicker)}
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
				editing ?
				<span>
					<span  className = "pop-down clickable" style = {{float: 'right', width: '15px', minWidth: '15px'}}
					onClick = {_this.handleDelete}>
						<span className = "icon icon-cross-circle" style={{width: '15px', minWidth: '15px', textAlign: 'center', marginRight: 0}}/>
					</span>   
					<span  className = "pop-down clickable" style = {{float: 'right', width: '15px', minWidth: '15'}}
						onClick = {_this.handleConfigClick.bind(_this, AttributeConfig)}>
						<span className = "icon icon-cog"  style = {{textAlign: 'center', marginRight: 0}}/>
						{this.state.configPart === AttributeConfig ?
							<span className = "pop-down-overlay"><span className = "icon icon-cog" style = {{margin: 0}}/></span> 
							: null
						}
					</span>
				</span>
				: null
				}
				</div>
				{
					this.state.configPart ? 
					React.createElement(this.state.configPart, _.extend({menuInline: true, _chooseType: _this.chooseType}, _this.props, {type: _this.state.type}))
					: 
					null
				}
			</ReactCSSTransitionGroup>
	}
}

export default ColumnDetailMixin;
