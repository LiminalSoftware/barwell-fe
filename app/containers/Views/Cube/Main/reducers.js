module.exports.sumReducerFactory = function (attribute) {
	return function (a, b) {
    a._count  = a._count + b._count
    a[attribute] = a[attribute] + b[attribute]
    return a
  }
}

module.exports.avgReducerFactory = function (attribute) {
  return function (a, b) {
    a[attribute] = (a[attribute] * a._count  + b[attribute] * b._count) / (a._count + b._count)
    a._count = a._count + b._count
    return a
  }
}
