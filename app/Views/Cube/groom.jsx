import _ from "underscore"
import AttributeStore from "../../stores/AttributeStore"
import ModelStore from "../../stores/ModelStore"
import RelationStore from "../../stores/RelationStore"
import fieldTypes from '../fields'
import viewTypes from '../viewTypes'
import util from "../../util/util"

import groomFields from '../groomFields'

var groomView = function (view) {
	var model = ModelStore.get(view.model_id);
	var data = view.data || {}
	var columns = data.columns = groomFields(view)
	var columnList = data._columnList = util.enumerate(_.values(columns), util.sortByOrder)
	var fields = AttributeStore.query({model_id: view.model_id});
	var relations = RelationStore.query({model_id: view.model_id});
	var ptr = data.pointer || {};

	view.row_aggregates = columnList.filter(c => c.groupByRow).map(c => c.attribute_id);
	view.column_aggregates = columnList.filter(c => c.groupByColumn).map(c => c.attribute_id);
	view.aggregate_values = columnList.filter(c => c.inTableBody).map(function(attr) {
		if (!attr.aggregator) attr.aggregator = 'list';
		// fields[attr.column_id].aggregator = 'list';
		
		return {
			value: 'a' + attr.attribute_id,
			aggregator: attr.aggregator
		}
	});
	// view.aggregator = view.aggregator ? view.aggregator.toLowerCase() : null;

	data.rowSortSpec = view.row_aggregates.map(function (d) {
        return {'attribute': 'a' + d, 'descending': columns['a' + d].descending}
    });
    data.columnSortSpec = view.column_aggregates.map(function (d) {
        return {'attribute': 'a' + d, 'descending': columns['a' + d].descending}
    });
    
	if(!(data.geometry instanceof Object)) data.geometry = {}
	data.geometry = _.extend({
		labelWidth: 30,
		rowHeight: Math.min(Math.max(data.geometry.rowHeight || 30, 35), 80),
		columnWidth: 100
	}, {})

	view.data = data

	return view
}

export default groomView;
