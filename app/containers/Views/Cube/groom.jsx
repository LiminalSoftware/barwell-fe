import _ from "underscore"
import AttributeStore from '../../../stores/AttributeStore'
import ModelStore from '../../../stores/ModelStore'
import RelationStore from '../../../stores/RelationStore'
import fieldTypes from '../fields'
import viewTypes from '../viewTypes'
import util from "../../../util/util"

import groomFields from '../groomFields'

var groomView = function (view) {
	var model = ModelStore.get(view.model_id);
	var data = view.data || {}
	var columns = data.columns = groomFields(view)
	var columnList = data.columnList = util.enumerate(_.values(columns), util.sortByOrder)

	if (!_.isObject(data.sorting)) data.sorting = {}

	data.geometry = _.extend({
		rowHeight: 30,
		colWidth: 100,
	})

	var fields = AttributeStore.query({model_id: view.model_id});
	var relations = RelationStore.query({model_id: view.model_id});

	view.row_aggregates = columnList.filter(c => c.groupByRow).map(c => c.attribute_id);
	view.column_aggregates = columnList.filter(c => c.groupByColumn).map(c => c.attribute_id);
	view.value = _.first(columnList.filter(c => c.inTableBody).map(c => c.attribute_id))
	// view.aggregator = view.aggregator ? view.aggregator.toLowerCase() : null;

	return view
}

export default groomView;
