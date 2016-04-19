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
            cmp = util.compare(_sortSpec, levels[mid], selector);
            if (cmp >= 0) hi = mid - 1;
            else lo = mid + 1;
        }
        lowerBound = lo

        // binary search for the upper bound
        cmp = 1;
        hi = levels.length;
        while (cmp >= 0) {
            mid = lo + (hi - lo) / 2
            cmp = util.compare(_sortSpec, levels[mid], selector);
            if (cmp <= 0) hi = mid - 1;
            else lo = mid + 1;
        }
        upperBound = hi

        return [lowerBound, upperBound];
    };

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

                // normalize the values array so that we can reduce similar entries
                var values = normalize(_values, _levels, _sortSpec).map(function (rec, idx) {
                    if (matcher(rec)) return _.extend(rec, update, dirty);
                    else return rec;
                });

                // pull any impacted levels out of the main level array and apply the update
                _levels[impactedDim].forEach(function (level) {
                    if (matcher(level)) {
                        level = _.extend(level, update);
                        impactedLevels.push(level);
                    } else unimpactedLevels.push(level);
                });

                // sort the impacted levels
                impactedLevels.sort(util.compare.bind(_sortSpec[impactedDim]));

                // merge the impacted levels back into the original levels array
                _levels[impactedDim] = util.merge(_sortSpec[impactedDim], (a,b) => a, unimpactedLevels, impactedLevels);

                _values = denormalize(values, _levels, _sortSpec);
                
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
                _values = denormalize(values, _levels, _sortSpec);
                _isCurrent.body = true;
                
                CubeStore.emitChange();
            }

        })
    })

    return CubeStore;
}


export default createCubeStore
