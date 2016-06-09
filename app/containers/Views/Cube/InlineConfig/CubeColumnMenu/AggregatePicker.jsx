import React from "react";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import constant from '../../../../../constants/MetasheetConstants'
import util from "../../../../../util/util"
import PopDownMenu from '../../../../../components/PopDownMenu'
import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"

import configCommitMixin from '../../../Fields/configCommitMixin'
import popdownClickmodMixin from '../../../Fields/popdownClickmodMixin'
import blurOnClickMixin from '../../../../../blurOnClickMixin'

var AggregatePicker = React.createClass({

	partName: 'AggregatePicker',

	mixins: [blurOnClickMixin, configCommitMixin, popdownClickmodMixin],

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

	getIcon: function () {
		return " icon icon-sigma";
	},

	renderMenu: function () {
		var _this = this;
		var config = this.props.config;
		var selected = this.props.config.aggregator;

		return <div className = "popdown-section">
		    <li className = "popdown-item bottom-divider title">Aggregator</li>
			{
			this.aggregates.map(function (agg) {
				return <div className = {"popdown-item selectable " + (agg.id === selected ? " menu-selected " : "")} key = {agg.id} 
				onClick = {_this.handleChooseAggregate.bind(_this, agg.id)}>
				<span className = "icon icon-sigma"/>{agg.label}
				</div>
			})
			}
		 </div>
	}
});

export default AggregatePicker;
