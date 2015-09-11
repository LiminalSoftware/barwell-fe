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
            return _.map(_records, _.clone);
        },

        getObject: function (at) {
            return _.map(_records[at - _startIndex], _.clone);
        },

        getRecordCount: function () {
            return _recordCount || 0;
        },

        unregister: function () {
          dispatcher.unregister(this.dispatchToken)
        },

        dispatchToken: dispatcher.register(function (payload) {
            var type = payload.actionType

            if (type === upperLabel + '_CREATE') {
                console.log('tabularstore create')
                console.log(payload)
                var object = payload.record
                var index = payload.index || 0
                _records =
                  _records.slice(0, index)
                  .concat(payload.record)
                  .concat(_records.slice(index))
                TabularStore.emitChange()
            }

            if (type === upperLabel + '_DESTROY') {
                var selector = payload.selector
                _records = _.reject(_records, _.matcher(selector) )
                TabularStore.emitChange()
            }

            if (type === (upperLabel + '_UPDATE') || type === (upperLabel + '_RECEIVEUPDATE')) {
              var _this = this
              var update = payload.update
              var selector = payload.selector
              var dirty = {
                  _dirty: (type === (upperLabel + '_UPDATE'))
              }
              _.filter(_records, _.matcher(selector) ).map(function (rec) {
                  rec = _.extend(rec, update, dirty)
              });
              TabularStore.emitChange()
            }

            if (type === (upperLabel + '_RECEIVE')) {
                var _this = this
                var objects = payload.records
                var startIndex = payload.startIndex
                var endIndex = payload.endIndex

                _records = payload[label]
                _recordCount = payload.recordCount
                _startIndex = payload.startIndex

                TabularStore.emitChange()
            }

            relations.forEach(function (rel) {
                var relLabel = 'm' + rel.related_model_id
                var relUpperLabel = relLabel.toUpperCase()

                if (type === relUpperLabel + '_UPDATE') {

                    _records.forEach(function (rec) {
                        var pp = payload
                        rec['r' + rel.relation_id] = _.reject(rec['r' + rel.relation_id], _.matcher(payload.selector))
                        if (_.isEqual(util.choose(rec, payload.localKeyAttrs), util.choose(payload.update, payload.relatedKeyAttrs))) {
                          rec['r' + rel.relation_id].push(_.extend(payload.relatedObject, payload.update))
                        }
                    })
                }
                TabularStore.emitChange()
            })

        })
    })

    return TabularStore;
}


export default createTabularStore
