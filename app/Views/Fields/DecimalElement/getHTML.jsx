import fieldUtils from "../fieldUtils"
import _ from "underscore"

export default function getDecimalHTML (format, stylers, config, obj, pos) {
	var value = obj[config.column_id];
	var prettyValue = _.escape(format(value, config))
	var styles = fieldUtils.getStyles(stylers, config, obj)
	
	return `<span class = "table-cell table-cell-inner" 
	style = "
		text-align: left; 
		font-style: ${styles.fontStyle || 'inherit'};
		background: ${styles.background || 'transparent'}; 
		color: black; 
		font-family: ${styles.fontFamily || 'inherit'}; 
		${pos?`left:${pos.left}px; width: ${pos.width}px;`:''}
	">
		
		
			<div class="decimal-prefix"></div>
			
	</span>`
}