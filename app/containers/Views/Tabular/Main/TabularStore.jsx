import _ from "underscore"
import $ from 'jquery'
import assign from 'object-assign'
import EventEmitter from 'events'
import util from "../../../../util/util"

import ModelStore from "../../../../stores/ModelStore"
import RelationStore from "../../../../stores/RelationStore"


import modelActionCreators from "../../../../actions/modelActionCreators"
import choose from "../../../../util/util"
import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

var createTabularStore = function (view) {
    var model = ModelStore.get (view.model_id)
    var relations = RelationStore.query({model_id: view.model_id})
    var label = 'm' + view.model_id
    var upperLabel = label.toUpperCase ()

    var _records = []
    var _recordCount = null
    var _startIndex = 0
    var _iterator = 0
    var _sortKey = []
    var stickyRecs = []

    var TabularStore = assign({}, EventEmitter.prototype, {

        getClientId: function () {
          return 'c' + (_iterator++)
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

        getObject: function (at) {
            return _.clone(_records[at - _startIndex]);
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
          dispatcher.unregister(this.dispatchToken)
        },

        compare: function (a, b) {
          for (var i = 0; i < _sortKey.length; i++) {
            var key = _sortKey[i].attribute_id
            var inversion = _sortKey[i].descending ? 1 : -1
            if (a[key] < b[key]) return (1 * inversion)
            if (a[key] > b[key]) return (-1 * inversion)
          }
          return 0
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
            var type = payload.actionType

            if (type === upperLabel + '_CREATE') {
                var object = payload.record
                var index 
                if (payload.index) {
                  index = payload.index

                } else {
                  index = this.search(object)
                }
                _records =
                  _records.slice(0, index)
                  .concat(payload.record)
                  .concat(_records.slice(index))
                _recordCount++
                TabularStore.emitChange()
            }

            if (type === upperLabel + '_DESTROY') {
                var selector = payload.selector
                _recordCount--
                _records = _.reject(_records, _.matcher(selector) )
                TabularStore.emitChange()
            }

            if (type === (upperLabel + '_UPDATE') || type === (upperLabel + '_RECEIVEUPDATE')) {
              var _this = this
              var update = payload.update
              var selector = payload.selector
              var patch = {
                  _dirty: (type === (upperLabel + '_UPDATE'))
              }
              if (type === (upperLabel + '_RECEIVEUPDATE')) patch._server = update

              var updater = function (rec) {
                  return 
              }
              var matcher =  _.matcher(selector)
              _records.forEach(function(rec, idx) {
                if (matcher(rec)) _records[idx] = _.extend(_.clone(rec), update, patch)
              })
              TabularStore.emitChange()
            }

            if (type === (upperLabel + '_REVERT')) {
              var _this = this
              var update = payload.update
              var selector = payload.selector
              var patch = {
                  _dirty: false
              }
              var updater = function (rec) {
                  return 
              }
              var matcher =  _.matcher(selector)
              _records.forEach(function(rec, idx) {
                if (matcher(rec)) _records[idx] = _.extend(_.clone(rec), rec._server, patch)
              })
              TabularStore.emitChange()

              // we want to set the error flag only momentarily, then clear it
              // setTimeout(function() {
              //   _records.forEach(function(rec, idx) {
              //     patch._error = false
              //     if (matcher(rec)) _records[idx] = _.extend(_.clone(rec), rec._server, patch)
              //   })
              //   TabularStore.emitChange()
              // }, 100)
            }

            if (type === (upperLabel + '_RECEIVE')) {
              var _this = this
              var objects = payload.records
              var startIndex = payload.startIndex
              var endIndex = payload.endIndex

              _records = payload[label]
              _recordCount = payload.recordCount
              _startIndex = payload.startIndex

              _records.map(function (rec) {
                rec._server = _.clone(rec)
                return rec
              })

              TabularStore.emitChange()
            }

            // this is crazy, but for now, loop through all the relations and 
            relations.forEach(function (rel) {
                var relLabel = 'm' + rel.related_model_id
                var relUpperLabel = relLabel.toUpperCase()

                if (type === relUpperLabel + '_UPDATE') {
                    _records.forEach(function (rec) {
                        var pp = payload
                        // filter the bubble out of its previous locaiton
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
