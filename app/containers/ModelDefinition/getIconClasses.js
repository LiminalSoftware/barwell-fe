var KEY_ICONS = ["icon-geo-square", "icon-geo-circle", "icon-geo-triangle", "icon-geo-octogon", "icon-geo-pentagon", "icon-geo-diamond", 'icon-geo-trifoil', "icon-geo-peakhead"];
var KEY_COLORS = ["green", "blue", "red"];

var getIconClasses = function (ordinal, key) {
	return [ 
		"icon",
		(key && key._dirty) ? "greened" : "grayed",
		KEY_ICONS[ordinal % KEY_ICONS.length]
		// KEY_COLORS[ordinal % KEY_COLORS.length]
	].join(" ");
}

export default getIconClasses