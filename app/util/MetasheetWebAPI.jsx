import modelActionCreators from '../actions/modelActionCreators';
import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import $ from "jquery";
import _ from 'underscore'
import util from './util'

var Promise = require('es6-promise').Promise;

const MAX_RETRIES = 2
const INITIAL_WAIT = 25
const BASE_URL = 'https://api.metasheet.io'


// FIFO stack of actions that may have failed to persist
let persistBacklog = []
let retryDelay = 25

$.ajaxSetup({
    headers: {"Prefer": 'return=representation'}
});

const backlogRetry = function () {
  const params = persistBacklog.shift()
  ajax(params)
}


var ajax = module.exports.ajax = function (_params) {
  const {method, url, json, headers} = _params
  console.log(method + '->' + url);
  console.log(JSON.parse(json));
  
  return util.wait(1).then(function () {
    return new Promise(function (resolve, reject) {
    var settings = {
      type: method,
      url: url,
      beforeSend: function (xhr) {
        _.each(headers, function (value, key) {
          xhr.setRequestHeader(key, value)
        })
      },
      success: function (data, status, xhr) {
        retryDelay = INITIAL_WAIT
        resolve({
          data: data,
          status: status,
          xhr: xhr
        })
        modelActionCreators.clearNotification({notification_key: 'connectivity'});
      },
      error: function (xhr, error, status) {
        const {readyState, status: xhrStatus, statusText: xhrStatusText} = xhr
        console.log('===========')
        console.log(xhr)
        console.log('===========')

        if (xhrStatusText === 'error') {
          console.log('connectivity error')

          modelActionCreators.updateNotification({
            notification_key: 'connectivity',
            icon: 'icon-warning',
            narrative: 'Server is temporarily unavailable'});
          
          persistBacklog.push(_params)
          retryDelay *= 2
          setTimeout(backlogRetry, retryDelay)
        }
      }
    };
    if (json) {
      settings.data = json
      settings.contentType = 'application/json'
    }
    $.ajax(settings)
  })
  })
}
