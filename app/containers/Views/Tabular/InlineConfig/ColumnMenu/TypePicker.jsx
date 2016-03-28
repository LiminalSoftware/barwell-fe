import React from "react";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import constants from '../../../../../constants/MetasheetConstants'
import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"
import PopDownMenu from '../../../../../components/PopDownMenu'
import ReactDOM from "react-dom"

var TypePicker = React.createClass({

	getInitialState: function () {
		var config = this.props.config
		return {
			open: false,
			type: config.type
		}
	},

	handleOpen: function (e) {
		this.setState({open: true})
	},

	render: function() {
		var _this = this
	    var view = this.props.view
	    var config = this.props.config
		var fieldType = fieldTypes[config.type] || {}
		var editing = this.props.editing
		var active = constants.colTypes[this.state.type]
		var rows = []

		constants.colTypeCategories.forEach(function (category) {
			rows.push(<li key={category + '-label'} className = "bottom-divider top-divider">{category}</li>)
			_.forEach(constants.colTypes, function (type, key) {
				if (type.category === category) rows.push(<li key={type.id} className = "selectable">
  					{type.description}
  				</li>);
			})
		})

	    return <span ref = "picker">
	    	<span className = "pop-down" style = {{width: '100px'}} onClick = {this.handleOpen}>
	    		{active.description}
		    	{
		    		this.state.open ?
		    		<PopDownMenu parentElement = {element}>
		    		{rows}
		    		</PopDownMenu>
		    		:
		    		null
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
