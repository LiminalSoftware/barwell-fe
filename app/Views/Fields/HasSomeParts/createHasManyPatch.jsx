import _ from "underscore"
import ModelStore from '../../../stores/ModelStore'
import RelationStore from '../../../stores/RelationStore'
import KeycompStore from '../../../stores/KeycompStore'
import KeyStore from '../../../stores/KeyStore'

export default function (relationId, thisObj, relObj) {
	var relation = RelationStore.get(relationId)
	var hasOneRelation = RelationStore.get(relation.type === 'HAS_ONE' ? 
		relation.relation_id : relation.related_relation_id)
	var hasManyRelation = RelationStore.get(relation.type === 'HAS_ONE' ? 
		relation.related_relation_id : relation.relation_id)
	var hasOneObj = relation.type === 'HAS_MANY' ? relObj : thisObj
	var hasManyObj = relation.type === 'HAS_MANY' ? thisObj : relObj
	var hasOneKey = KeyStore.get(hasOneRelation.key_id)
	var hasManyKey = KeyStore.get(hasManyRelation.key_id)
	var hasOneModel = ModelStore.get(hasOneKey.model_id)
	var hasOneKeycomps = KeycompStore.query({key_id: hasOneKey.key_id})
	var hasManyKeycomps = KeycompStore.query({key_id: hasManyKey.key_id})

	var pk = hasOneModel._pk
	var patch = {[pk]: hasOneObj[pk]}

	var hasOneKeyAttrs = []
	var hasManyKeyAttrs = []

	hasManyKeycomps.forEach((kc, i) => {
		var rkcId = 'a' + hasOneKeycomps[i].attribute_id
		var kcId =  'a' + kc.attribute_id
		hasOneKeyAttrs.push(rkcId)
		hasManyKeyAttrs.push(kcId)
		patch[rkcId] = hasManyObj[kcId]
	})

	patch['r' + hasOneRelation.relation_id] = _.clone(hasOneObj)

	return patch
}
