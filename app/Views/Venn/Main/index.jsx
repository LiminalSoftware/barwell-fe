import React from "react"
import ReactDOM from "react-dom"
import _ from 'underscore'
import $ from 'jquery'

import util from "../../../util/util"

import modelActionCreators from "../../../actions/modelActionCreators.jsx"

import ModelStore from "../../../stores/ModelStore"
import KeyStore from "../../../stores/KeyStore"
import ViewStore from "../../../stores/ViewStore"
import KeycompStore from "../../../stores/KeycompStore"
import AttributeStore from "../../../stores/AttributeStore"
import FocusStore from "../../../stores/FocusStore"

import ViewConfigStore from "../../../stores/ViewConfigStore"
import storeFactory from 'flux-store-factory';
import dispatcher from "../../../dispatcher/MetasheetDispatcher"

import fieldTypes from "../../fields"

import createCubeStore from '../../Cube/CubeStore'
import cubeFetchMixin from '../../Cube/Main/cubeFetchMixin'

import venn from "venn.js"

var WINDOW_ROWS = 20;

var VennPane = React.createClass ({

	mixins: [cubeFetchMixin],

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return {
			vOffset: 0,
			hOffset: 0
		}
	},

	componentWillMount: function () {
		FocusStore.addChangeListener(this._onChange)
		ViewStore.addChangeListener(this._onChange);

		this.store = createCubeStore(this.props.view);
		this.store.addChangeListener(this._onChange);
		this.fetch()
	},

	componentWillUnmount: function () {
		document.body.removeEventListener('keydown', this.onKey)
		FocusStore.removeChangeListener(this._onChange)
		ViewStore.removeChangeListener(this._onChange);
		if (this.store) this.store.removeChangeListener(this._onChange)
		this.store.unregister()
	},

	componentDidUpdate: function () {
		if (!this.store) return
		var store = this.store
		var view = this.props.view
		var model = this.props.model
		var aggs = view.row_aggregates
		var numAggs = aggs.length
		var levels = this.store.getLevels('row', 0, 10) || [];
		var numLevels = levels.length
		if (!store.isCurrent('body')) return null;

		var values = levels.map(function (level) {
			return store.getValue(level)
		})

		var sets = []

		for (var i = 1; i <= Math.pow(2, aggs.length); i++) {
			var _sets = []
			var _size = 0;

			// console.log('----')
			// console.log('i: ' + i)
			for (var j = 0; j < aggs.length; j++) {
				// console.log('j: ' + j + '; ' + (i % Math.pow(2,j + 1) < Math.pow(2,j)))
				if (i % Math.pow(2,j + 1) < Math.pow(2,j)) _sets.push('a' + aggs[j])
			}
			

			values.forEach(function (val) {
				if (_sets.every(s => val[s])) _size += val['count_' + model._pk]
			})
			if (_sets.length) sets.push({
				sets: _sets.map(l => view.data.columns[l].name),
				size: _size
			})
		}
		
		var chart = venn.VennDiagram()
		d3.select("#view-" + view.view_id + "-body").datum(sets).call(chart);
	},

	// UTILITY ================================================================

	// fetch: function () {
	// 	var view = this.props.view
	// 	var geo = view.data.geometry
	// 	var store = this.props.store
	// 	var filter = []

	// 	var groupings = view.row_aggregates;
	
	// 	if (!(groupings.length > 0)) return Promise.resolve();
	// 	// if (store.isCurrent('body')) return Promise.resolve();
		
	// 	return modelActionCreators.fetchVennValues(view, store).then(function () {
	// 		console.log('fetched...')
	// 	})
	// },

	_onChange: function () {
		this.forceUpdate();
	},

	// RENDER =================================================================

	render: function () {
		var view = this.props.view
		console.log(d3)
		return <div className = "model-panes">
			<div className="view-body-wrapper" id = {"view-" + view.view_id + "-body"}>
				
			</div>
		</div>
	},

	
})

export default VennPane
