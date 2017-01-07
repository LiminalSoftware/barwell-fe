import modelActionCreators from '../actions/modelActionCreators';
import $ from "jquery";
import _ from 'underscore'

var Promise = require('es6-promise').Promise;

$.ajaxSetup({
    headers: {"Prefer": 'return=representation'}
});

var MAX_RETRIES = 5
var INITIAL_WAIT = 100

var stripInternalVars = module.exports.stripInternalVars = function (obj) {
  var newObj = {}
  Object.keys(obj).forEach(function (key) {
    if (key.slice(0,1) !== '_') newObj[key] = obj[key];
  });
  return newObj;
}

var wait = module.exports.wait = function () {
  return new Promise (function (resolve, reject) {
    window.setTimeout(resolve, 0);
  })
}


var ajax = module.exports.ajax  = function ({method, url, json, retry, headers}) {
  return wait().then(function () {
    return ajaxActual(method, url, json, retry, headers)
  })
}

var ajaxActual = function (method, url, json, retry, headers) {
  console.log(method + '->' + url)
  console.log(JSON.parse(json))

  retry = retry || 1;
  return new Promise(function (resolve, reject) {
    var params = {
      type: method,
      url: url,
      beforeSend: function (xhr) {
        _.each(headers, function (value, key) {
          xhr.setRequestHeader(key, value)
        })
      },
      success: function (data, status, xhr) {
        console.log('ajax success')
        resolve({
          data: data,
          status: status,
          xhr: xhr
        })
      },
      error: function (xhr, error, status) {
        if (error === 'timeout') {
          if (retry++ >= MAX_RETRIES) return
          console.log('timeout, trying again: ' + retry)
          $.ajax(this);
        } else {
          console.log('xhr: '+ JSON.stringify(xhr, null, 2));
          reject(status)
        }
      }
    };
    if (json) {
      params.data = json
      params.contentType = 'application/json'
    }
    $.ajax(params)
  })
}

var issueReceipt = function (subject, obj) {
  store.dispatch({
    type: subject.toUpperCase() + '_RECEIVE',
    [subject]: obj
  })
}
