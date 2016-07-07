import _ from "underscore"
import $ from 'jquery'
import assign from 'object-assign'
import EventEmitter from 'events'
import util from "../../../../util/util"

import ModelStore from "../../../../stores/ModelStore"
import RelationStore from "../../../../stores/RelationStore"

import choose from "../../../../util/util"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'
import processUpdates from './processUpdates'

import getGuid from '../../../../stores/getGuid'


var createTabularStore = function (view) {
  var model = ModelStore.get(view.model_id)
  var _state = {
    records: [],
    selection: {},
    recordCount: null,
    sortSpec: null,
    startIndex: 0,
    endIndex: null
  }

  var TabularStore = assign({}, EventEmitter.prototype, {

    getClientId: function () {
      return 'c' + (getGuid());
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

    getSelection: function () {
      return _state.selection;
    },

    getSelectedRecords: function () {
      return Object.keys(_state.selection).map(k => _state.selection[k])
    },

    getObjects: function (from, to) {
      if (from !== null && to !== null)
        return _state.records.slice(from - _state.startIndex, to - _state.startIndex);
    },

    getObject: function (at) {
        return _state.records[at - _state.startIndex];
    },

    getRecordCount: function () {
        return _state.recordCount || 0;
    },

    getRange: function () {
      return {
        start: _state.startIndex, 
        end: _state.endIndex
      }
    },

    unregister: function () {
      dispatcher.unregister(this.dispatchToken);
    },

    indexOf: function(array, obj, iteratee, context) {
      var low = 0;
      var high = _state.records.length;
      while (low < high) {
        var mid = Math.floor((low + high) / 2);
        if (this.compare(_state.records[mid], obj)) low = mid + 1; else high = mid;
      }
      return low;
    },

    isInRange: function (rec) {
      var gtLowerBound = util.compare(_state.sortSpec, rec, _state.records[0])
      var ltUpperBound = util.compare(_state.sortSpec, rec, _state.records[_state.records.length])

      return gtLowerBound > 0 && ltUpperBound < 0
    },

    dispatchToken: dispatcher.register(function (action) {
      var type = action.actionType;

      if (action.model_id !== model.model_id) return;

      switch (type) {

        case 'VIEW_CREATE':
          if (action.view.view_id = view.view_id)
          _state.sortSpec = action.view.data.sorting
          this.emitChange()
          break;

        case 'VIEW_RECEIVE':
          var view = action.view
          this.emitChange()
          break;

        case 'RECORD_TOGGLESELECT':
          var id = action.id;
          // TODO check if this object is even in the list?
          var object = _state.records.filter(r => r.cid === id || r[model._pk] === id)[0]
          if (id in _state.selection) delete _state.selection[id];
          else _state.selection[id] = object;
          break;

        case 'UNSELECT':
          _state.selection = {}
          break;

        case 'RECORD_INSERT':
          var object = action.data || {}
          var index = action.index
          object._outoforder = true
          _state.records = _state.records.slice(0, index)
            .concat(action.data)
            .concat(_state.records.slice(index));
          _state.recordCount++;
          break;

        case 'RECORD_REORDER':
          var index = action.index
          var objects = action.data || [];
          var dict = _.indexBy(objects, model._pk);
          _state.records = _state.records.filter(function (rec, idx) {
            if (rec[model._pk] in dict && idx < index) index--;
            return !(rec[model._pk] in dict)
          })
          objects.map(rec => rec._outoforder = true);
          _state.records = _state.records.slice(0, index)
            .concat(objects)
            .concat(_state.records.slice(index));
          break;

        case 'RECORD_BATCHUPDATE':
        case 'RECORD_BATCHDELETE':
          var selector = action.selector
          // _recordCount -= something TODO
          // _records =_records.map(function (rec) {
          //   if (selector(rec)) rec._destroy = true;
          //   return rec;
          // });
          // _records = _.reject(_records, _.matcher(selector) )
          break;

        case 'RECORD_RECIEVEFETCH':
          var objects = action.records
          var startIndex = action.startIndex
          var endIndex = action.endIndex

          _state.records = objects
          _state.recordCount = action.recordCount
          _state.startIndex = action.startIndex
          _state.endIndex = (action.recordCount + action.startIndex)

          _state.records.map(function (rec) {
            rec._server = _.clone(rec)
            return rec
          })
          break;

        case 'REVERT_ACTION':
          var actionCid = action.cid
          var errorCells
          _state.records = _state.records.map(function (rec) {
            var affected
            if (rec._pendingActions) {
              rec._pendingActions = rec._pendingActions.filter(function (pendingAction) {
                if (pendingAction.cid === action.cid) {
                  affected = pendingAction
                  return false;
                }
                else return true
              });
              return _.extend.apply(undefined, [{}, rec._server, affected ? {_error: affected} : {}].concat(rec._pendingActions));
            }
            else return rec;
          })
          setTimeout(function () {
            _state.records = _state.records.map(function (rec) {
              if (rec._error) {
                var newrec = _.clone(rec)
                delete newrec._error
                return newrec
              }
              return rec
            });
            TabularStore.emitChange();
          }, 0);
        break;

        case 'RECORD_MULTIUPDATE':
        case 'RECORD_MULTIDELETE':
          var dict = _.indexBy(action.data, model._pk);
          var cdict = _.indexBy(action.data, 'cid');
          var matcher = function (rec) {
            if (rec[model._pk] && (rec[model._pk] in dict)) return dict[rec[model._pk]]
            else if (rec.cid && rec.cid in cdict) return cdict[rec.cid]
          }
          _state = processUpdates(_state, matcher, !action.isClean, action.cid)
          break;
      }
      TabularStore.emitChange();
      
      // this is crazy, but for now, loop through all the relations and update related items
      // RelationStore.query({model_id: view.model_id}).forEach(function (rel) {
      //     var relLabel = 'm' + rel.related_model_id

      //     if (type === relUpperLabel + '_UPDATE') {
      //       _state.records.forEach(function (rec) {
      //           var pp = action
      //           // filter the bubble out of its previous location
      //           rec['r' + rel.relation_id] = _.reject(rec['r' + rel.relation_id], _.matcher(action.selector))
      //           // add it to its new home
      //           if (_.isEqual(util.choose(rec, action.hasManyKeyAttrs), util.choose(action.update, action.hasOneKeyAttrs))) {
      //             rec['r' + rel.relation_id].push(_.extend(action.hasOneObject, action.update))
      //           }
      //       })
      //       TabularStore.emitChange()
      //     }
      //   })
      })
    })

    return TabularStore;
}


export default createTabularStore
