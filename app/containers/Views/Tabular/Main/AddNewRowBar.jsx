import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

var NUM_LINES = 50

var AddNewRowBar = React.createClass ({
	shouldComponentUpdate: function (nextProps) {
			return this.props.width !== nextProps.width
	},

	render: function () {
		var view = this.props.view
		var model = this.props.model
		var geo = view.data.geometry
		var rowCount = this.props.rowCount

    var newRowBarStyle = {
			top: ((rowCount) * geo.rowHeight) + 'px',
			left: 0,
			height: (geo.rowHeight  + 'px'),
			width: this.props.width + 'px'
		}

		return <div style = {newRowBarStyle}
      className = "table-cell add-new-row">
      <div className = "table-cell-inner"
        onMouseDown = {this.props.handleAddRecord}>
        + Add a new row of data
      </div>
    </div>
	}

});


export default AddNewRowBar
