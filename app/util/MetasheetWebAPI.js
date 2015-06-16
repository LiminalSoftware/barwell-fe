import modelActionCreators from '../actions/modelActionCreators';
import serverActionCreators from '../actions/serverActionCreators';
import $ from "jquery";

$.ajaxSetup({
    headers: {"Prefer": 'return=representation'}
});

module.exports = {
  
  getAllModels: function () {
    $.ajax({
      type: 'GET',
      url: 'api.metasheet.io/model',
      contentType: 'application/json',
      success: serverActionCreators.receiveModels,
      failure: serverActionCreators.receiveModels
    })
  },

  createModel: function (model) {
    $.ajax({
      type: 'PUT',
      url: 'api.metasheet.io/model',
      data: model,
      contentType: 'application/json',
      success: serverActionCreators.receiveModels,
      failure: serverActionCreators.receiveModels
    })
  },

  createAttribute: function (attribute) {
    $.ajax({
      type: 'PUT',
      url: 'api.metasheet.io/attribute',
      data: model,
      contentType: 'application/json',
      success: serverActionCreators.receiveAttributes,
      failure: serverActionCreators.receiveAttributes
    })
  },

};
