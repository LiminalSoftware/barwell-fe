import modelActionCreators from '../actions/modelActionCreators';
import serverActionCreators from '../actions/serverActionCreators';
import $ from "jquery";
import _ from 'underscore'


$.ajaxSetup({
    headers: {"Prefer": 'return=representation'}
});

module.exports = {

  persist: function (subject, action, data) {
    var identifier = (subject + '_id')
    var url = 'https://api.metasheet.io/' + subject;
    var camelSubject = subject.slice(0,1).toUpperCase() + subject.slice(1,100) + 's'
    var camelAction = action.slice(0,1).toUpperCase() + action.slice(1,100).toLowerCase()
    var success = 'successfully' + camelAction + camelSubject
    var failure = 'failTo' + camelAction + camelSubject
    var json = (action === 'CREATE') ? JSON.stringify(data) : null;
    var method;

    if (action == 'FETCH') method = 'GET';
    else if (action == 'DESTROY') method = 'DELETE';
    else if (action === 'CREATE' && data[identifier]) method = 'PATCH'
    else if (action === 'CREATE') method = 'POST'
    else return;
    
    if (method === 'PATCH' || method === 'DELETE') url = url + '?' + identifier + '=eq.' + data[identifier];

    $.ajax({
      type: method,
      url: url,
      data: json,
      contentType: 'application/json',
      success: serverActionCreators[success],
      error: serverActionCreators[failure]
    })
  }

};
