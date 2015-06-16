var _ = require("underscore");
var AttributeStore = require('../../stores/AttributeStore')
var ModelStore = require('../../stores/ModelStore')
var fieldTypes = require('./fields')
var viewTypes = require('./viewTypes')

var enumerate = function (things) {
	var iter = 1;
	var list = _.values(things);
	list = _.sortBy(list, 'order');
	list = _.map(list, function(thing) {
		thing.order = iter++; return thing;
	});
	return _.indexBy(list,'id');
}

var groomView = module.exports.prepView = function (view) {
	
	var model = ModelStore.get(view.model_id);
	var data = view.data || {};
	if (!model) return view;
	var fields = AttributeStore.getModelAttributes(view.model_id);
	var iter =  1000;
	var cols = {};
	var sorting = enumerate(data.sorting || []);

	view.type = (data.type || "Tabular")
	data = data || {};
	data.icon = viewTypes[view.type].icon
	data.columns = data.columns || {}
	
	fields.forEach(function (field) {
		
		var col = data.columns[id] || {};
		
		col.id = id
		col.type = field.type
		col.name = field.attribute
		col.visible = col.visible === false ? false : true
		col.expanded = !!col.expanded
		col.width = _.isNumber(col.width) ? col.width : 100
		col.order = col.order || iter ++
		col.sorting = sorting[id]

		if (col.type in fieldTypes && !!fieldTypes[col.type].configCleanser)
			col = fieldTypes[col.type].configCleanser (col)

		data.columns[id] = col
	})
	data.columns = enumerate(data.columns);
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