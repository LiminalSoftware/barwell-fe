import React from "react"
import _ from "underscore"
import util from "../../util/util"
import tinycolor from "tinycolor2"

var MIN_LIGHTNESS = 0.85

var bgColorMixin = {

	getBgColor: function (config, object, isNull, isSelected) {
		var bg = null;
		var cellStyle = {};
		var conditional = (!config.colorConditionAttr || object['a' + config.colorConditionAttr])

		if (isNull) bg = null;
		else if (isSelected) bg = "white";
		else if (config.color && conditional) bg = config.color;
		else if (config.colorAttr && conditional) bg = object['a' + config.colorAttr];

		if (bg) {
			var c = tinycolor(bg);
			var hsl = c.toHsl();
			if (config.adjustColor) hsl.l = 
				Math.max(hsl.l, MIN_LIGHTNESS);
			else if (c.isDark()) cellStyle.color = 'white';
			cellStyle.background = tinycolor(hsl).toRgbString();
		}
		return cellStyle;
	}
}

export default bgColorMixin