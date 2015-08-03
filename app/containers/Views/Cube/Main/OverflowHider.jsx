import React from "react"

var OverflowHider = React.createClass ({
	render: function () {
		var view = this.props.view
		var style = {
			zIndex: 500,
			top: (this.props.scrollTop || 0) + 'px',
			left: (this.props.scrolLeft || 0) + 'px',
			width: ((view.data.columnWidth) * view.row_aggregates.length) + 'px',
			height: ((view.data.rowHeight) * view.column_aggregates.length) + 'px',
			background: 'white'
		}
		return <div style = {style}></div>
	}
})

export default OverflowHider