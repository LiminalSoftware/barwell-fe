import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

var NUM_LINES = 50

var AddNewRowBar = React.createClass ({
	// shouldComponentUpdate: function (nextProps) {
	// 	return this.props.width !== nextProps.width ||
	// 		this.props.rowCount !== nextProps.rowCount ||
	// 		this.props.rowOffset !== nextProps.rowOffset
	// },

	handleAddRecord: function (e) {
		console.log('handleAddRecord')
		this.props._addRecord()
		e.nativeEvent.stopPropagation()
		e.stopPropagation()
	},

	render: function () {
		var view = this.props.view
		var model = this.props.model
		var geo = view.data.geometry

    	var newRowBarStyle = {
			top: ((this.props.rowCount - (this.props.rowOffset || 0)) * geo.rowHeight) + 'px',
			left: 0,
			height: (1 * geo.rowHeight  + 'px'),
			lineHeight: (1 * geo.rowHeight  + 'px'),
			width: this.props.width + 'px'
		}

		return <div style = {newRowBarStyle}
			onMouseDown = {this.handleAddRecord}
    		className = "table-cell add-new-row">
    		<div className = "table-cell-inner">
    			<span className = "small grayed icon icon-plus"></span>
    			Add a new row of data
    		</div>
    	</div>
	}

});


export default AddNewRowBar
