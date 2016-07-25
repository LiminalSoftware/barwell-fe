import React from "react";
import _ from 'underscore';
import fieldTypes from "../../../fields"
 
import constants from '../../../../../constants/MetasheetConstants'
import PopDownMenu from '../../../../../components/PopDownMenu'
import ReactDOM from "react-dom"
import blurOnClickMixin from '../../../../../blurOnClickMixin'

import popdownClickmodMixin from '../../../Fields/popdownClickmodMixin'

var TypePicker = React.createClass({

	mixins: [blurOnClickMixin, popdownClickmodMixin],

	partName: 'TypePicker',

	classes: 'popdown-borderless',

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		var config = this.props.config
		var fieldType = fieldTypes[config.type] || {}

		return {
			open: false,
			type: config.type,
			category: fieldType.category
		}
	},

	// HANDLERS ================================================================

	handleChooseType: function (type) {
		this.setState({type: type})
		this.props._chooseType(type)
	},

	handleChooseCategory: function (category) {
		this.setState({category: category})
	},

	// RENDER ===================================================================

	renderCategoriesList: function () {
		var _this = this
		var categories = _.uniq(Object.keys(fieldTypes)
			.map(type => fieldTypes[type].category))
			.filter(_.identity);

		return <div className = "popdown-section">
		
		{categories.map(function (category) {
			var isSelected = (category === _this.state.category)
			return <span className = {"popdown-item selectable " + 
				(isSelected ? ' bottom-divider top-divider ' : ' right-divider ')}

				style = {{position: 'relative', paddingBottom: '5px'}}
				onMouseDown = {_this.handleChooseCategory.bind(_this, category)}>

			{category}
			</span>
		})}
		</div>
		
	},

	renderFieldList: function () {
		var config = this.props.config
		var _this = this
		var types = Object.keys(fieldTypes)
			.filter(_.identity)
			.map(function(id) {
				var type = fieldTypes[id];
				type.typeId = id
				return type
			}).filter(type => type.category === this.state.category)

		return <div className = "popdown-section">

		{
			types.map(function (type) {
			return <span className = {"popdown-item selectable " + 
				(type.typeId === config.type ? ' popdown-item-selected' : '')}
				onClick = {_this.handleChooseType.bind(_this, type.typeId)}>

				<span className = {"icon icon-" + type.icon}/>
				{type.description}
			</span>
		})
		}</div>
	},

	renderMenu: function () {
		var config = this.props.config
		var fieldType = fieldTypes[config.type] || {}
		if (fieldType.unchangeable) return <div className = "popdown-section">
			This attribute cannot be changed.
		</div>
		else return [
			<div className="popdown-section">
			<div className="popdown-item bottom-divider title">
				Choose Attribute Type:
			</div></div>,
			<div className = "popdown-section split-menu"> 
			{[
				this.renderCategoriesList(), 
				this.renderFieldList()
			]}
			</div>]
	},

	getContent: function () {
		var config = this.props.config
		var fieldType = fieldTypes[config.type] || {}

		return fieldType.description
	},

	getIcon: function () {
		var config = this.props.config
		var fieldType = fieldTypes[config.type] || {}

		return  " icon icon-" + fieldType.icon;
	},

	menuWidth: '350px',

	// render() inherited from popdownClickmodMixin

});

export default TypePicker;
