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

var createCubeStore = function (view, dimensions) {

    var model = ModelStore.get (view.model_id)
    var label = 'v' + view.view_id
    var upperLabel = label.toUpperCase ()
    var modelLabel = 'm' + model.model_id
    var modelUpperLabel = modelLabel.toUpperCase()

    var _dimensions = {
        row: [],
        column: [],
    };
    var _sortSpec = {
        row: view.data.rowSortSpec,
        column: view.data.columnSortSpec
    };
    var _levels = {
        row: [],
        column: []
    };
    var _count = {
        row: null,
        column: null
    };
    var _startIndex = {
        row: null,
        column: null
    };
    var _requestedStartIndex = {
        row: null,
        column: null
    };
    var _isCurrent = {
        row: false,
        column: false,
        body: false
    };
    var _values = [];


    var _matchRange = function (dimension, selector) {
        var levels = _levels[dimension]
        var cmp
        var mid
        var hi
        var lo
        var lowerBound
        var upperBound
        
        // binary search for the lower bound
        cmp = -1
        hi = levels.length;
        lo = 0;
        while (cmp <= 0) {
            mid = lo + (hi - lo) / 2
            cmp = util.compare(levels[mid], selector, _sortSpec);
            if (cmp >= 0) hi = mid - 1;
            else lo = mid + 1;
        }
        lowerBound = lo

        // binary search for the upper bound
        cmp = 1;
        hi = levels.length;
        while (cmp >= 0) {
            mid = lo + (hi - lo) / 2
            cmp = util.compare(levels[mid], selector, _sortSpec);
            if (cmp <= 0) hi = mid - 1;
            else lo = mid + 1;
        }
        upperBound = hi

        return [lowerBound, upperBound];
    };

    var _getImpactedGroup = function (selector) {
        if (_dimensions.row.some(d => ('a' + d) in selector)) return 'row';
        else if (_dimensions.column.some(d => ('a' + d) in selector)) return 'column';
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

        isCurrent: function (dimension) {
            return _isCurrent[dimension]
        },

        getValue: function (i, j) {
            var row = _values[i]
            if (!(row instanceof Array)) return null;
            return _values[i][j];
        },

        unregister: function () {
          dispatcher.unregister(this.dispatchToken);
        },

        dispatchToken: dispatcher.register(function (payload) {
            var type = payload.actionType

            if (type === 'VIEW_CREATE' && payload.view.view_id === view.view_id) {
                ['row','column','body'].forEach(d => _isCurrent[d] = false);
            }

            if (type === (modelUpperLabel + '_UPDATE') || type === (modelUpperLabel + '_RECEIVEUPDATE')) {
                var dimensions = _dimensions.row.concat(_dimensions.column).filter(_.identity);
                var _this = this
                var update = payload.update
                var selector = payload.selector
                var dirty = {
                    _dirty: (type === (upperLabel + '_UPDATE'))
                }
                var matcher = _.matcher(selector)
                var levels
                var impactedDim = _getImpactedGroup(selector)
                var newLevels = [];
                var matchedLevels = [];
                var newValues = [];

                /***
                see which group is impacted (if any).  If any of the 
                dimensions are in the selector, then it is impacted
                ***/
                
                _values = _values.map(function(row) {
                    return row.map(function (rec, idx) {
                        if (matcher(rec)) return _.extend(rec, update, dirty);
                        else return rec;
                    });
                });
                
                CubeStore.emitChange();
            }

            if (type === modelUpperLabel + '_CREATE') {
                var dimensions = _dimensions.row.concat(_dimensions.column).filter(_.identity);
                var val = payload.record;
                var index = payload.index;

                CubeStore.emitChange();
            }

            if (type === upperLabel + '_RECEIVELEVELS') {
                var _this = this;
                var dimension  = payload.dimension;
                var groups = _dimensions[dimension].map(g => 'a' + g);
                
                _dimensions[dimension] = payload.aggregates;
                _levels[dimension] = payload.levels;
                _count[dimension] = payload.numberLevels;
                _isCurrent.body = false;
                _isCurrent[dimension] = true;

                CubeStore.emitChange();
            }

            if (type === upperLabel + '_REQUESTVALUES') {
                _startIndex.row = payload.startIndex.row;
                _startIndex.column = payload.startIndex.column;
            }

            if (type === upperLabel + '_RECEIVEVALUES') {
                var _this = this;
                var values = payload.values;
                var idx = 0;
                var current = {};
                var sortSpec = _sortSpec.row.concat(_sortSpec.column);
                _values = new Array(_levels.row.length);
                
                for (var i = 0; i < _levels.row.length && idx < values.length; i++) {
                    Object.assign(current, _levels.row[i])
                    var column = new Array(_levels.column.length)
                    for (var j = 0; j < _levels.column.length && idx < values.length; j++) {
                        Object.assign(current, _levels.column[j])
                        var cmp = util.compare(current, values[idx], sortSpec)
                        if (cmp >= 0) column[j] = values[idx++];
                        else column[j] = null;
                    }
                    _values[i] = column
                }
                _isCurrent.body = true
                
                CubeStore.emitChange()
            }

        })
    })

    return CubeStore;
}


export default createCubeStore
