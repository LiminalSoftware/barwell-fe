import React from "react"
import ReactDOM from "react-dom"
import _ from 'underscore'
import $ from 'jquery'

import util from '../../../../util/util'

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"

import ModelStore from "../../../../stores/ModelStore"
import KeyStore from "../../../../stores/KeyStore"
import ViewStore from "../../../../stores/ViewStore"
import KeycompStore from "../../../../stores/KeycompStore"
import AttributeStore from "../../../../stores/AttributeStore"
import FocusStore from "../../../../stores/FocusStore"

import ViewConfigStore from "../../../../stores/ViewConfigStore"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

import fieldTypes from "../../fields"

import createCubeStore from '../../Cube/CubeStore'

// import d3 from "d3"
import venn from "venn.js"

var WINDOW_ROWS = 20;

var VennPane = React.createClass ({

	// LIFECYCLE ==============================================================

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
		var rowLevels = this.store.getLevels('row', 0, 10) || [];

		var sets = [ {sets: ['A'], size: 12}, 
             {sets: ['B'], size: 12},
             {sets: ['A','B'], size: 2}];
		var chart = venn.VennDiagram()
		d3.select("#venn").datum(sets).call(chart);
	},

	// UTILITY ================================================================

	fetch: function () {
		var view = this.props.view
		var geo = view.data.geometry
		var store = this.props.store
		var filter = []

		var groupings = view.row_aggregates;
	
		if (!(groupings.length > 0)) return Promise.resolve();
		// if (store.isCurrent('body')) return Promise.resolve();
		
		return modelActionCreators.fetchVennValues(view, store).then(function () {
			console.log('fetched...')
		})
	},

	_onChange: function () {
		this.forceUpdate();
	},

	// RENDER =================================================================

	render: function () {
		var view = this.props.view
		return <div className = "model-panes">
			<div className="view-body-wrapper" id = {"view-" + view.view_id + "-body"}>
				
			</div>
		</div>
	},

	
})

export default VennPane
