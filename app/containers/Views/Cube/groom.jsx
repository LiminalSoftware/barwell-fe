import _ from "underscore"
import AttributeStore from '../../../stores/AttributeStore'
import ModelStore from '../../../stores/ModelStore'
import RelationStore from '../../../stores/RelationStore'
import fieldTypes from '../fields'
import viewTypes from '../viewTypes'




var groomView = function (view) {
	var model = ModelStore.get(view.model_id);
	var columns = {}
	var data = view.data || {};
	if (!model) return view;

	var groupCleanser = function (group) {
		var field = AttributeStore.get(group)
		if (!field) return null
		return  field.attribute_id
	}

	delete data.columns;
	delete data.columnList;
	delete data.sorting;

	var fields = AttributeStore.query({model_id: view.model_id});
	var relations = RelationStore.query({model_id: view.model_id});

	view.row_aggregates = (view.row_aggregates || []).map(groupCleanser).filter(_.identity);
	view.column_aggregates = (view.column_aggregates || []).map(groupCleanser).filter(_.identity);

	// view.value = view.value
	// view.aggregator = view.aggregator

	return view
}

export default groomView;