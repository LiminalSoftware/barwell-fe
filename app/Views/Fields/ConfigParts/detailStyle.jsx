/*
 *  allows space for the detail icon on the opposite side as the text
 */

export default function (config, object) {
	if (config.align === 'right') return {paddingLeft: "24px"}
	else return {paddingRight: "24px"}
}