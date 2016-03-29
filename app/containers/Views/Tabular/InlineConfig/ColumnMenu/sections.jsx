import util from '../../../../../util/util'

var sections = [
	{
		section: "fixed",
		label: "Fixed Attributes",
		emptyText: "No fixed attributes...",
		icon: "icon-pin-3",
		selector: function (view) {
			return view.data.columnList.filter(c => c.visible && c.fixed).sort(util.orderSort)
		},
		enterTransform: function (col) {
			col.visible = true
			col.fixed = true
			return col
		}
	},
	{
		section: "visible",
		label: "Visible Attributes",
		emptyText: "No visible attributes...",
		icon: "icon-eye-3",
		selector: function (view) {
			return view.data.columnList.filter(c => c.visible && !c.fixed).sort(util.orderSort)
		},
		enterTransform: function (col) {
			col.visible = true
			col.fixed = false
			return col
		}
	},
	{
		section: "hidden",
		label: "Hidden Attributes",
		emptyText: "No hidden attributes...",
		icon: "icon-eye-4",
		selector: function (view) {
			return view.data.columnList.filter(c => !c.visible).sort(util.orderSort)
		},
		enterTransform: function (col) {
			col.visible = false
			col.fixed = false
			return col
		}
	}
];

export default sections;