import _ from "underscore"
import $ from 'jquery'
import assign from 'object-assign'
import EventEmitter from 'events'
import util from "../../../../util/util"

import ModelStore from "../../../../stores/ModelStore"
import RelationStore from "../../../../stores/RelationStore"


import modelActionCreators from "../../../../actions/modelActionCreators"
import choose from "../../../../util/util"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

var createTabularStore = function (view) {
  var model = ModelStore.get (view.model_id)
  var relations = RelationStore.query({model_id: view.model_id})
  var label = 'm' + view.model_id
  var upperLabel = label.toUpperCase ()

  var _records = [];
  var _recordsById = {};
  var _selection = {};

  var _recordCount = null;
  var _startIndex = 0;
  var _iterator = 0;
  var _sortKey = [];
  var stickyRecs = [];

  var TabularStore = assign({}, EventEmitter.prototype, {

    getClientId: function () {
      return 'c' + (_iterator++);
    },

    emitChange: function () {
      this.emit('CHANGE_EVENT');
    },

    addChangeListener: function (callback) {
      this.on('CHANGE_EVENT', callback);
    },

    removeChangeListener: function (callback) {
      this.removeListener('CHANGE_EVENT', callback);
    },

    getObjects: function (from, to) {
      if (from !== null && to !== null)
        return _records.slice(from - _startIndex, to - _startIndex);
    },

    getSelection: function () {
      return _selection;
    },

    getSelectedRecords: function () {
      return _records.filter(r => r.cid in _selection || r[model._pk] in _selection)
    },

    getObject: function (at) {
        return _records[at - _startIndex];
    },

    getRecordCount: function () {
        return _recordCount || 0;
    },

    getRange: function () {
      return {
        start: _startIndex, 
        end: _startIndex + _records.length
      }
    },

    unregister: function () {
      dispatcher.unregister(this.dispatchToken);
    },

    compare: function (a, b) {
      for (var i = 0; i < _sortKey.length; i++) {
        var key = _sortKey[i].attribute_id
        var inversion = _sortKey[i].descending ? 1 : -1
        if (a[key] < b[key]) return (1 * inversion)
        if (a[key] > b[key]) return (-1 * inversion)
      }
      return 0;
    },

    indexOf: function(array, obj, iteratee, context) {
      var low = 0;
      var high = _records.length;
      while (low < high) {
        var mid = Math.floor((low + high) / 2);
        if (this.compare(_records[mid], obj)) low = mid + 1; else high = mid;
      }
      return low;
    },

    dispatchToken: dispatcher.register(function (payload) {
      var type = payload.actionType;

      if (payload.model_id !== model.model_id) return;

      switch(type) {
        case 'RECORD_TOGGLESELECT':
          var id = payload.id;
          // TODO check if this object is even in the list?
          var object = _records.filter(r => r.cid === id || r[model._pk] === id)[0]
          if (id in _selection) delete _selection[id];
          else _selection[id] = object;
          break;
        case 'UNSELECT':
          _selection = {}
          break;

        case 'RECORD_INSERT':
          var object = payload.object || {}
          var index = ('index' in payload) ? payload.index : this.search(object)
          _records = _records.slice(0, index)
            .concat(payload.object)
            .concat(_records.slice(index));
          _recordCount++
          break;

        case 'RECORD_BATCHDELETE':
          var selector = payload.selector
          // _recordCount -= something TODO
          _records = _.reject(_records, _.matcher(selector) )
          break;

        case 'RECORD_UPDATE':
        case 'RECORD_RECEIVE':
          var _this = this
          var update = payload.object
          var selector = payload.selector
          var isDirty = true;
          var matcher =  _.matcher(payload.selector);
          _records.forEach(function(rec, idx) {
            var clientPrecedent = (update._requestOrder > rec._requestOrder);

            if (matcher(rec) && (update.action_id > rec.action_id || !rec.action_id))
                _records[idx] = _.extend(_.clone(rec), update, {_dirty: isDirty, _requestOrder: payload.requestOrder}, isDirty ? null : {_server: update})
          })
          break;

        case 'RECORD_RECIEVEFETCH':
          var objects = payload.records
          var startIndex = payload.startIndex
          var endIndex = payload.endIndex

          _records = objects
          _recordCount = payload.recordCount
          _startIndex = payload.startIndex

          _records.map(function (rec) {
            rec._server = _.clone(rec)
            return rec
          })
          break;

        case 'RECORD_MULTIUPDATE':
        case 'RECORD_MULTIRECIEVE':
        case 'RECORD_MULTIDELETE':
          console.log('multi stuff')
          var newRecords = []
          var dict = _.indexBy(payload.patches, model._pk);
          var cdict = _.indexBy(payload.patches, 'cid');
          var isDirty = !payload.isClean;

          _records.forEach(function (rec, idx) {
            var newrec
            if (rec[model._pk] && (rec[model._pk] in dict))
              newrec = _.extend(_.clone(rec), dict[rec[model._pk]], {_dirty: isDirty});
            
            else if (rec.cid && rec.cid in cdict)
              newrec = _.extend(_.clone(rec), cdict[rec.cid], {_dirty: isDirty});
            else newrec = rec;
            
            // if the action includes a deletion flag don't include it in the new record list
            if (newrec.action !== 'D') newRecords.push(newrec);
            else {
              delete _selection[newrec.cid];
              delete _selection[newrec[model._pk]];
              _recordCount--;
            }
          });
          _records = newRecords;
          break;
      }
      TabularStore.emitChange();
      

      // this is crazy, but for now, loop through all the relations and update related items
      relations.forEach(function (rel) {
          var relLabel = 'm' + rel.related_model_id
          var relUpperLabel = relLabel.toUpperCase()

          if (type === relUpperLabel + '_UPDATE') {
            _records.forEach(function (rec) {
                var pp = payload
                // filter the bubble out of its previous location
                rec['r' + rel.relation_id] = _.reject(rec['r' + rel.relation_id], _.matcher(payload.selector))
                // add it to its new home
                if (_.isEqual(util.choose(rec, payload.hasManyKeyAttrs), util.choose(payload.update, payload.hasOneKeyAttrs))) {
                  rec['r' + rel.relation_id].push(_.extend(payload.hasOneObject, payload.update))
                }
            })
            TabularStore.emitChange()
          }
        })
      })
    })

    return TabularStore;
}


export default createTabularStore
