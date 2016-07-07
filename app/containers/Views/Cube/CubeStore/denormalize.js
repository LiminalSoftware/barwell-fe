import util from '../../../../util/util'

var denormalize = function (values, _levels, _sortSpec) {
	var idx = 0;
	var current = {};
	var sortSpec = _sortSpec.row.concat(_sortSpec.column);
	var denormalized = new Array(_levels.row.length);

	for (var i = 0; i < _levels.row.length && idx < values.length; i++) {
	    Object.assign(current, _levels.row[i]);
	    var column = new Array(_levels.column.length);
	    
	    for (var j = 0; j < _levels.column.length && idx < values.length; j++) {
	        Object.assign(current, _levels.column[j]);
	        var cmp = util.compare(sortSpec, current, values[idx]);
	        if (cmp >= 0) column[j] = values[idx++];
	        else column[j] = null;
	    }
	    denormalized[i] = column;
	}
	return denormalized;
}

export default denormalize;