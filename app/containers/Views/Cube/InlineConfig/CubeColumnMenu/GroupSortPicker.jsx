import React from "react";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import constant from '../../../../../constants/MetasheetConstants'
import util from "../../../../../util/util"
import PopDownMenu from '../../../../../components/PopDownMenu'
import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"

import configCommitMixin from '../../../Fields/configCommitMixin'
import blurOnClickMixin from '../../../../../blurOnClickMixin'

var GroupSortPicker = React.createClass({

	partName: 'GroupSortPicker',

	structural: true,

	mixins: [blurOnClickMixin, configCommitMixin],

	getInitialState: function () {
		return {
			choice: null,
			open: false
		}
	},

	handleInvert: function () {
		var config = this.props.config;
		this.commitChanges({descending: !config.descending});
	},	

	render: function() {
		var _this = this
		var config = this.props.config
		var fieldType = fieldTypes[config.type]

		return <span className={"pop-down icon icon-" + fieldType.sortIcon + (config.descending ? 'desc' : 'asc')}
        	onMouseDown = {this.handleInvert}>
		</span>
	}
});

export default GroupSortPicker;
