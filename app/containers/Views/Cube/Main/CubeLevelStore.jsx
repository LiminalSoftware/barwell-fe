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

var createCubeLevelStore = function (view, dimension) {
    var model = ModelStore.get (view.model_id)
    var label = 'v' + view.view_id + '_' + dimension
    var upperLabel = label.toUpperCase ()

    var _levels = []
    var _levelCount = null
    var _startIndex = 0

    var CubeLevelStore = assign({}, EventEmitter.prototype, {

        _levels: _levels,

        emitChange: function () {
            this.emit('CHANGE_EVENT');
        },

        addChangeListener: function (callback) {
            this.on('CHANGE_EVENT', callback);
        },

        removeChangeListener: function (callback) {
            this.removeListener('CHANGE_EVENT', callback);
        },

        getLevels: function (from, to) {
            return _.map(_levels, _.clone)
        },

        dispatchToken: dispatcher.register(function (payload) {
            var type = payload.actionType

            if (type === upperLabel + '_CREATE') {
                var object = payload.object
                var index = payload.index
                CubeLevelStore.emitChange()
            }

            if (type === upperLabel + '_RECEIVELEVELS') {
                var _this = this
                var objects = payload[label]
                var startIndex = payload.startIndex
                var endIndex = payload.endIndex

                _levels = payload.levels
                _levelCount = payload.endIndex
                _startIndex = payload.startIndex
                
                CubeLevelStore.emitChange()
            }

        })
    })

    global.cls = global.cls || [];
    cls.push(CubeLevelStore)

    return CubeLevelStore;
}


export default createCubeLevelStore