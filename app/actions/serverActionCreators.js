import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import modelActionCreators from '../actions/modelActionCreators';
import serverActionCreators from '../actions/serverActionCreators';
import $ from "jquery";


module.exports = {

  receiveModels: function(model) {
    MetasheetDispatcher.dispatch({
    	actionType: 'MODEL_RECEIVE',
    	model: model
    });
  },

  receiveAttributes: function(attribute) {
  	MetasheetDispatcher.dispatch({
  		actionType: 'ATTRIBUTE_RECEIVE',
  		attribute: attribute
  	})
  }

};
