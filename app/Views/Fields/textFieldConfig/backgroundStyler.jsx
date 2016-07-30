export default function (config, object) {
	const conditional = (!config.colorConditionAttr || object['a' + config.colorConditionAttr])
	let style = {}

	if (isSelected) bg = "white";
	else if (config.color && conditional) bg = config.color;
	else if (config.colorAttr && conditional) bg = object['a' + config.colorAttr];

	let c = tinycolor(bg);
	let hsl = c.toHsl();
	if (config.adjustColor) hsl.l = 
		Math.max(hsl.l, MIN_LIGHTNESS);
	else if (c.isDark()) style.color = 'white';
	style.background = tinycolor(hsl).toRgbString();
	
	return style;
}