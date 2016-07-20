import React from "react";
import { Link } from "react-router";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../../fields";
import $ from 'jquery';

import constants from '../../../../../constants/MetasheetConstants';
import ModelStore from "../../../../../stores/ModelStore";
import AttributeStore from "../../../../../stores/AttributeStore";
import KeycompStore from "../../../../../stores/KeycompStore";
import KeyStore from "../../../../../stores/KeyStore";

import TypePicker from './TypePicker';

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx";
import PureRenderMixin from 'react-addons-pure-render-mixin';
import sortable from 'react-sortable-mixin';
import util from '../../../../../util/util';

import Dropdown from '../../../../Dropdown/Dropdown'

import AttributeConfig from './AttributeConfig';

var ColumnDetailMixin = {

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		var config = this.props.config || {}
		var isNew = /^c\d+$/.test(config.attribute_id)
		return {
			renaming: isNew,
			name: config.name,
			type: config.type,
			isNew: isNew
		}
	},

	componentWillReceiveProps: function (next) {
		if (!this.state.renaming) this.setState({
			name: next.config.name,
			type: next.config.type
		})
	},

	componentWillUnmount: function () {
		if (this.props._clearPopUp) this.props._clearPopUp()
	},

	// HANDLERS ===============================================================

	chooseType: function (type) {
		var config = this.props.config
		var attr  = AttributeStore.get(config.attribute_id)

		this.setState({type: type})
		attr.type = type;
		modelActionCreators.create('attribute', false, attr);
	},

	handleRename: function () {
		this.setState({renaming: true})
	},

	handleNameChange: function (e) {
		this.setState({name: e.target.value})
		this.props._blurSiblings()
	},

	handleBlurName: function (e) {
		var config = this.props.config
		var attr  = _.clone(AttributeStore.get(config.attribute_id));
		attr.attribute = this.state.name;
		attr._dirty = true;
		this.setState({renaming: false})

		// if the menu is open, defer all changes until the menu is closed
		// otherwise, commit them right away
		modelActionCreators.create('attribute', this.props.singleton, attr);
	},

	handleDelete: function (e) {
		var config = this.props.config
		var attr  = AttributeStore.get(config.attribute_id)
		modelActionCreators.destroy('attribute', true, attr)
		this.props._blurSiblings()
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
		// if (this.refs.typePicker) this.refs.typePicker.handleBlur();
		// this.props._clearPopUp()
	},

	// RENDER ===================================================================

	renderDecorators: function () {
		var model = this.props.model;
	    var config = this.props.config;
		var decorators = []
		if (model.label_attribute_id === config.attribute_id) 
			decorators.push('tag')
		if (this.state.isNew)
			decorators.push('flare')
		return decorators.map(d => <span key = {d} className = {`icon icon-${d}`} style = {{marginLeft: '8px'}}/>)
	},

	renderFormatMode: function () {
		var _this = this;
	    var view = this.props.view;
	    var model = this.props.model;
	    var config = this.props.config;

	    var isRelation = !!config.relation_id

		var fieldType = fieldTypes[config.type] || {};
		var configProps = {
			view: view,
			model: model,
			config: config,
			_chooseType: this.chooseType,
			_rename: _this.handleRename,
			_handleDelete: _this.handleDelete,
			_blurSiblings: _this.props._blurSiblings,
			_showPopUp: _this.props._showPopUp,
			_clearPopUp: _this.props._clearPopUp,
			type: config.type
		}
		var keycomps = KeycompStore.query({attribute_id: config.attribute_id})
		var keyIds = _.indexBy(keycomps, 'key_id')
		var keys = KeyStore.query({}).filter(k => k.key_id in keyIds)

		var relatedModelChoices

		if (isRelation) {
			relatedModelChoices = ModelStore.query({}).map(function (model) {
				return {
					key: model.model_id,
					choice: model.model
				}
			})
		}
		

		

		return <div className = "menu-sub-item">
			{!this.props.singleton ? 
				<span ref = "grabber" className="draggable drag-grid"/> 
				: null
			}
			
			<span className = "ellipsis" style = {{maxWidth: '34px'}}>
				<TypePicker
					ref = "typePicker"
					{...this.props}
					{...configProps}/>
			</span>
			
			<span style = {{maxWidth: '150px', minWidth: '150px', position: 'relative'}}>
				{
					this.state.renaming ?
					<input className = "menu-input text-input"
						autoFocus
						onBlur = {_this.handleBlurName} 
						onChange = {_this.handleNameChange} 
						value = {this.state.name}/>
					: [
						<span onDoubleClick = {_this.handleRename}>
							{config.name}
						</span>,
						this.renderDecorators()
					]
				}
				
			</span>

			{config.relation_id ?
			<span>
				<span style = {{width: '30px', textAlign: 'center', position: 'relative', padding: 0, display: 'flex', flexDirection: 'column', margin: 0}}>
					<span style = {{textTransform: 'uppercase', fontSize: '10px', margin: '1px', lineHeight: '10px'}}>has one</span>
					<span style = {{margin: '1px', padding: 0, textAlign: 'center'}} className = "icon rotate-90 icon-arrows-merge"/>
				</span>
			</span> : null}

			
			<span className = "ellipsis">
			{
				(fieldType.configParts || []) /* config parts associated with the field type*/
				.concat(this.props.viewConfigParts || []) /* config parts passed down from the view*/
				.map(function (part, idx) {
					
					var localProps = {
						key: part.prototype.partName,
						ref: part.prototype.partName,
					}
					return React.createElement(part, _.extend(
						localProps,
						configProps
					));
				})
			}
			</span>
			{!this.props.singleton ? 
			<span style={{flexDirection: 'row-reverse', maxWidth: '35px', marginRight: '10px'}}>
				{
					fieldType.unchangeable ? null :
					<AttributeConfig {...this.props} {...configProps} key = "attributeConfig"/>
				}
			</span>
			: null}
		</div>
	},

	render: function() {
	    return	<div className={"menu-item " + (this.singleton ? "menu-item-singleton" : "")}>

			{this.props.editing ? 
				this.renderEditMode() 
				: this.renderFormatMode()
			}
		</div>
	}
}

export default ColumnDetailMixin;
