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
      url: 'https://api.metasheet.io/model',
      contentType: 'application/json',
      success: serverActionCreators.receiveModels,
      failure: serverActionCreators.receiveModels
    })
  },

  createModel: function (model) {
    $.ajax({
      type: 'PUT',
      url: 'https://api.metasheet.io/model',
      data: JSON.stringify(model),
      dataType: "json",
      contentType: 'application/json',
      success: serverActionCreators.receiveModels,
      failure: serverActionCreators.receiveModels
    })
  },

  createView: function (view) {
    $.ajax({
      type: 'PUT',
      url: 'https://api.metasheet.io/view',
      data: view,
      contentType: 'application/json',
      success: serverActionCreators.receiveViews,
      failure: serverActionCreators.receiveViews
    })
  },

  createAttribute: function (attribute) {
    $.ajax({
      type: 'PUT',
      url: 'https://api.metasheet.io/model',
      data: model,
      contentType: 'application/json',
      success: serverActionCreators.receiveAttributes,
      failure: serverActionCreators.receiveAttributes
    })
  },

};
