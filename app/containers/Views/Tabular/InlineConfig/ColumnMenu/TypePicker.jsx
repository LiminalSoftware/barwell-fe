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

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		var config = this.props.config
		return {
			open: false,
			type: config.type,
			category: 'Basic'
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

		console.log(categories)

		return <div className = "popdown-section">{categories.map(function (category) {
			return <div className = {"popdown-item selectable " + 
				(category === _this.state.category ? ' selected ' : '')}
				onMouseDown = {_this.handleChooseCategory.bind(_this, category)}>
			{category}
			</div>
		})}</div>
	},

	renderFieldList: function () {
		var _this = this
		var types = Object.keys(fieldTypes)
			.filter(type => fieldTypes[type].category === _this.state.category)
			.map(id => fieldTypes[id])

		return <div className = "popdown-section">{
			types.map(function (type) {
			return <div className = {"popdown-item selectable " + 
				(type === _this.state.type ? ' selected' : '')}
				onClick = {_this.handleChooseType.bind(_this, type.id)}>

				<span className = {"icon icon-" + type.icon}/>
				{type.description}
			</div>
		})
		}</div>
	},

	renderMenu: function () {
		return [
			this.renderCategoriesList(), 
			this.renderFieldList()
		]
	},


	getIcon: function () {
		var config = this.props.config
		var fieldType = fieldTypes[this.state.type] || {}
		var active = constants.colTypes[this.props.type]

		return  " icon icon-" + active.icon;
	},

	getContent: function () {
		var config = this.props.config
		var fieldType = fieldTypes[this.state.type] || {}
		var active = constants.colTypes[this.props.type]

		return  active.description;
	},

	width: '150px'

	// render() inherited from popdownClickmodMixin

});

export default TypePicker;
