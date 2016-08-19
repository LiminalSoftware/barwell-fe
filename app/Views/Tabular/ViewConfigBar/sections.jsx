export default [
	{
		section: "fixed",
		label: "Pinned Columns",
		emptyText: "No fixed attributes...",
		icon: "icon-pushpin2",
		selector: function (view) {
			return view.data._columnList.filter(c => c.fixed)
		},
		enterTransform: function (col) {
			col.visible = true
			col.fixed = true
			return col
		}
	},
	{
		section: "visible",
		label: "Scrolling Columns",
		emptyText: "No visible attributes...",
		icon: "icon-eye",
		selector: function (view) {
			return view.data._columnList.filter(c => !c.fixed)
		},
		enterTransform: function (col) {
			col.visible = true
			col.fixed = false
			return col
		}
	},
];