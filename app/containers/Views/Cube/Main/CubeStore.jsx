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

import calcSpans from './calcSpans'

var DELIMITER = constants.delimiter

var createCubeStore = function (view, dimensions) {
    var model = ModelStore.get (view.model_id)
    var label = 'v' + view.view_id
    var upperLabel = label.toUpperCase ()
    var modelLabel = 'm' + model.model_id
    var modelUpperLabel = modelLabel.toUpperCase()

    var _dimensions = {
        rows: view.row_aggregates,
        columns: view.column_aggregates
    }
    var _levels = {
        rows: [],
        columns: []
    }
    var _count = {
        rows: null,
        columns: null
    }
    var _startIndex = {
        rows: null,
        columns: null
    }
     var _requestedStartIndex = {
        rows: null,
        columns: null
    }
    var _isCurrent = {
        rows: false,
        columns: false
    }
    var _dirty = true
    var _values = {}
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
            return _count[dimension]
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
            return (_isCurrent.rows && _isCurrent.columns)
        },

        getValues: function (row_indices, column_indices) {
            var indices = _.extend(row_indices, column_indices)

            var dimensions = _dimensions.rows.concat(_dimensions.columns).filter(_.identity)
            var key = dimensions.map(function (dim) {
                return indices['a' + dim]
            }).join(DELIMITER)

            return _values[key]
        },

        unregister: function () {
          dispatcher.unregister(this.dispatchToken)
        },

        dispatchToken: dispatcher.register(function (payload) {
            var type = payload.actionType

            if (type === 'VIEW_CREATE' && payload.view.view_id === view.view_id) {
                _dirty = payload.view._dirty
                _values = {}
                _dimensions.rows = payload.view.row_aggregates
                _dimensions.columns = payload.view.column_aggregates
                _isCurrent.rows = false
                _isCurrent.columns = false
            }

            if (type === (modelUpperLabel + '_UPDATE') || type === (modelUpperLabel + '_RECEIVEUPDATE')) {
              var dimensions = _dimensions.rows.concat(_dimensions.columns).filter(_.identity)
              var _this = this
              var update = payload.update
              var selector = payload.selector
              var dirty = {
                  _dirty: (type === (upperLabel + '_UPDATE'))
              }
              var values = _.values(_values)
              var rows = _levels.rows
              var cols = _levels.columns
              var matcher = _.matcher(selector)
              var reducer = reducers[view.aggregator + 'ReducerFactory']('a' + view.value)

              _.filter(values, matcher).map(function (rec) {
                  _.extend(rec, update, dirty)
              });

              _.filter(rows, matcher).map(rec => _.extend(rec, update, dirty))
              _levels.rows = rows

              _.filter(cols, matcher).map(rec => _.extend(rec, update, dirty))
              _levels.columns = cols

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
                var dimensions = _dimensions.rows.concat(_dimensions.columns).filter(_.identity)
                var val = payload.record
                var index = payload.index

                var key = dimensions.map(function (dim) {
                    return val['a' + dim]
                }).join(DELIMITER)

                console.log('key: ' + key)

                if (key in _values) _values[key] = reducer(_values[key], val)
                else _values[key] = val

                CubeStore.emitChange()
            }

            if (type === upperLabel + '_RECEIVELEVELS') {
                var _this = this
                var dimension  = payload.dimension
                var groups = _dimensions[dimension].map(g=>'a'+g)
                _levels[dimension] = calcSpans(payload.levels, groups)
                _count[dimension] = payload.numberLevels
                _isCurrent[dimension] = true

                CubeStore.emitChange()
            }

            if (type === upperLabel + '_REQUESTVALUES') {
                _startIndex.rows = payload.startIndex.rows
                _startIndex.columns = payload.startIndex.columns
            }

            if (type === upperLabel + '_RECEIVEVALUES') {
                console.log('receivevalues')
                var _this = this
                var values = payload.values
                var dimensions = _dimensions.rows.concat(_dimensions.columns).filter(_.identity)

                _values = _.indexBy(values, function (val) {
                    var key = dimensions.map(function (dim) {
                        return val['a' + dim]
                    }).join(DELIMITER)
                    return key
                })
                CubeStore.emitChange()
            }

        })
    })

    return CubeStore;
}


export default createCubeStore
