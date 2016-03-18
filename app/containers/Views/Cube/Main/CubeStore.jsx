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
import constants from '../../../../constants/MetasheetConstants'
import reducers from './reducers'

const DELIMITER = constants.delimiter

var createCubeStore = function (view, dimensions) {

    var model = ModelStore.get (view.model_id)
    var label = 'v' + view.view_id
    var upperLabel = label.toUpperCase ()
    var modelLabel = 'm' + model.model_id
    var modelUpperLabel = modelLabel.toUpperCase()

    var _dimensions = {
        row: view.row_aggregates,
        column: view.column_aggregates,
    }
    var _sortSpec = view.data.sortSpec
    var _levels = {
        row: [],
        column: []
    }
    var _count = {
        row: null,
        column: null
    }
    var _startIndex = {
        row: null,
        column: null
    }
    var _requestedStartIndex = {
        row: null,
        column: null
    }
    var _isCurrent = {
        row: false,
        column: false
    }
    var _dirty = true
    var _values = []
    var _rowDimensions
    var _colDimensions


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
            return _count[dimension] || 0
        },

        getDimensions: function (dimension) {
          return _dimensions[dimension]
        },

        getAllDimensions: function () {

        },

        getLevels: function (dimension, from, to) {
            return _.map(_levels[dimension].slice(from, to), _.clone)
        },

        getLevel: function (dimension, at) {
            at = Math.min(at, _levels[dimension].length - 1)
            return _.clone(_levels[dimension][at])
        },

        setStart: function (dimension, offset) {
            _startIndex[dimension] = offset
        },

        getStart: function (dimension) {
            return _startIndex[dimension]
        },

        isViewCurrent: function () {
          return !_dirty
        },

        isLevelCurrent: function () {
            return (_isCurrent.row && _isCurrent.column)
        },

        getValue: function (i, j) {
            var row = _values[i]
            if (!(row instanceof Array)) return null
            return _values[i][j]
        },

        unregister: function () {
          dispatcher.unregister(this.dispatchToken)
        },



        dispatchToken: dispatcher.register(function (payload) {
            var type = payload.actionType

            if (type === 'VIEW_CREATE' && payload.view.view_id === view.view_id) {
                console.log('view_create')
                _dirty = payload.view._dirty;
                _values = [];
                _dimensions.row = payload.view.row_aggregates;
                _dimensions.column = payload.view.column_aggregates;
                _sortSpec = view.data.sortSpec

                _isCurrent.row = false;
                _isCurrent.column = false;
            }

            if (type === (modelUpperLabel + '_UPDATE') || type === (modelUpperLabel + '_RECEIVEUPDATE')) {
              var dimensions = _dimensions.row.concat(_dimensions.column).filter(_.identity)
              var _this = this
              var update = payload.update
              var selector = payload.selector
              var dirty = {
                  _dirty: (type === (upperLabel + '_UPDATE'))
              }
              var values = _.values(_values)
              var rows = _levels.row
              var cols = _levels.column
              var matcher = _.matcher(selector)
              var reducer = reducers[view.aggregator + 'ReducerFactory']('a' + view.value)

              _.filter(values, matcher).map(function (rec) {
                  _.extend(rec, update, dirty)
              });

              _.filter(rows, matcher).map(rec => _.extend(rec, update, dirty))
              _levels.row = row

              _.filter(cols, matcher).map(rec => _.extend(rec, update, dirty))
              _levels.column = cols

              _values = {}
              values.forEach(function (val) {
                var key = dimensions.map(function (dim) {
                    return val['a' + dim]
                }).join(DELIMITER)
                if (key in _values) _values[key] = reducer(_values[key], val)
                else _values[key] = val
              })

              CubeStore.emitChange()
            }

            if (type === modelUpperLabel + '_CREATE') {
                var dimensions = _dimensions.row.concat(_dimensions.column).filter(_.identity)
                var val = payload.record
                var index = payload.index

                var key = dimensions.map(function (dim) {
                    return val['a' + dim]
                }).join(DELIMITER)

                

                if (key in _values) _values[key] = reducer(_values[key], val)
                else _values[key] = val

                CubeStore.emitChange()
            }

            if (type === upperLabel + '_RECEIVELEVELS') {
                var _this = this
                var dimension  = payload.dimension
                var groups = _dimensions[dimension].map(g => 'a' + g)
                _levels[dimension] = payload.levels
                _count[dimension] = payload.numberLevels
                // console.log('payload.numberLevels: ' + payload.numberLevels)
                _isCurrent[dimension] = true

                CubeStore.emitChange()
            }

            if (type === upperLabel + '_REQUESTVALUES') {
                _startIndex.row = payload.startIndex.row
                _startIndex.column = payload.startIndex.column
            }

            if (type === upperLabel + '_RECEIVEVALUES') {
                var _this = this
                var values = payload.values
                var idx = 0
                var current = {}
                _values = new Array(_levels.row.length)

                
                for (var i = 0; i < _levels.row.length && idx < values.length; i++) {
                    Object.assign(current, _levels.row[i])
                    var column = new Array(_levels.column.length)
                    for (var j = 0; j < _levels.column.length && idx < values.length; j++) {
                        Object.assign(current, _levels.column[j])
                        var cmp = util.compare(current, values[idx], _sortSpec)
                        if (cmp >= 0) column[j] = values[idx++]
                        else column[j] = null
                    }
                    _values[i] = column
                }
                
                CubeStore.emitChange()
            }

        })
    })

    return CubeStore;
}


export default createCubeStore
