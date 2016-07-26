import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../../fields"
import $ from 'jquery'

import constants from '../../../../../constants/MetasheetConstants'

import TypePicker from './TypePicker'

import AttributeStore from "../../../../../stores/AttributeStore"

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"
import util from '../../../../../util/util'
import PureRenderMixin from 'react-addons-pure-render-mixin';

import sortable from 'react-sortable-mixin';
import blurOnClickMixin from '../../../../../blurOnClickMixin'
import Dropdown from '../../../../Dropdown'

import AttributeConfig from './AttributeConfig';

const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789"


var ColumnDetailListable = React.createClass({

	mixins: [sortable.ItemMixin, blurOnClickMixin],

	dragRef: "grabber",

	singleton: false,

	minWidth: '500px',
	
	handleConfigClick: function (part, e) {
		this.props._showPopUp(part)
		util.clickTrap(e)
	},

		// LIFECYCLE ==============================================================

	getInitialState: function () {
		var config = this.props.config || {}
		var isNew = /^c\d+$/.test(config.attribute_id)

		return {
			editing: false,
			name: config.name,
			type: config.type,
			isNew: isNew,
			showReference: false
		}
	},

	componentWillReceiveProps: function (nextProps) {
		this.setState({
			name: this.state.editing ? 
				this.state.name : 
				nextProps.config.name,
			type: nextProps.type
		})
	},

	componentWillMount: function () {
		this._debounceHandleMouseOver = _.debounce(this.handleMouseOver, 1000)
	},

	componentWillUnmount: function () {
		
	},

	// HANDLERS ===============================================================

	chooseType: function (type) {
		var config = this.props.config
		var attr  = AttributeStore.get(config.attribute_id)
		
		attr.type = type;
		modelActionCreators.create('attribute', false, attr);
		this.setState({type: type})
	},

	handleRename: function () {
		this.setState({editing: true})
	},

	handleNameChange: function (e) {
		this.setState({name: e.target.value})
		this.props._blurSiblings()
	},

	handleCommit: function (e) {
		var config = this.props.config
		
		

		if (config.relation) {
			var rel  = RelationStore.get(config.relation_id);
			rel.relation = this.state.name
			modelActionCreators.create('relation', true, attr);
		} 
		else {
			var attr  = AttributeStore.get(config.attribute_id);
			attr.attribute = this.state.name
			modelActionCreators.create('attribute', true, attr);	
		}
		this.setState({editing: false})
	},

	handleDelete: function (e) {
		var config = this.props.config
		var attr  = AttributeStore.get(config.attribute_id)
		modelActionCreators.destroy('attribute', true, attr)
		this.props._blurSiblings()
		e.preventDefault()
	},

	handleMouseOver: function (idx, e) {
		const view = this.props.view
		const id = view.cid || view.view_id
		this.setState({showReference: true})
		
		modelActionCreators.create('viewconfig', false, {
			view_id: id, 
			hoverAttributeIndex: this.props.trueIndex
		});
	},

	handleMouseOut: function (e) {
		const view = this.props.view
		const id = view.cid || view.view_id
		this.setState({showReference: false})
		
		modelActionCreators.create('viewconfig', false, {
			view_id: id, 
			hoverAttributeIndex: null
		});
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
		var selected = this.props.selected;
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
			type: config.type
		}
		var keycomps = KeycompStore.query({attribute_id: config.attribute_id})
		var keyIds = _.indexBy(keycomps, 'key_id')
		var keys = KeyStore.query({}).filter(k => k.key_id in keyIds)

		return <div className = {"menu-sub-item " + 
			(this.state.showReference || selected ? "menu-sub-item--hilite":"")}
			style = {{position: 'relative'}}
			// onMouseOver = {this._debounceHandleMouseOver} 
			// onMouseOut = {this.handleMouseOut}
			>

			
			<span ref = "grabber" className="draggable drag-grid"/>	
			
			<span style = {{maxWidth: '150px', minWidth: '150px', position: 'relative'}}>
				{
					this.state.editing ?
					<input className = "renamer"
						autoFocus
						onBlur = {_this.handleCommit} 
						onChange = {_this.handleNameChange} 
						value = {this.state.name}/>
					: [
						<span onDoubleClick = {_this.handleRename}>
							{this.state.name}
						</span>,
						this.renderDecorators()
					]
				}
			</span>

			<span style = {{color: "khaki"}}>
				<span className = {"icon icon-" + fieldType.icon}/>
				<span>
					{fieldType.description}
					{
						// fieldType.category === 'Relations' ? <span> ({config.related_model_id})</span> : null
					}
				</span>
			</span>

			
			<span>
			{
				(fieldType.configParts || []) /* config parts associated with the field type*/
				.concat(this.props.viewConfigParts || []) /* config parts passed down from the view*/
				.map(function (part, idx) {
					
					var localProps = {
						key: part.prototype.partName,
						ref: part.prototype.partName,
						direction: "left",
						classes: part.prototype.structural ? 
							"popdown-struct" : "popdown-prez"
					}
					return React.createElement(part, _.extend(
						localProps,
						configProps
					));
				})
			}
			</span>
			
			<span style={{flexDirection: 'row-reverse', maxWidth: '35px', marginRight: '10px'}}>
				{
					fieldType.unchangeable ? null :
					<AttributeConfig {...this.props} 
					{...configProps} direction = "left" key = "attributeConfig"/>
				}
			</span>
			
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

});

export default ColumnDetailListable;
