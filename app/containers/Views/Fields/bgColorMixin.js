import React from "react"
import _ from "underscore"
import util from "../../../util/util"
import tinycolor from "tinycolor2"

import defaultCellStyle from './defaultCellStyle'

var MIN_LIGHTNESS = 0.85

var bgColorMixin = {

	getBgColor: function () {
		var config = this.props.config;
		var bg = null;
		var obj = this.props.object
		var cellStyle = {};
		var conditional = (!config.colorConditionAttr || obj['a' + config.colorConditionAttr])

		if (this.props.isNull) bg = null;
		else if (this.props.selected) bg = "white";
		else if (config.color && conditional) bg = config.color;
		else if (config.colorAttr && conditional) bg = obj['a' + config.colorAttr];

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