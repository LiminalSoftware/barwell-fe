import _ from "underscore"
import AttributeStore from '../../../stores/AttributeStore'
import ModelStore from '../../../stores/ModelStore'
import RelationStore from '../../../stores/RelationStore'
import fieldTypes from '../fields'
import viewTypes from '../viewTypes'

var BIG_NUM = 10000000;

var enumerate = function (things, identifier) {
	var iter = 1;
	var list = _.values(things);
	list = _.sortBy(list, 'order');
	list = _.map(list, function(thing) {
		thing.order = iter++; return thing;
	});
	return _.indexBy(list, identifier);
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
	var cols = {};
	if (!_.isArray(data.sorting)) data.sorting = []
	var sorting = enumerate(data.sorting.filter(function(item) {
		var attribute = AttributeStore.get(item.attribute_id)
		return _.contains(['PRIMARY_KEY', 'INTEGER', 'TEXT', 'DATE', 'BOOLEAN', 'DECIMAL', 'DATE_TIME'], attribute.type)
	}), 'attribute_id');


	data.columns = data.columns || {}

	fields.forEach(function (field) {
		var col = data.columns['a' + field.attribute_id] || {};

		col.column_id = 'a' + field.attribute_id
		col.attribute_id = field.attribute_id;
		col.type = field.type
		col.name = field.attribute
		if (!col.align) {
			if(col.type === 'INTEGER' || col.type === 'DECIMAL' || col.type === 'DATE') col.align = 'right'
			else if (col.type === 'BOOLEAN') col.align = 'center'
			else col.align = 'left'
		}
		col.visible = (col.visible === false) ? false : true
		col.expanded = !!col.expanded
		col.width = (col.width > 50 ? col.width : 50)
		col.order = col.order || iter ++
		col.sorting = sorting[field.attribute_id]

		if (col.type in fieldTypes && !!fieldTypes[col.type].configCleanser)
			col = fieldTypes[col.type].configCleanser(col)

		columns[col.column_id] = col
	})

	enumerate(fields)

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
		col.visible = (col.visible === false) ? false : true
		col.expanded = !!col.expanded
		col.width = _.isNumber(col.width) ? col.width : 100
		col.order = col.order || iter ++
		columns[col.column_id] = col
	})

	data.columns = enumerate(columns, 'column_id');
	data.columnList = _.sortBy(_.values(data.columns), 'order');
	data.selection = _.extend({'left': 0, 'top': 0, 'right': 0, 'bottom': 0}, (data.selection || {}) );
	data.selection = limit(data.selection, view)
	data.anchor = _.extend({"left": 0, "top": 0}, data.anchor || {});
	data.anchor = limit(data.anchor, view)
	data.pointer = _.extend({"left": 0, "top": 0}, data.pointer || {});
	data.pointer = limit(data.pointer, view)
	data.scrollTop = data.scrollTop || 0;

	data.geometry = _.extend({
		// leftGutter: 1,
		leftOffset: 0,
		topGutter: 0,
		headerHeight: 28.5,
		rowHeight: 25,
		rowPadding: 1,
	}, data.geometry)

	view.data = data;
	// view.getVisibleColumns = function () {
	// 	var view = this.props.view
	// 	return _.filter(view.data.columnList, 'visible');
	// }
	return view
}

export default groomView;
