import modelActionCreators from '../actions/modelActionCreators';
import serverActionCreators from '../actions/serverActionCreators';
import $ from "jquery";
import _ from 'underscore'


$.ajaxSetup({
    headers: {"Prefer": 'return=representation'}
});

var stripInternalVars = function (obj) {
  var newObj = {}
  Object.keys(obj).forEach(function (key) {
    if (key.slice(0,1) !== '_') newObj[key] = obj[key];
  });
  return newObj;
}

module.exports = {
  
  persist: function (subject, action, data) {
    action = action.toUpperCase()
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
    return new Promise(function (resolve, reject) {
      $.ajax({
        type: method,
        url: url,
        data: json,
        contentType: 'application/json',
        success: function (obj, status, xhr) {
          var f = serverActionCreators[success]
          if (f) f(obj)
          resolve(obj)
        },
        error: function (xhr, error, status) {
          console.log('xhr: '+ JSON.stringify(xhr, null, 2));
          console.log('error: '+ JSON.stringify(error, null, 2));
          console.log('status: '+ JSON.stringify(status, null, 2));
          var f = serverActionCreators[success]
          if (f) f(status)
          reject(status)
        }
      })
    })
    
  }
};
