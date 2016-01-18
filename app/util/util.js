var _ = require('underscore')
import tinycolor from "tinycolor2"

// fix javascript modulo bug
Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

module.exports.lighten = function (color, lightness) {
  var hsl = (!!color) ? tinycolor(color).toHsl() : tinycolor("white")
  hsl.l = Math.max(hsl.l, lightness)
  // hsl.s = Math.max(hsl.l, 0.8)
  return tinycolor(hsl).toRgbString()
}

var stripInternalVars = module.exports.stripInternalVars = function (obj) {
  var newObj = {}
  Object.keys(obj || {}).forEach(function (key) {
    if (key.slice(0,1) !== '_') newObj[key] = obj[key];
  });
  return newObj;
}

module.exports.encode = function (str) {
  return str.split('').map(function (char) {
    return char.charCodeAt(0)
  }).join('.')
}

module.exports.sum = function (arr, prop) {
  return arr.map(a => a[prop]).reduce((a,b) => (a + b), 0)
}

module.exports.sequence = function (start, stop, howMany) {
  var a = []
  for (var i = start; i < stop; i += ((stop - start)/(howMany + 0.0000000000001))) {
      a.push(i);
  }
  return a;
}

module.exports.numSort = function (a, b) {
  return a - b
}

module.exports.sortByOrder = function (a, b) {
  return a.order - b.order
}

module.exports.clean = function (obj) {
	obj._dirty = false
	obj._server = stripInternalVars(obj)
	return obj
}

module.exports.enumerate = function (list, comparator) {
  list.sort(comparator)
	return list.map(function(item, i) {
		item.order = i
		return item
	})
}

var limit = module.exports.limit = function (min, max, value) {
	if (value < min) return min
	if (value > max) return max
	else return value
}

var clickTrap = module.exports.clickTrap = function (event) {
  event.stopPropagation()
  event.nativeEvent.stopImmediatePropagation();
}

module.exports.choose = function (obj, keys) {
	return keys.map(function (key) {
		return obj[key]
	})
}

module.exports.returnFalse  = function() {
	return false;
}
