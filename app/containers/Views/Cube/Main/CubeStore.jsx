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

import calcSpans from './calcSpans'

var DELIMITER = constants.delimiter
//
// var calcSpans = function (levels, groups) {
//   var spans = {}
//   groups.forEach(g => spans['a' + g] = 1)
//   return levels.map(function (level, idx) {
//     var isBroken
//     level.spans = {}
//     groups.forEach(function (g) {
//       g = 'a' + g
//       spans[g]--
//       if (spans[g] > 0) return level.spans[g] = 0
//       else while (idx + spans[g] < levels.length
//         && levels[idx][g] === levels[idx + spans[g] - 1] [g]) spans[g]++
//       level.spans[g] = spans[g]
//     })
//     return level
//   })
// }

var createCubeStore = function (view, dimensions) {
    var model = ModelStore.get (view.model_id)
    var label = 'v' + view.view_id
    var upperLabel = label.toUpperCase ()
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
                if (!_.isEqual(payload.view.row_aggregates, _dimensions.rows) ||
                    !_.isEqual(payload.view.column_aggregates, _dimensions.columns)) {
                    _values = {}
                }
                _dimensions.rows = payload.view.row_aggregates
                _dimensions.columns = payload.view.column_aggregates

                _isCurrent.rows = false
                _isCurrent.columns = false
            }

            if (type === upperLabel + '_CREATE') {
                var object = payload.object
                var index = payload.index
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
