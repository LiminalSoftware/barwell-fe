import fieldUtils from "../fieldUtils"
import _ from "underscore"

export default function (format, stylers, config, obj) {
	var value = obj[config.column_id]
	var styles = fieldUtils.getStyles(stylers, config, obj)

	return `<span style = "text-align: center" class = "table-cell-inner">
		<span class = "checkbox-surround ">
			<span class="check green icon ${value ? 'icon-check' : ''}">
			</span>
		</span>
	</span>`;
}