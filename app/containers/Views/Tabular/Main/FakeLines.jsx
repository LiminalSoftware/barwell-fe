import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

var NUM_LINES = 50

var FakeLines = React.createClass ({
	shouldComponentUpdate: function (nextProps) {
			return this.props.width !== nextProps.width
	},

	render: function () {
		var view = this.props.view
		var model = this.props.model
		var geo = view.data.geometry
		var rowCount = Math.min(this.props.rowCount, NUM_LINES)
		var lines = []

	    for (var i = 0; i < rowCount; i++) {
	      var rowStyle = {
	  			height: (geo.rowHeight + 2) + 'px',
	        left: 0,
	        width: this.props.width + 'px',
	  			top: (geo.rowHeight * i +  geo.headerHeight + 1) + 'px',
	  		}
	      lines.push(<div key = {i} style = {rowStyle} className = "fake-table-row"></div> )
	    }

		return <div className = "fake-lines force-layer" style = {{
			left: 0,
			top: 0,
			bottom: 0,
			width: this.props.width + 'px'
			}} >
	      {lines}
	    </div>
	}

});


export default FakeLines
