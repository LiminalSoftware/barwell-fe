import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import modelActionCreators from '../actions/modelActionCreators';
import serverActionCreators from '../actions/serverActionCreators';
import $ from "jquery";


module.exports = {

  successfullyFetchModels: function(models) {
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
        key: model.keys
      });
      MetasheetDispatcher.dispatch({
        actionType: 'VIEW_RECEIVE',
        view: model.views
      });
      model.keys.forEach(function(key) {
        if (key.components) MetasheetDispatcher.dispatch({
          actionType: 'KEYCOMP_RECEIVE',
          keycomp: key.components
        });
      });
    })
  },

  failToCreateModels: function (message) {
    console.log('message: '+ JSON.stringify(message, null, 2));
  },

  failToDestroyModels: function (message) {
    console.log('message: '+ JSON.stringify(message, null, 2));
  },

  failToFetchModels: function (message) {
    console.log('message: '+ JSON.stringify(message, null, 2));
  },

  successfullyFetchAttributes: function(attribute) {
  	MetasheetDispatcher.dispatch({
  		actionType: 'ATTRIBUTE_RECEIVE',
  		attribute: attribute
  	})
  },

  successfullyCreateAttributes: function(attribute) {
    MetasheetDispatcher.dispatch({
      actionType: 'ATTRIBUTE_RECEIVE',
      attribute: attribute
    })
  },

  failToFetchAttributes: function (message) {
    console.log('message: '+ JSON.stringify(message, null, 2));
  },

  successfullyFetchViews: function(views) {
    MetasheetDispatcher.dispatch({
    	actionType: 'VIEW_RECEIVE',
    	view: views
    });
  },

  successfullyCreateViews: function(views) {
    MetasheetDispatcher.dispatch({
      actionType: 'VIEW_RECEIVE',
      view: views
    });
  },

  failToCreateViews: function (message) {
    console.log('message: '+ JSON.stringify(message, null, 2));
  }

};
