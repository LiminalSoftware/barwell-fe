import modelActionCreators from '../actions/modelActionCreators';
import serverActionCreators from '../actions/serverActionCreators';
import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import $ from "jquery";
import _ from 'underscore'
  
$.ajaxSetup({
    headers: {"Prefer": 'return=representation'}
});

var MAX_RETRIES = 5
var INITIAL_WAIT = 100

var stripInternalVars = function (obj) {
  var newObj = {}
  Object.keys(obj).forEach(function (key) {
    if (key.slice(0,1) !== '_') newObj[key] = obj[key];
  });
  return newObj;
}

var ajax = function (method, url, json, retry) {
  retry = retry || 1;
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: method,
      url: url,
      data: json,
      contentType: 'application/json',
      success: function (obj, status, xhr) {
        resolve(obj)
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
    })
  })
}

module.exports = {
  
  persist: function (subject, action, data) {
    action = action.toUpperCase()
    var retryCount = 0
    var identifier = (subject + '_id')
    var url = 'https://api.metasheet.io/' + subject;
    var camelSubject = subject.slice(0,1).toUpperCase() + subject.slice(1,100) + 's'
    var camelAction = action.slice(0,1).toUpperCase() + action.slice(1,100).toLowerCase()
    var success = 'successfully' + camelAction + camelSubject
    var failure = 'failTo' + camelAction + camelSubject
    var json = (action === 'CREATE') ? JSON.stringify(stripInternalVars(data)) : null;
    var method;

    if (action == 'FETCH') method = 'GET';
    else if (action == 'DESTROY') method = 'DELETE';
    else if (action === 'CREATE' && data[identifier]) method = 'PATCH'
    else if (action === 'CREATE') method = 'POST'
    else return;
    
    if (method === 'PATCH' || method === 'DELETE') url = url + '?' + identifier + '=eq.' + data[identifier];

    console.log(method + '->' + url)
    console.log(data)
    return ajax(method, url, json).then(function (results) {
      (_.isArray(results) ? results : [results]).forEach(function (obj) {
        var message = {}
        message.actionType = (subject.toUpperCase() + '_RECEIVE')
        message[subject] = obj
        MetasheetDispatcher.dispatch(message)
      });
    });
  }

};
