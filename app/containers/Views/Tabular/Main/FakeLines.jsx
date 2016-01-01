import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

var NUM_LINES = 50

var FakeLines = React.createClass ({

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
        width: this.props.totalWidth + 'px',
  			top: (geo.rowHeight * i +  geo.headerHeight) + 'px',
  		}
      lines.push(<div style = {rowStyle} className = "fake-table-row"></div> )
    }

		return <div className = "fake-lines">
      {lines}
    </div>
	}

});


export default FakeLines