import _ from "underscore"
import $ from 'jquery'
import assign from 'object-assign'
import EventEmitter from 'events'

import ModelStore from "../../../../stores/ModelStore"

import modelActionCreators from "../../../../actions/modelActionCreators"

import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

var createTabularStore = function (view) {
    var model = ModelStore.get (view.model_id)
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
            return _records;
        },

        dispatchToken: dispatcher.register(function (payload) {
            var type = payload.actionType

            if (type === (upperLabel + '_CREATE')) {
                var object = payload[label]
                var index = payload.index

                TabularStore.emitChange()
            }

            // if (type === (upperLabel + '_INSERT')) {
            //  var obj = payload[label]
            //  this.create(obj)
            // }

            if (type === (upperLabel + '_DESTROY')) {
                _records = _.filter(_records, function (rec) {
                    rec[model._pk] !== payload[label][model._pk]
                })

                TabularStore.emitChange()
            }

            if (type === (upperLabel + '_UPDATE') || type === (upperLabel + '_RECEIVEUPDATE')) {
                var _this = this
                var update = payload[label]
                var selector = payload.selector
                var dirty = {_dirty: (type === (upperLabel + '_UPDATE'))}
                
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
                _recordCount = payload.endIndex
                _startIndex = payload.startIndex
                               
                TabularStore.emitChange()
            }
        })
    })

    return TabularStore;
}


export default createTabularStore