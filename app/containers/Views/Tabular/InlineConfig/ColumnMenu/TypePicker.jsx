import React from "react";
import _ from 'underscore';
import fieldTypes from "../../../fields"
 
import constants from '../../../../../constants/MetasheetConstants'
import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"
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
		<div className="popdown-item bottom-divider title">
			Choose Attribute Type:
		</div>
		<div className = "popdown-item menu-row bottom-divider"
			style = {{paddingBottom: 0}}>
		{categories.map(function (category) {
			var isSelected = (category === _this.state.category)
			return <span className = {"menu-choice selectable " + 
				(isSelected ? ' selected ' : '')}
				style = {{position: 'relative'}}
				onMouseDown = {_this.handleChooseCategory.bind(_this, category)}>

			{isSelected ? <span className = "pop-up-pointer-inner"/> : null}
			{isSelected ? <span className = "pop-up-pointer-outer"/> : null}
			{category}
			</span>
		})}</div>
		</div>
	},

	renderFieldList: function () {
		var _this = this
		var types = Object.keys(fieldTypes)
			.filter(type => fieldTypes[type].category === _this.state.category)
			.map(id => fieldTypes[id])

		return <div className = "popdown-section">{
			types.map(function (type) {
			return <span className = {"popdown-item " + 
				(type === _this.state.type ? ' selected' : '')}
				onClick = {_this.handleChooseType.bind(_this, type.id)}>

				<span className = {"icon icon-" + type.icon}/>
				{type.description}
			</span>
		})
		}</div>
	},

	renderMenu: function () {
		var fieldType = fieldTypes[this.state.type] || {}
		if (fieldType.unchangeable) return <div className = "popdown-section">
			This attribute cannot be changed.
		</div>
		else return [
			this.renderCategoriesList(), 
			this.renderFieldList()
		]
	},


	getIcon: function () {
		var config = this.props.config
		var fieldType = fieldTypes[this.state.type] || {}

		return  " icon icon-" + fieldType.icon;
	},

	// getContent: function () {
	// 	var config = this.props.config
	// 	var fieldType = fieldTypes[this.state.type] || {}
	// 	var active = constants.colTypes[this.props.type]

	// 	return  active.description;
	// },

	menuWidth: '350px',

	// render() inherited from popdownClickmodMixin

});

export default TypePicker;
