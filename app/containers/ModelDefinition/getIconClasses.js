import ModelStore from "../../stores/ModelStore"

var KEY_ICONS = ["icon-geo-octagon", "icon-geo-circle", "icon-geo-triangle",  "icon-geo-pentagon", "icon-geo-diamond", 
'icon-geo-trifoil', "icon-geo-peakhead", "icon-geo-quadrilateral"];
var KEY_COLORS = ["green", "blue", "red"];

var getIconClasses = function (ordinal, key) {
	var model = ModelStore.get(key.model_id)
	return [ 
		"icon",
		(key && key._dirty) ? "greened" : "grayed",
		key.key_id === model.primary_key_key_id ? "icon-kub-locked" 
			: key.key_id === model.label_key_id ? "icon-kub-rate-01" 
			: KEY_ICONS[ordinal % KEY_ICONS.length]
		// KEY_COLORS[ordinal % KEY_COLORS.length]
	].join(" ");
}

export default getIconClasses