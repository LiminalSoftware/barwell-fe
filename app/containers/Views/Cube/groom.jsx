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
		return  group
	}

	delete data.columns;
	delete data.columnList;
	delete data.sorting;

	var fields = AttributeStore.query({model_id: view.model_id});
	var relations = RelationStore.query({model_id: view.model_id});

	data.rowGroups = (data.rowGroups || []).map(groupCleanser).filter(_.identity);
	data.columnGroups = (data.columnGroups || []).map(groupCleanser).filter(_.identity);

	view.row_aggregates = data.rowGroups
	view.column_aggregates = data.columnGroups

	view.data = data

	return view
}

export default groomView;