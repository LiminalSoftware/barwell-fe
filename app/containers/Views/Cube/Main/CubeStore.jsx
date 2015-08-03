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
import util from '../../../../util/util'

var createCubeLevelStore = function (view, dimensions) {
    var model = ModelStore.get (view.model_id)
    var label = 'v' + view.view_id + '_' + dimension
    var upperLabel = label.toUpperCase ()

    var _values = {}

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

        getValues: function (indices) {
            return _.clone(_values[indices.join(',')])
        },

        dispatchToken: dispatcher.register(function (payload) {
            var type = payload.actionType

            if (type === upperLabel + '_CREATE') {
                var object = payload.object
                var index = payload.index
                CubeLevelStore.emitChange()
            }

            if (type === upperLabel + '_RECEIVEVALUES') {
                var _this = this
                _values = payload.values
                
                CubeStore.emitChange()
            }

        })
    })

    return CubeStore;
}


export default createCubeStore