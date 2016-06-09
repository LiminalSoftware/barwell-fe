import _ from "underscore"
import AttributeStore from '../../stores/AttributeStore'
import ModelStore from '../../stores/ModelStore'
import RelationStore from '../../stores/RelationStore'
import fieldTypes from './fields'

var BIG_NUM = 10000000;

var groomFields = function (view) {
	var data = view.data
	var fields = AttributeStore.query({model_id: view.model_id});
	var model = ModelStore.get(view.model_id)
	var relations = RelationStore.query({model_id: view.model_id})
	var iter =  BIG_NUM;
	var oldColumns = data.columns || {}
	var columns = {}

	fields.forEach(function (field) {
   		var fieldType = fieldTypes[field.type] || {}
		var col = oldColumns['a' + field.attribute_id]
		var existing = !!col
		col = col || {}
		col.column_id = 'a' + (field.attribute_id || field.cid);
		col.attribute_id = field.attribute_id || field.cid;
		col.type = field.type
		col.name = field.attribute
		col.sorting = null
		if ('configCleanser' in fieldType) col = fieldType.configCleanser(col)

		if (!col.align) {
    		if('defaultAlign' in fieldType) col.align = fieldType.defaultAlign
			else col.align = 'left'
		}
		col.visible = existing ? (!!col.visible) : (!field.hidden);
		col.fixed = existing ? (col.fixed && col.visible) : (!field.hidden && field.attribute_id === model.label_attribute_id);
		col.style = existing ? (col.style) : (col.style = 'none');
		col.width = existing ? Math.max(_.isNumber(col.width) ? col.width : 0, 50) : (fieldType.defaultWidth || 100);
		columns[col.column_id] = col;
	})

	relations.forEach(function (relation) {
		var col = oldColumns['r' + relation.relation_id] || {};
		var attrs = AttributeStore.query({model_id: relation.related_model_id});
		var relatedModel = ModelStore.get(relation.related_model_id)
		var pk =  (relatedModel || {}).pk;
		if (!col.align) col.align = 'left'
		col.column_id = 'r' + relation.relation_id
		col.related_model_id = relation.related_model_id
		col.relation_id = relation.relation_id
		col.related_relation_id = relation.related_relation_id
		col.related_key_id = relation.related_key_id
		col.key_id = relation.key_id
		if (relatedModel) col.label = col.label || ('a' + relatedModel.label_attribute_id)
		// col.label = col.label || ('a' + attrs[0].attribute_id)
		col.relation_id = relation.relation_id;
		col.type = relation.type
		col.name = relation.relation
		col.visible = !!col.visible
		col.fixed = !!col.fixed && col.visible
		col.width = Math.max(_.isNumber(col.width) ? col.width : 0, 50)
		columns[col.column_id] = col
	})

  	return columns
}

export default groomFields
