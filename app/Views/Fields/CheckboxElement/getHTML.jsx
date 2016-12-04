import fieldUtils from "../fieldUtils"
import _ from "underscore"

export default function (format, stylers, config, obj, pos) {
	var value = obj[config.column_id]
	var styles = fieldUtils.getStyles(stylers, config, obj)

	return `<span class = "table-cell table-cell-inner"
	style = "
		text-align: center; 
		background: ${styles.background || 'transparent'}; 
		font-family: ${styles.fontFamily || 'inherit'}; 
		${pos?`left:${pos.left}px; width: ${pos.width}px;`:''}
	">
		<span class = "checkbox-surround${value?"-checked":"-unchecked"}">
			<span class="check icon ${value ? 'icon-check' : ''}">
			</span>
		</span>
	</span>`;
}