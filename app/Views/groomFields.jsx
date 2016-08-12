import _ from "underscore"
import AttributeStore from "../stores/AttributeStore"
import ModelStore from "../stores/ModelStore"
import RelationStore from "../stores/RelationStore"
import fieldTypes from './fields'

var BIG_NUM = 10000000;


var groomColumn = function (col) {

}

var groomFields = function (view) {
	var data = view.data
	var fields = AttributeStore.query({model_id: view.model_id});
	var model = ModelStore.get(view.model_id)
	var relations = RelationStore.query({model_id: view.model_id})
	var iter =  BIG_NUM;
	var oldColumns = data.columns || {}
	var columns = {}

	fields.forEach(function (field) {
		var id = field.cid || field.attribute_id
   		var fieldType = fieldTypes[field.type] || {}
		var col = oldColumns['a' + id] || {}
		var existing = ('a' + id) in oldColumns

		
		col.column_id = 'a' + id;
		col.attribute_id = id;
		col.type = field.type
		col.name = field.attribute
		col.sorting = null
		if ('configCleanser' in fieldType) col = fieldType.configCleanser(col)

		if (!col.align)
    		col.align = fieldType.defaultAlign || 'left'
		

		col.visible = existing ? (!!col.visible) : (!fieldType.defaultHidden);
		col.fixed = existing ? (col.fixed && col.visible) : (!fieldType.defaultHidden && field.attribute_id === model.label_attribute_id);
		col.style = existing ? (col.style) : (field.attribute_id === model.label_attribute_id) ? ('bold') : 'none';
		if (col.style !== 'bold' && col.style !== 'italic' && col.style !== 'none') col.style = 'none';
		col.width = Math.floor(
			(existing ? 
				Math.max(_.isNumber(col.width) ? col.width : 0, 50) : 
				(fieldType.defaultWidth || 100)) / 2
			) * 2;
		columns[col.column_id] = col;
	})

	relations.forEach(function (relation) {
		var id = relation.cid || relation.relation_id
		var col = oldColumns['r' + id] || {};
		var existing = ('r' + id) in oldColumns

		var attrs = AttributeStore.query({model_id: relation.related_model_id});
		var relatedModel = ModelStore.get(relation.related_model_id)
		var pk =  (relatedModel || {}).pk;

		col.column_id = 'r' + id

		if (!col.align) col.align = 'left'
		
		col.related_model_id = relation.related_model_id
		col.relation_id = id
		col.related_relation_id = relation.related_relation_id
		col.related_key_id = relation.related_key_id
		col.key_id = relation.key_id

		if (relatedModel) col.label = col.label || ('a' + relatedModel.label_attribute_id)
		if (relation.relation_id) col.relation_id = relation.relation_id;
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
