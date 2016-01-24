var KEY_ICONS = ["icon-geo-str-square", "icon-geo-str-circle", "icon-geo-str-triangle", "icon-geo-str-trifold", "icon-geo-str-diamond"];
var KEY_COLORS = ["green", "blue", "red"];

var getIconClasses = function (ordinal, key) {
	return [
		"small", 
		"icon",
		(key && key._dirty) ? "greened" : "grayed",
		KEY_ICONS[ordinal % KEY_ICONS.length]
		// KEY_COLORS[ordinal % KEY_COLORS.length]
	].join(" ");
}

export default getIconClasses