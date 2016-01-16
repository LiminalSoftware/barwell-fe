import _ from "underscore"
import AttributeStore from '../../../stores/AttributeStore'
import ModelStore from '../../../stores/ModelStore'
import RelationStore from '../../../stores/RelationStore'
import fieldTypes from '../fields'
import viewTypes from '../viewTypes'

import groomFields from '../groomFields'

var groomView = function (view) {
	var model = ModelStore.get(view.model_id);
	var data = view.data || {}
	if (!model) return view
	// var columns = data.columns = groomFields(view)

	var groupCleanser = function (group) {
		var field = AttributeStore.get(group)
		if (!field) return null
		return  field.attribute_id
	}

	if (!_.isObject(data.sorting)) data.sorting = {}

	data.geometry = _.extend({
		headerHeight: 29,
		rowHeight: 30,
		columnWidth: 100,
		rowPadding: 1,
		topOffset: 13,
		leftOffset: 3,
		widthPadding: 9,
		renderBufferRows: 40,
		renderBufferCols: 15,
		screenRows: 30,
		screenCols: 10,
		leftGutter: 3,
		bfrTol: 10,
	}
	// , data.geometry
	)

	var fields = AttributeStore.query({model_id: view.model_id});
	var relations = RelationStore.query({model_id: view.model_id});

	view.row_aggregates = (view.row_aggregates || []).map(groupCleanser).filter(_.identity);
	view.column_aggregates = (view.column_aggregates || []).map(groupCleanser).filter(_.identity);

	view.aggregator = view.aggregator ? view.aggregator.toLowerCase() : null;

	var sorting = data.sorting
	var newSort = {}
	_.each(sorting, function (value, key) {
		key = parseInt(key)
		if((_.contains(view.row_aggregates, key)
		|| _.contains(view.column_aggregates, key)) && key)
			newSort[key] = !!value
	})
	data.sorting = newSort
	// view.value = view.value
	// view.aggregator = view.aggregator



	return view
}

export default groomView;
