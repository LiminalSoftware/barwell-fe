import fieldTypes from "../../fields"
import util from "../../../util/util"

export default [
	{
		section: 'rows',
		label: "Row Groupings",
		emptyText: "No row groups defined...",
		icon: "icon-menu",
		configParts: [],
		selector: function (view) {
			return view.data._columnList.filter(c => c.groupByRow).sort(util.orderSort)
		},
		enterTransform: function (col) {
			col.groupByColumn = false;
			col.groupByRow = true;
			col.inTableBody = false;
			col.visible = true;
			return col
		}
	},
	{
		section: 'columns',
		label: "Column Groupings",
		emptyText: "No column groups defined...",
		icon: "icon-menu",
		configParts: [],
		selector: function (view) {
			return view.data._columnList.filter(c => c.groupByColumn).sort(util.orderSort)
		},
		enterTransform: function (col) {
			col.groupByColumn = true;
			col.groupByRow = false;
			col.inTableBody = false;
			col.visible = true;
			return col
		}
	},
	{
		section: 'body',
		label: "Table Body Attributes",
		emptyText: "No table body attributes defined...",
		icon: "icon-border-all",
		configParts: [],
		selector: function (view) {
			return view.data._columnList.filter(c => c.inTableBody).sort(util.orderSort)
		},
		enterTransform: function (col) {
			col.groupByColumn = false;
			col.groupByRow = false;
			col.inTableBody = true;
			col.visible = true;
			return col
		}
	},
	{
		section: 'hidden',
		label: "Hidden Attributes",
		emptyText: "No hidden attributes...",
		icon: "icon-eye-crossed",
		selector: function (view) {
			return view.data._columnList.filter(c => !c.inTableBody && !c.groupByRow && !c.groupByColumn).sort(util.orderSort)
		},
		enterTransform: function (col) {
			col.groupByColumn = false;
			col.groupByRow = false;
			col.inTableBody = false;
			col.visible = false;
			return col
		}
	}
]