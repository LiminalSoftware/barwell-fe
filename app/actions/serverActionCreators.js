import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import modelActionCreators from '../actions/modelActionCreators';
import serverActionCreators from '../actions/serverActionCreators';
import $ from "jquery";


module.exports = {

  receiveModels: function(models) {
    MetasheetDispatcher.dispatch({
    	actionType: 'MODEL_RECEIVE',
    	model: models
    });
    models.forEach(function (model) {
    	MetasheetDispatcher.dispatch({
	    	actionType: 'ATTRIBUTE_RECEIVE',
	    	attribute: model.attributes
	    });	
      MetasheetDispatcher.dispatch({
        actionType: 'KEY_RECEIVE',
        attribute: model.keys
      });
      MetasheetDispatcher.dispatch({
        actionType: 'VIEW_RECEIVE',
        attribute: model.views
      }); 
    })
  },

  receiveAttributes: function(attribute) {
  	MetasheetDispatcher.dispatch({
  		actionType: 'ATTRIBUTE_RECEIVE',
  		attribute: attribute
  	})
  },

  receiveViews: function(views) {
    MetasheetDispatcher.dispatch({
    	actionType: 'VIEW_RECEIVE',
    	view: views
    });
  },

};
