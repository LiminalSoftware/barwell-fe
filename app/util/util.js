var _ = require('underscore')
var tinycolor = require("tinycolor2")

var wait = module.exports.wait = function (duration) {
  return new Promise (function (resolve, reject) {
    window.setTimeout(resolve, duration);
  })
}

// fix javascript modulo bug
Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

module.exports.cidNum = function (cid) {
  return parseInt(cid.substr(1))
}

module.exports.makePercent = function (num) {
  return _.isNumber(num) ? 
    Math.round(num * 10000) / 100 + '%'
    : num
}


module.exports.lighten = function (color, lightness) {
  var hsl = (!!color) ? tinycolor(color).toHsl() : tinycolor("white")
  hsl.l = Math.max(hsl.l, lightness)
  return tinycolor(hsl).toRgbString()
}

var stripInternalVars = module.exports.stripInternalVars = function (obj) {
  if (obj instanceof Array) return obj.map(stripInternalVars)
  var newObj = {}
  Object.keys(obj || {}).forEach(function (key) {
    if (key.slice(0,1) !== '_' && key.slice(0,1) !== 'r') newObj[key] = obj[key];
  });
  return newObj;
}

var isDirty = module.exports.isDirty = function (obj) {
  if (!obj._server) return true
  return Object.keys.some(function (key) {
    if (key.substr(0,1) === '_') return true
    else return (obj[key] === obj._server[key])
  })
}

module.exports.clean = function (obj) {
  obj._dirty = false
  obj._server = stripInternalVars(obj)
  return obj
}


module.exports.addOffset = function (a, b) {
  return {
    left: a.left + (b.left || 0),
    width: a.width + (b.width || 0),
    top: a.top + (b.top || 0),
    height: a.height + (b.height || 0),
  }
}

module.exports.subtractOffset = function (a, b) {
  return {
    left: a.left - (b.left || 0),
    width: a.width - (b.width || 0),
    top: a.top - (b.top || 0),
    height: a.height - (b.height || 0),
  }
}

var compare = module.exports.compare = function (sortSpec, a, b) {
    for (var i = 0; i < sortSpec.length; i++) {
        var key = sortSpec[i].attribute;
        var inversion = sortSpec[i].descending ? 1 : -1;

        // if ((a[key] === null || a[key] === undefined) && 
          // (b[key] === null || b[key] === undefined)) continue;
        
        if (a[key] === null || a[key] === undefined) return (1 * inversion);
        if (b[key] === null || b[key] === undefined) return (-1 * inversion);
        if (_.isString(a[key]) && _.isString(b[key])) {
          var strCmp = String(a[key]).localeCompare(b[key]);
          if (strCmp !== 0) return strCmp;
        }
        if (a[key] < b[key]) return (1 * inversion);
        if (a[key] > b[key]) return (-1 * inversion);
    }
    return 0;
}

var merge = module.exports.merge = function (sortSpec, reducer, a, b) {
    var result = [];
    var i = 0;
    var j = 0;

    while (i < a.length && j < b.length) {
      if (compare(sortSpec, a[i], b[j]) < 0)
        result.push(a[i++]);
      else if (compare(sortSpec, a[i], b[j]) > 0)
        result.push(b[j++]);
      else if (reducer)
        result.push(reducer(a[i++], b[j++]));
      else
        result.push(a[i++], b[j++])
    }

    while (i < a.length)  
        result.push(a[i++]);

    while (j < b.length)    
        result.push(b[j++]);

    return result;
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
  for (var i = start; i < stop; i += ((stop - start)/(howMany) + 0.000000000001)) {
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



module.exports.enumerate = function (list, comparator) {
  list.sort(comparator)
	return list.map(function(item, i) {
		item.order = i
		return item
	})
}

var magLimit = module.exports.magLimit = function (limit, value) {
  return (value > 0 ? 1 : -1) * Math.min(Math.abs(value), limit)
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

var has3d = module.exports.has3d = function has3d() {
    if (!window.getComputedStyle) {
        return false;
    }
    
    var el = document.createElement('p'),
    has3d,
    transforms = {
        'webkitTransform':'-webkit-transform',
        'OTransform':'-o-transform',
        'msTransform':'-ms-transform',
        'MozTransform':'-moz-transform',
        'transform':'transform'
    };

    // Add it to the body to get the computed style
    document.body.insertBefore(el, null);

    for(var t in transforms){
        if( el.style[t] !== undefined ){
            el.style[t] = 'translate3d(1px,1px,1px)';
            has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
        }
    }

    document.body.removeChild(el);

    return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
}