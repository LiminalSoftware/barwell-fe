import tinycolor from "tinycolor2"

export function validator (input) {
	if (!input) return 'rgba(255,255,255,0)'
	var color = tinycolor(input).toRgbString()
	return color;
}

export function parser (input) {
	return input
}

export default {validator, parser}
