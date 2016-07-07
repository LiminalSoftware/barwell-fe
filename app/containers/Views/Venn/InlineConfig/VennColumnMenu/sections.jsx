import fieldTypes from "../../../fields"
import util from '../../../../../util/util'

var sections = [
	{
		section: 'categories',
		label: "Categories",
		emptyText: "No categories defined...",
		icon: "icon-exclude",
		selector: function (view) {
			return view.data.columnList.filter(c => c.groupByCategory && c.type === 'BOOLEAN').sort(util.orderSort)
		},
		enterTransform: function (col) {
			col.groupByCategory = true;
			col.visible = true;
			return col
		}
	},
	{
		section: 'weighting',
		label: "Weighting",
		emptyText: "No weight defined-record count will be used as weight.",
		icon: "icon-scale2",
		selector: function (view) {
			return view.data.columnList.filter(c => c.weight && c.type === 'DECIMAL').sort(util.orderSort)
		},
		enterTransform: function (col) {
			col.groupByCategory = true;
			col.visible = true;
			return col
		}
	},
	{
		section: 'hidden',
		label: "Unused Attributes",
		emptyText: "No hidden attributes...",
		icon: "icon-eye-crossed",
		selector: function (view) {
			return view.data.columnList.filter(c => !c.groupByCategory && c.type === 'BOOLEAN').sort(util.orderSort)
		},
		enterTransform: function (col) {
			col.groupByCategory = false;
			col.visible = false;
			return col
		}
	}
]

export default sections;