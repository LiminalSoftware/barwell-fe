var consolidate = function (levels, group) {
	var result = [];
	var prev = null;
	var span = 1;
	var value;
	
	levels.forEach(function (level) {
		value = level['a' + group]

		if (value === prev) {
			span ++;
		} else {
			result.push({level: value, span: span})
			prev = value
			span = 1
		}
	});
	result.push({level: value, span: span})
	// console.log(result)
	return result
}

export default consolidate