import React from "react";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import constant from '../../../../../constants/MetasheetConstants'
import util from "../../../../../util/util"
import PopDownMenu from '../../../../../components/PopDownMenu'
import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"

import configCommitMixin from '../../../Fields/configCommitMixin'
import blurOnClickMixin from '../../../../../blurOnClickMixin'

var AggregatePicker = React.createClass({

	mixins: [blurOnClickMixin, configCommitMixin],

	getInitialState: function () {
		return {
			choice: null,
			open: false
		}
	},

	render: function() {
		var _this = this

		return <span className={"pop-down clickable icon icon-sigma"}
        	onMouseDown = {this.handleOpen}>
	        {
	        this.state.open ?
				<PopDownMenu>
					<li className = "selectable">Sum</li>
					<li className = "selectable">Count</li>
					<li className = "selectable">Max</li>
					<li className = "selectable">Min</li>
					<li className = "selectable">Average</li>
					<li className = "selectable">Median</li>
				</PopDownMenu>
				: null
			}
			</span>
	}
});

export default AggregatePicker;
