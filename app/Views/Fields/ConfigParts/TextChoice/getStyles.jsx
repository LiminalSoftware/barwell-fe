import constant from "../../../../constants/MetasheetConstants"

export default function (config, object) {
	const textConditional = (!config.textConditionAttr || object['a' + config.textConditionAttr])
	let style = {}
	
	if (config.style === 'bold' && textConditional) style.fontFamily = constant.fonts.headerFont
	if (config.style === 'italic' && textConditional) style.fontStyle = 'italic'
	
	return style;
}