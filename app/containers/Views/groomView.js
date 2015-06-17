import _ from "underscore"
import AttributeStore from '../../stores/AttributeStore'
import ModelStore from '../../stores/ModelStore'
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
	var iter =  BIG_NUM;
	var cols = {};
	var sorting = enumerate(data.sorting || [], 'attribute_id');

	view.type = (data.type || "Tabular")
	data = data || {};
	data.icon = viewTypes[view.type].icon
	data.columns = data.columns || {}
	
	fields.forEach(function (field) {
		var col = data.columns[field.attribute_id] || {};
		col.attribute_id = field.attribute_id;
		col.type = field.type
		col.name = field.attribute
		col.visible = (col.visible === false) ? false : true
		col.expanded = !!col.expanded
		col.width = _.isNumber(col.width) ? col.width : 100
		col.order = col.order || iter ++
		col.sorting = sorting[field.attribute_id]

		if (col.type in fieldTypes && !!fieldTypes[col.type].configCleanser)
			col = fieldTypes[col.type].configCleanser(col)

		columns[field.attribute_id] = col
	})
	data.columns = enumerate(columns, 'attribute_id');
	data.columnList = _.sortBy(_.values(data.columns), 'order');
	data.selection = _.extend({'left': 0, 'top': 0, 'right': 0, 'bottom': 0}, (data.selection || {}) );
	data.anchor = _.extend({"left": 0, "top": 0}, data.anchor || {});
	data.pointer = _.extend({"left": 0, "top": 0}, data.pointer || {});
	data.scrollTop = data.scrollTop || 0;
	data.fetching = false;
	view.data = data;
	return view
}

export default groomView;