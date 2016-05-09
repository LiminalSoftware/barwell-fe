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

	partName: 'AggregatePicker',

	mixins: [blurOnClickMixin, configCommitMixin],

	getInitialState: function () {
		return {
			choice: 'values',
			open: false
		}
	},

	handleChooseAggregate: function (agg) {
		var config = this.props.config;
		this.commitChanges({aggregator: agg});
	},

	aggregates: [
		{
			label: 'Values (where consistent)',
			id: 'values'
		},
		{
			label: 'Values (list)',
			id: 'list'
		},
		{
			label: 'Sum',
			id: 'sum'
		},
		{
			label: 'Count',
			id: 'count'
		},
		{
			label: 'Max',
			id: 'max'
		},
		{
			label: 'Min',
			id: 'min'
		},
		{
			label: 'Average',
			id: 'average'
		},
		{
			label: 'Median',
			id: 'median'
		},
		{
			label: 'Standard deviation',
			id: 'stddev'
		}
	],

	render: function() {
		var _this = this
		var config = this.props.config;
		var selected = this.props.config.aggregator;

		return <span className={"pop-down clickable icon icon-sigma"}
        	onMouseDown = {this.handleOpen}>
	        {
	        this.state.open ?
				<PopDownMenu {...this.props}>
					<li className = "bottom-divider">Aggregator</li>
					{
					this.aggregates.map(function (agg) {
						return <li className = {"selectable " + (agg.id === selected ? " menu-selected " : "")} key = {agg.id} 
						onClick = {_this.handleChooseAggregate.bind(_this, agg.id)}>
						{agg.label}
						</li>
					})
					}
				</PopDownMenu>
				: null
			}
			</span>
	}
});

export default AggregatePicker;
