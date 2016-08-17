import fieldUtils from "../fieldUtils"
import _ from "underscore"

export default function getDropdownHTML (format, stylers, config, obj, pos) {
	const value = obj[config.column_id];
	const styles = fieldUtils.getStyles(stylers, config, obj)
	const bubble = value ?
		`<span class="hasone-pill">${value}</span>` : ''
	
	return `<span class = "table-cell table-cell-inner" 
	style = "
		text-align: ${styles.textAlign}; 
		color: black; 
		${pos?`left:${pos.left}px; width: ${pos.width}px;`:''}
	">
	${bubble}
	</span>`
}