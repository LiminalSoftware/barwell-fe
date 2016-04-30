import React from "react";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import constants from '../../../../../constants/MetasheetConstants'
import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"
import PopDownMenu from '../../../../../components/PopDownMenu'
import ReactDOM from "react-dom"
import blurOnClickMixin from '../../../../../blurOnClickMixin'

var TypePicker = React.createClass({

	mixins: [blurOnClickMixin],

	getInitialState: function () {
		var config = this.props.config
		return {
			open: false,
			type: config.type,
			category: 'Basic'
		}
	},

	handleChooseCategory: function (category, e) {
		this.setState({category: category})
	},

	handleChooseType: function (type, e) {
		this.setState({open: false});
		this.props._chooseType(type)
	},

	render: function() {
		var _this = this
	    var view = this.props.view
	    var config = this.props.config
		var fieldType = fieldTypes[config.type] || {}
		var editing = this.props.editing
		var active = constants.colTypes[this.props.type]
		var rows = []
		var category = ''


		_.sortBy(_.values(constants.colTypes), 'category').forEach(function (type, key) {
			if (category !== type.category && type.category)
			rows.push(<li key = {type.category} 
					onClick = {_this.handleChooseCategory.bind(_this, type.category)}
					className = "bottom-divider">
				{type.category}
			</li>)
			category = type.category
			
			if (type.category === _this.state.category) rows.push(<li key = {type.id} 
				className = "selectable half-width-menu-item"
				onClick = {_this.handleChooseType.bind(_this, type.id)}>
				<span className = {"icon icon-" + type.icon}/>{type.description}
			</li>)
		})

	    return <span ref = "picker">
	    	<span className = "pop-down" style = {{width: '100px'}} onClick = {this.props.type === 'PRIMARY_KEY' ? null : this.handleOpen}>
	    		<span className = {"icon icon-" + active.icon}/>
	    		{active.description}
		    	{
		    		_this.state.open ?
		    			<PopDownMenu width = {250} split = {true}> 
		    				{rows} </PopDownMenu>
		    			: null
		    	}
	    	</span>
		</span>
	}
});

var TypeChoice = React.createClass({
	render: function () {
		return <span>

		</span>
	}
})

export default TypePicker;
