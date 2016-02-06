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

		lines.push(<div key = 'header' style ={{
			height: (geo.headerHeight + 2) + 'px',
    		left: 0,
    		width: this.props.width + 'px',
			top: 0
		}} className = "fake-table-row"/>)

	    for (var i = 0; i < rowCount; i++) {
	      var rowStyle = {
	  			height: (geo.rowHeight + 2) + 'px',
	        	left: 0,
	        	width: this.props.width + 'px',
	  			top: (geo.rowHeight * i) + 'px',
	  		}
	      lines.push(<div key = {i} style = {rowStyle} className = "fake-table-row"></div> )
	    }

		return <div className = "fake-lines wrapper" style = {{
			left: 0,
			top: this.props.top + 'px',
			bottom: 0,
			width: this.props.width + 'px',
			transform: 'translateZ(-2px)'
			}} >
	      {lines}
	    </div>
	}

});


export default FakeLines
