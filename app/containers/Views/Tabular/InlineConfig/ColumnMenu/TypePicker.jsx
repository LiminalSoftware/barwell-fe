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

	handleChooseType: function (typeId) {
		this.props._chooseType(typeId)
	},

	// RENDER ===================================================================

	renderMenu: function () {
		var _this = this
	    var view = this.props.view
	    var config = this.props.config
	    var fieldType = fieldTypes[config.type] || {}
	    var colTypes = _.values(constants.colTypes);

		return constants.colTypeCategories.map(function(category) {
			var types = colTypes.filter(ct => ct.category === category)
			return <div className = "popdown-section" key={category}>
				<div className = "popdown-item title bottom-divider">{category}</div>
				{
					types.map(function (type) {
						return <div className = {"popdown-item selectable " + (type === _this.props.type ? ' selected' : '')}
						onClick = {_this.handleChooseType.bind(_this, type.id)}>
							<span className = {"icon icon-" + type.icon}/>
							{type.description}
						</div>
					})
				}
			</div>
		})
	},

	getIcon: function () {
		var config = this.props.config
		var fieldType = fieldTypes[config.type] || {}
		var active = constants.colTypes[this.props.type]

		return  " icon icon-" + active.icon;
	},

	getContent: function () {
		var config = this.props.config
		var fieldType = fieldTypes[config.type] || {}
		var active = constants.colTypes[this.props.type]

		return  active.description;
	},

	// render() inherited from popdownClickmodMixin

});

export default TypePicker;
