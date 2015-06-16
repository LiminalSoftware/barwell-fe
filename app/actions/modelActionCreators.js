import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import webUtils from "../util/MetasheetWebAPI"

module.exports = {

	fetchModels: function() {
		webUtils.getAllModels();
	},

	createModel: function(model) {
		if (!model) model = {}
		
		MetasheetDispatcher.dispatch({
			actionType: 'MODEL_CREATE',
			model: model
		});
		webUtils.createModel(model);
	},

	createView: function(view) {
		if (!model) model = {}
		
		MetasheetDispatcher.dispatch({
			actionType: 'VIEW_CREATE',
			view: view
		});
		webUtils.createView(view);
	},

	createAttribute: function(attribute) {
		if (!attribute) attribute = {}
		
		MetasheetDispatcher.dispatch({
			actionType: 'ATTRIBUTE_CREATE',
			attribute: attribute
		});
		webUtils.createAttribute(attribute);
	}

};
