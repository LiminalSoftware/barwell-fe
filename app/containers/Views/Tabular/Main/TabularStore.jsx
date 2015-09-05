import _ from "underscore"
import $ from 'jquery'
import assign from 'object-assign'
import EventEmitter from 'events'

import ModelStore from "../../../../stores/ModelStore"
import RelationStore from "../../../../stores/RelationStore"

import modelActionCreators from "../../../../actions/modelActionCreators"

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

    var TabularStore = assign({}, EventEmitter.prototype, {

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

        getRecordCount: function () {
            return _recordCount || 0;
        },

        dispatchToken: dispatcher.register(function (payload) {
            var type = payload.actionType

            if (type === upperLabel + '_CREATE') {
                var object = payload[label]
                var index = payload.index
                var rec = _records[index]
            }

            // if (type === (upperLabel + '_INSERT')) {
            //  var obj = payload[label]
            //  this.create(obj)
            // }

            if (type === upperLabel + '_DESTROY') {
                _records = _.filter(_records, function (rec) {
                    rec[model._pk] !== payload[label][model._pk]
                })
                TabularStore.emitChange()
            }

            if (type === (upperLabel + '_INSERT')) {
              var position = payload.position
              _records =
                _records.slice(0, position)
                .concat(payload.record)
                .concat(_records.slice(position))
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
                var objects = payload[label]
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
                        var relatedRecords = rec['r' + rel.relation_id]
                    })
                }
            })

        })
    })

    return TabularStore;
}


export default createTabularStore
