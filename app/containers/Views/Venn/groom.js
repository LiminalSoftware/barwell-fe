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
	var data = view.data = view.data || {};

	var columns = groomFields(view)
	var columnList = util.enumerate(_.values(columns), util.sortByOrder)

	data.columns = columns
	data.columnList = columnList

	view.row_aggregates = columnList.filter(c => c.groupByCategory && c.type === 'BOOLEAN').map(c => c.attribute_id)
	view.column_aggregates = []
	view.aggregate_values = [{value: model._pk, aggregator: 'count'}]

	data.rowSortSpec = view.row_aggregates.map(function (d) {
        return {'attribute': 'a' + d, 'descending': false}
    });

	return view;
}

export default groomView;
