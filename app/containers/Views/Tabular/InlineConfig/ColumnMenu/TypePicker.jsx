import React from "react";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import constants from '../../../../../constants/MetasheetConstants'
import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"

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


	    return <span>
			{
				constants.colTypes.map(function () {
					return <option value={type} key={type}>
	  					{constants.fieldTypes[type]}
	  				</option>;
				})
			}
		</span>
	}
});

export default TypePicker;
