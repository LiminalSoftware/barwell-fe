import _ from "underscore"
import AttributeStore from "../stores/AttributeStore"
import ModelStore from "../stores/ModelStore"
import RelationStore from "../stores/RelationStore"
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

var groomView = function (view) {
	if(!(view.type in viewTypes)) view.type = "Table"
	view.data = view.data || {}
	view.data.icon = viewTypes[view.type].icon
	var groomer = viewTypes[view.type].groomer
	return groomer(view)
}

export default groomView;