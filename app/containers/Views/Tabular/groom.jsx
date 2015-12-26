import _ from "underscore"
import AttributeStore from '../../../stores/AttributeStore'
import ModelStore from '../../../stores/ModelStore'
import RelationStore from '../../../stores/RelationStore'
import fieldTypes from '../fields'
import viewTypes from '../viewTypes'
import util from "../../../util/util"

var BIG_NUM = 10000000;

var comparator = function (a, b) {
	return ((b.fixed || 0) - (a.fixed || 0)) + (a.order - b.order) / 1000
}

var enumerate = function (list) {
	list.sort(comparator)
	return list.map(function(item, i) {
		item.order = i
		return item
	})
}

var limit = function (thing, view) {
	var columns = view.data.columnList.filter(col => col.visible).length
	thing.left = Math.min(thing.left, columns - 1)
	if (thing.right) thing.right = Math.min(thing.right, columns)
	return thing
}

var groomView = function (view) {
	var model = ModelStore.get(view.model_id);
	var columns = {}
	var data = view.data || {};
	if (!model) return view;
	var fields = AttributeStore.query({model_id: view.model_id});
	var relations = RelationStore.query({model_id: view.model_id})
	var iter =  BIG_NUM;
	data.sorting = []
	var sorting = {}
	data.columns = data.columns || {}

	fields.forEach(function (field) {
		var prev = data.columns['a' + field.attribute_id] || {};
		var col = prev
		col.column_id = 'a' + field.attribute_id
		col.attribute_id = field.attribute_id;
		col.type = field.type
		col.name = field.attribute
		col.sorting = null
		if (col.type in fieldTypes && !!fieldTypes[col.type].configCleanser)
			col = fieldTypes[col.type].configCleanser(col)

		col.align = prev.align
		if (!col.align) {
			if(col.type === 'INTEGER' || col.type === 'DECIMAL' || col.type === 'DATE') col.align = 'right'
			else if (col.type === 'BOOLEAN') col.align = 'center'
			else col.align = 'left'
		}
		col.visible = (prev.visible === false) ? false : true
		col.width = Math.max(_.isNumber(col.width) ? col.width : 0, 50)
		columns[col.column_id] = col
	})

	relations.forEach(function (relation) {
		var col = data.columns['r' + relation.relation_id] || {};
		var attrs = AttributeStore.query({model_id: relation.related_model_id});
		var relatedModel = ModelStore.get(relation.related_model_id)
		var pk =  (relatedModel || {}).pk;
		col.column_id = 'r' + relation.relation_id
		col.related_model_id = relation.related_model_id
		col.related_key_id = relation.related_key_id
		col.key_id = relation.key_id
		col.label = col.label || ('a' + attrs[0].attribute_id)
		col.relation_id = relation.relation_id;
		col.type = relation.type
		col.name = relation.relation
		col.width = Math.max(_.isNumber(col.width) ? col.width : 0, 50)

		columns[col.column_id] = col
	})

	var columnList = enumerate(_.values(columns))
	columnList.map(function (col) {
		

	})

	data.columnList = columnList
	data.columns = _.indexBy(data.columnList, 'column_id');

	data.selection = _.extend({'left': 0, 'top': 0, 'right': 0, 'bottom': 0}, (data.selection || {}) );
	data.selection = limit(data.selection, view)
	data.anchor = _.extend({"left": 0, "top": 0}, data.anchor || {});
	data.anchor = limit(data.anchor, view)
	data.pointer = _.extend({"left": 0, "top": 0}, data.pointer || {});
	data.pointer = limit(data.pointer, view)
	data.scrollTop = data.scrollTop || 0;

	data.geometry = _.extend({
		leftGutter: 0,
		topGutter: 0,
		headerHeight: 28.5,
		rowHeight: 25,
		rowPadding: 1,
	}, data.geometry)

	view.data = data;
	return view
}

export default groomView;
