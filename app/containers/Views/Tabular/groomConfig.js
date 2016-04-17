import _ from "underscore"
import AttributeStore from '../../../stores/AttributeStore'
import ModelStore from '../../../stores/ModelStore'
import RelationStore from '../../../stores/RelationStore'
import fieldTypes from '../fields'
import util from "../../../util/util"

var groom = function (config) {
	var view = ViewStore.get(config.view_id);
	var model = ModelStore.get(view.model_id);
	var data = config;

	
}

export default groom;
