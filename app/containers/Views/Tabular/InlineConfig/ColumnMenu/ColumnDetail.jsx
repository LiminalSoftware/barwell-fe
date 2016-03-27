import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../../fields"
import $ from 'jquery'

import constants from '../../../../../constants/MetasheetConstants'

import TypePicker from './TypePicker'

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"
import PureRenderMixin from 'react-addons-pure-render-mixin';

var ColumnDetail = React.createClass({

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

	commitChanges: function (colProps) {
		var view = this.props.view
		var column_id = this.props.config.column_id
		var col = view.data.columns[column_id]

		col = _.extend(col, colProps)
		view.data.columns[column_id] = col;
		modelActionCreators.createView(view, true, true)
	},

	handleDrag: function (e) {
		this.props._startDrag(e, this.props.config)
		event.preventDefault()
	},

	handleDelete: function (e) {

	},

	handleNameChange: function (e) {
		this.setState({name: e.target.value})
	},

	handleBlurName: function (e) {
		this.commitUpdate({attribute: this.state.attribute})
	},

	blurSubMenus: function () {
		var _this = this;
		var config = this.props.config
		var fieldType = fieldTypes[config.type] || {}
		fieldType.configParts.forEach(function (el) {
			// console.log('el.partName:' + el.partName)
			_this.refs[el.prototype.partName].handleBlur();
		})
	},

	render: function() {
		var _this = this
	    var view = this.props.view
	    var model = this.props.model
	    var config = this.props.config
		var fieldType = fieldTypes[config.type] || {}
		var editing = this.props.editing
		// var labelAttrId = model.label_attribute_id

		var typeFieldChoices = Object.keys(constants.fieldTypes)
			.filter(type => (type !== 'PRIMARY_KEY')).map(function (type) {
	  			return <option value={type} key={type}>
	  				{constants.fieldTypes[type]}
	  			</option>;
			});

	    return <div className={"menu-item menu-sub-item" +
				(this.props.singleton ? " singleton " : "") +
				(this.props.dragging ? " dragging " : "")}>
		      	<span className = "ellipsis">
					{
					this.props.open ? 
					<span onMouseDown = {_this.handleDrag}
					      className="draggable icon grayed icon-menu"/>
					: null
					}

					{
					editing ?
					<input className = "menu-input
						text-input" value={this.state.name}
						onChange = {this.handleNameChange}/>
					: <span>{config.name}</span>
					}
				</span>
				
				{editing ? 
					<span>
						<TypePicker {...this.props}/>
					</span>
					:
					<span>
					{
						(fieldType.configParts || []).concat(_this.props.viewConfigParts || []).map(function (part, idx) {
						return React.createElement(part, {
							_blurSiblings: _this.blurSubMenus,
							key: part.prototype.partName,
							ref: part.prototype.partName,
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
				<span onMouseDown = {this.openDetail} className = "icon icon-cog"></span>
				: null
				}
			</div>
	}
});

export default ColumnDetail;
