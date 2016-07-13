import _ from "underscore"
import $ from 'jquery'
import assign from 'object-assign'
import EventEmitter from 'events'

import ModelStore from "../../../../stores/ModelStore"
import RelationStore from "../../../../stores/RelationStore"

import modelActionCreators from "../../../../actions/modelActionCreators"

import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'
import util from '../../../../util/util'
import constants from '../../../../constants/MetasheetConstants'
import reducers from './reducers'
import denormalize from './denormalize'
import normalize from './normalize'

const DELIMITER = constants.delimiter

var formKey = function (obj, levels) {
    return levels.map(l => obj['a' + l]).join(DELIMITER)
}

var createCubeStore = function (view, dimensions) {

    var model = ModelStore.get (view.model_id)
    var label = 'v' + view.view_id
    var upperLabel = label.toUpperCase ()
    var modelLabel = 'm' + model.model_id
    var modelUpperLabel = modelLabel.toUpperCase()

    var _dimensions = {
        row: [],
        column: []
    };

    var _requestedDimensions = {
        row: [],
        column: []
    }

    var _sortSpec = {
        row: view.data.rowSortSpec,
        column: view.data.columnSortSpec
    };

    var _levels = {
        row: [],
        column: []
    };

    var _startIndex = {
        row: null,
        column: null
    };
    var _requestedStartIndex = {
        row: null,
        column: null
    };
    
    var _values = [];


    var _getImpactedGroup = function (selector) {
        if (_dimensions.row.some(d => ('a' + d) in selector)) return 'row';
        else if (_dimensions.column.some(d => ('a' + d)  in selector)) return 'column';
        return null
    };

    var CubeStore = assign({}, EventEmitter.prototype, {

        emitChange: function () {
            this.emit('CHANGE_EVENT');
        },

        addChangeListener: function (callback) {
            this.on('CHANGE_EVENT', callback);
        },

        removeChangeListener: function (callback) {
            this.removeListener('CHANGE_EVENT', callback);
        },


        getCount: function (dimension) {
            return _levels[dimension].length
        },

        getDimensions: function (dim) {
          return _dimensions[dim]
        },

        getRequestedDimensions: function (dim) {
            return _requestedDimensions[dim]
        },

        getLevels: function (dimension, from, to) {
            return _.map(_levels[dimension].slice(from, to), _.clone)
        },

        getLevel: function (dimension, at) {
            at = Math.min(at, _levels[dimension].length - 1)
            return _.clone(_levels[dimension][at])
        },
        
        getStart: function (dimension) {
            return _startIndex[dimension]
        },


        getValue: function (selector) {
            var dimensions = _dimensions.row.concat(_dimensions.column).filter(_.identity);
            if (!(selector instanceof Object)) return null;
            var key = formKey(selector, dimensions);
            return _values[key];
        },

        getAllValues: function () {
            return _.values(__values)
        },

        unregister: function () {
          dispatcher.unregister(this.dispatchToken);
        },

        dispatchToken: dispatcher.register(function (payload) {
            var type = payload.actionType

            if (type === (modelUpperLabel + '_UPDATE') || type === (modelUpperLabel + '_RECEIVEUPDATE')) {
                var dimensions = _dimensions.row.concat(_dimensions.column).filter(_.identity);
                var _this = this;
                var update = payload.update;
                var selector = payload.selector;
                var dirty = {dirty: (type === (upperLabel + '_UPDATE'))};
                var matcher = _.matcher(selector);
                var levels;
                
                /***
                see which group is impacted (if any).  If any of the 
                dimensions are in the selector, then it is impacted
                ***/
                var impactedDim = _getImpactedGroup(selector);
                var impactedLevels = [];
                var combinedLevels = [];
                var unimpactedLevels = [];

                CubeStore.emitChange();
            }

            if (type === 'CUBE_REQUESTLEVELS') {
                var dimension  = payload.dimension
                _requestedDimensions[dimension] = payload.aggregates
            }

            if (type === 'CUBE_RECEIVELEVELS' && payload.view_id === view.view_id) {
                var dimension  = payload.dimension;
                var groups = _dimensions[dimension].map(g => 'a' + g);
                
                _dimensions[dimension] = payload.aggregates
                _levels[dimension] = payload.levels

                CubeStore.emitChange();
            }

            if (type === 'CUBE_REQUESTVALUES' && payload.view_id === view.view_id) {
                _startIndex.row = payload.startIndex.row;
                _startIndex.column = payload.startIndex.column;
                _values = {}
            }

            if (type === 'CUBE_RECEIVEVALUES' && payload.view_id === view.view_id) {
                var _this = this;
                var dimensions = _dimensions.row.concat(_dimensions.column).filter(_.identity);

                _values = {};
                (payload.values || []).forEach(function (v) {
                    var key = formKey(v, dimensions); // _levels.map(l => v[l]).join(DELIMITER)
                    _values[key] = v;
                })
                
                CubeStore.emitChange();
            }

        })
    })

    return CubeStore;
}


export default createCubeStore
