import _ from "underscore"
import AttributeStore from '../../../stores/AttributeStore'
import ModelStore from '../../../stores/ModelStore'
import RelationStore from '../../../stores/RelationStore'
import fieldTypes from '../fields'
import viewTypes from '../viewTypes'
import util from "../../../util/util"

import groomFields from '../groomFields'

var BIG_NUM = 10000000;

var comparator = function (a, b) {
	return ((b.fixed + b.visible - b.order/1000)
		- (a.fixed + a.visible - a.order/1000))
}

var enumerate = function (list) {
	list.sort(comparator)
	return list.map(function(item, i) {
		item.order = i
		return item
	})
}

var limit = function (thing, view) {
	var numCols = view.data.visibleCols.length
	thing.left = Math.min(thing.left, numCols - 1)
	if (thing.right) thing.right = Math.min(thing.right, numCols)
	return thing
}

var groomView = function (view) {
	var model = ModelStore.get(view.model_id);
	
	var data = view.data = view.data || {};
	if (!model) return view;
	var fields = AttributeStore.query({model_id: view.model_id});
	var relations = RelationStore.query({model_id: view.model_id})
	var iter =  BIG_NUM;

  	var columns = groomFields(view)
	var columnList = enumerate(_.values(columns))

	data.columns = columns
	data.columnList = columnList
	data.visibleCols = columnList.filter(c => c.visible)
	data.floatCols = columnList.filter(c => !c.fixed && c.visible)
	data.fixedCols = columnList.filter(c => c.fixed && c.visible)
	data.floatWidth = util.sum(data.floatCols, 'width')
	data.fixedWidth = util.sum(data.fixedCols, 'width')
	data.columns = _.indexBy(data.columnList, 'column_id');

	data.sorting = _.isArray(data.sorting) ? data.sorting : []
	data.sorting = data.sorting.filter(function (sort) {
		var attribute = data.columns['a' + sort.attribute_id]
		if (!attribute) return false
		var type = fieldTypes[attribute.type]
		if (type.sortable) return true
		else return false
	})
	data.sortIndex = _.indexBy(data.sorting, 'attribute_id')

	data.selection = _.extend({'left': 0, 'top': 0, 'right': 0, 'bottom': 0}, (data.selection || {}) );
	data.selection = limit(data.selection, view)
	data.anchor = _.extend({"left": 0, "top": 0}, data.anchor || {});
	data.anchor = limit(data.anchor, view)
	data.pointer = _.extend({"left": 0, "top": 0}, data.pointer || {});
	data.pointer = limit(data.pointer, view)
	data.scrollTop = data.scrollTop || 0;

	data.geometry = data.geometry || {}
	data.geometry = _.extend({
		leftGutter: 0,
		labelWidth: 30,
		topGutter: 0,
		headerHeight: 28.5,
		rowHeight: Math.min(Math.max(data.geometry.rowHeight || 25, 20), 80),
		rowPadding: 1,
		colAddWidth: 100
	}, {})



	view.data = data;
	return view
}

export default groomView;
