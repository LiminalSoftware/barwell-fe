import fieldUtils from "../fieldUtils"
import _ from "underscore"

export default function getGenericTextHTML (format, stylers, config, obj) {
	var value = obj[config.column_id];
	var prettyValue = _.escape(format(value))
	var styles = fieldUtils.getStyles(stylers, config, obj)
	
	return `<span class = "table-cell-inner" 
	style = "text-align: ${styles.textAlign}; font-style: ${styles.fontStyle || 'inherit'};
	background: ${styles.background || 'transparent'}; color: black; 
	font-family: ${styles.fontFamily || 'inherit'}">
		${prettyValue}
	</span>`
}