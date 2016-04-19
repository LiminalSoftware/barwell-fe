import util from '../../../../util/util'

var normalize = function (values, _levels, _sortSpec) {
	var idx = 0;
	var current = {};
	var sortSpec = _sortSpec.row.concat(_sortSpec.column);
	var normalized = [];

	for (var i = 0; i < _levels.row.length && idx < values.length; i++) {
	    Object.assign(current, _levels.row[i]);
	    
	    for (var j = 0; j < _levels.column.length && idx < values.length; j++) {
	    	var val = values[i] ? values[i][j] : null;
	        if (val) normalized.push(val);
	    }
	}
	return normalized;
}

export default normalize;