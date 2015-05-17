import bw from "barwell";
import _ from "underscore";

var enumerate = function (things) {
	var iter = 1;
	var list = _.values(things);
	list = _.sortBy(list, 'order');
	list = _.map(list, function(thing) {
		thing.order = iter++; return thing;
	});
	return _.indexBy(list,'id');
}

var prepView = function (view) {
	var data = view.synget(bw.DEF.VIEW_DATA) || {};
	data.columns = data.columns || {};
	var model = view.synget(bw.DEF.VIEW_MODEL);
	var fields = model.synget(bw.DEF.MODEL_FIELDS);
	var iter =  1000;
	var cols = {};

	fields.forEach(function (field) {
		var id = field.synget(bw.DEF.ATTR_ID);
		var col = data.columns[id] || {};
		cols[id] = {
			id: id,
			name: field.synget(bw.DEF.ATTR_NAME),
			visible: ('visible' in col) ? col.visible : true,
			width: _.isNumber(col.width) ? col.width : (10 + Math.ceil(Math.random()*100)),
			order: col.order || iter ++
		};
	});
	data.columns = enumerate(cols);
	data.columnList = _.sortBy(_.values(data.columns), 'order');
	view.set(bw.DEF.VIEW_DATA, data);
	return view;
}

export default prepView;