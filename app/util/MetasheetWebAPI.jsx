import modelActionCreators from '../actions/modelActionCreators';
import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import $ from "jquery";
import _ from 'underscore'
import util from './util'

var Promise = require('es6-promise').Promise;

let persistBacklog = []

$.ajaxSetup({
    headers: {"Prefer": 'return=representation'}
});

var MAX_RETRIES = 2
var INITIAL_WAIT = 100
var BASE_URL = 'http://api.metasheet.io'

var stripInternalVars = module.exports.stripInternalVars = function (obj) {
  var newObj = {}
  Object.keys(obj).forEach(function (key) {
    if (key.slice(0, 1) !== '_') newObj[key] = obj[key];
  });
  return newObj;
}



var ajax = module.exports.ajax = function ({method, url, json, headers}) {
  console.log(method + '->' + url);
  console.log(JSON.parse(json));
  
  return util.wait(0).then(function () {
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
        resolve({
          data: data,
          status: status,
          xhr: xhr
        })
      },
      error: function (xhr, error, status) {
        console.log('===========')
        console.log(xhr)
        console.log(error)
        console.log(status)
        console.log('===========')

        if (error && error.statusText === 'error') {
          if ('notification_key' in retry)
            modelActionCreators.updateNotification({
              notification_key: retry.notification_key, 
              statusMessage: 'Couldn\'t reach server, trying again in a bit'});
          retry.period = retry.period * 2;
          retry.tries = (retry.tries || 1) + 1
          setTimeout(ajax.bind(null, method, url, json, retry, headers), retry.period)
        }
        else {
          if ('notification_key' in retry)
            modelActionCreators.updateNotification({
                notification_key: retry.notification_key, 
                status: 'error',
                statusMessage: ('Error: ' + status)});
          reject(xhr.responseJSON);
        }
      }
    };
    if (json) {
      params.data = json
      params.contentType = 'application/json'
    }
    $.ajax(params)
  })
  })
}
