import _ from "underscore"
import update from 'react/lib/update'

import AttributeStore from "../../stores/AttributeStore"
import ModelStore from "../../stores/ModelStore"
import RelationStore from "../../stores/RelationStore"

import fieldTypes from '../fields'
import viewTypes from '../viewTypes'
import util from "../../util/util"

import groomFields from '../groomFields'

var BIG_NUM = 10000000;

var limit = function (thing, view) {
	var numCols = view.data._visibleCols.length
	thing.left = Math.min(thing.left, numCols - 1)
	if (thing.right) thing.right = Math.min(thing.right, numCols)
	return thing
}

var groomView = function (view) {
	var model = ModelStore.get(view.model_id);
	
	var data = view.data || {};

	if (!model) return view;
	
	var fields = AttributeStore.query({model_id: view.model_id});
	var relations = RelationStore.query({model_id: view.model_id})
	var iter =  BIG_NUM;

  	var columns = groomFields(view)
  	var columnList = _.values(columns).map(c => {
  		if (c._viewContext) c.order = c._viewContext.order
  		return c
  	})
	columnList = util.enumerate(columnList, util.sortByOrder)

	data.columns = columns
	data._columnList = columnList
	
	data._floatCols = columnList.filter(c => !c.fixed && c.visible)
	data._fixedCols = columnList.filter(c => c.fixed && c.visible)
	data._visibleCols = _.clone(data._fixedCols).concat(data._floatCols)

	data._floatWidth = util.sum(data._floatCols, 'width')
	data._fixedWidth = util.sum(data._fixedCols, 'width')
	data.columns = _.indexBy(data._columnList, 'column_id');

	data.sorting = _.isArray(data.sorting) ? data.sorting : []
	data.sorting = data.sorting.filter(function (sort) {
		var attribute = data.columns[sort.attribute]
		if (!attribute)	 return false
		var type = fieldTypes[attribute.type]
		return !!type.sortable
	})

	data.sortIndex = _.indexBy(data.sorting, 'attribute')

	let geo = data.geometry || {}
	data.geometry =  {
		leftGutter: 0,
		labelWidth: 64,
		topGutter: 0,
		headerHeight: 32,
		footerHeight: 50,
		rowHeight: Math.floor(geo.rowHeight * 2)/2 || 24,
		rowPadding: 2,
		colAddWidth: 32
	}

	
	return update(view, {data: {$set: data}})
}

export default groomView;
