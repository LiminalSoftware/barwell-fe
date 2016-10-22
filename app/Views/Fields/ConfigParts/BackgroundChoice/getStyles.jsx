import tinycolor from "tinycolor2"

const MIN_LIGHTNESS = 0.85

export default function (config, object) {
	let style = {}
	let bg = null
	const conditional = (!config.colorConditionAttr || 
		!!object['a' + config.colorConditionAttr])

	if (config.color && conditional) bg = config.color
	else if (config.colorAttr && conditional) bg = object['a' + config.colorAttr]
	else bg = 'rgba(255,255,255,0)'

	let c = tinycolor(bg)
	let hsl = c.toHsl()

	if (config.adjustColor) hsl.l = Math.max(hsl.l, MIN_LIGHTNESS);
	else if (c.isDark()) style.color = 'white';

	style.background = tinycolor(hsl).toRgbString();
	
	return style;
}