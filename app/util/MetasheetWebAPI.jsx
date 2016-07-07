import modelActionCreators from '../actions/modelActionCreators';
import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import $ from "jquery";
import _ from 'underscore'
import util from './util'

var Promise = require('es6-promise').Promise;

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



var ajax = module.exports.ajax = function (method, url, json, retry, headers) {
  console.log(method + '->' + url);
  console.log(JSON.parse(json));
  
  if (!(retry instanceof Object)) retry = {}
  if (!(retry.period > 0)) retry.period = 50
  
  return util.wait(Math.random() * (method === 'POST' ? 3000 : 1000) + (method === 'POST' ? 2000 : 0)).then(function () {
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

var issueReceipt = function (subject, obj, requestId) {
  var message = {}
  message.actionType = (subject.toUpperCase() + '_RECEIVE')
  message.requestId = requestId
  message[subject] = obj
  MetasheetDispatcher.dispatch(message)
}

var persist = module.exports.persist = function (subject, action, data, requestId) {
  action = action.toUpperCase()
  var identifier = (subject + '_id')
  var url = BASE_URL + '/' + subject;
  var json = (action === 'CREATE') ? JSON.stringify(stripInternalVars(data)) : null;
  var method;

  if (action === 'CREATE' && _.isEqual(data._server, stripInternalVars(data)) ) {
    console.log('object unchanged -- cancel persist')
    return wait();
  }

  if (action == 'FETCH') method = 'GET';
  else if (action == 'DESTROY') method = 'DELETE';
  else if (action === 'CREATE' && data[identifier]) method = 'PATCH'
  else if (action === 'CREATE') method = 'POST'
  else return;

  if (method === 'PATCH' || method === 'DELETE') url = url + '?' + identifier + '=eq.' + data[identifier];
  
  return ajax(method, url, json).then(function (results) {
    // if (update === false || method=='DELETE') return;  // temporary hack until I refactor model push
    (results.data instanceof Array ? results.data : [results.data]).forEach(function (obj) {
      issueReceipt(subject, obj, requestId)
    })
    return results.data
  }).catch(function (error) {
    
  })
}
