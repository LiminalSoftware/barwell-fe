import _ from "underscore"
import AttributeStore from '../../stores/AttributeStore'
import ModelStore from '../../stores/ModelStore'
import RelationStore from '../../stores/RelationStore'
import fieldTypes from './fields'
import viewTypes from './viewTypes'

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

var groomView = module.exports.prepView = function (view) {
	
	var model = ModelStore.get(view.model_id);
	var columns = {}
	var data = view.data || {};
	if (!model) return view;
	var fields = AttributeStore.query({model_id: view.model_id});
	var relations = RelationStore.query({model_id: view.model_id})
	var iter =  BIG_NUM;
	var cols = {};
	var sorting = enumerate(data.sorting || [], 'attribute_id');

	view.type = (data.type || "Tabular")
	data.icon = viewTypes[view.type].icon
	data.columns = data.columns || {}
	
	fields.forEach(function (field) {
		var col = data.columns['a' + field.attribute_id] || {};
		
		col.column_id = 'a' + field.attribute_id
		col.attribute_id = field.attribute_id;
		col.type = field.type
		col.name = field.attribute
		if (!col.align) {
			if(col.type === 'INTEGER' || col.type === 'DECIMAL' || col.type === 'DATE') col.align = 'right'
			else col.align = 'left'
		}
		col.visible = (col.visible === false) ? false : true
		col.expanded = !!col.expanded
		col.width = _.isNumber(col.width) ? col.width : 100
		col.order = col.order || iter ++
		col.sorting = sorting[field.attribute_id]

		if (col.type in fieldTypes && !!fieldTypes[col.type].configCleanser)
			col = fieldTypes[col.type].configCleanser(col)

		columns[col.column_id] = col
	})

	relations.forEach(function (relation) {
		var col = data.columns['r' + relation.relation_id] || {};
		var attrs = AttributeStore.query({model_id: relation.related_model_id});

		col.column_id = 'r' + relation.relation_id
		col.related_model_id = relation.related_model_id
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
	data.anchor = _.extend({"left": 0, "top": 0}, data.anchor || {});
	data.pointer = _.extend({"left": 0, "top": 0}, data.pointer || {});
	data.scrollTop = data.scrollTop || 0;
	
	view.data = data;
	return view
}

export default groomView;