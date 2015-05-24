import React from "react"

var TextField = React.createClass({
	
	render: function () {
		var value = this.props.value
		var style = this.props.style
		var clicker = this.props.clicker
		
		return <td style={style} onClick={clicker}>{value}</td>

	}
});

var CheckboxField = React.createClass({
	
	render: function () {
		var value = this.props.value
		var style = this.props.style
		var clicker = this.props.clicker
		
		return <td style={style} onClick={clicker} className="checkbox">
			<input type="checkbox" checked={value}></input>
		</td>
	}
});

var fieldTypes = {
	Text: TextField,
	Boolean: CheckboxField,
	HasOne: TextField,
	Integer: TextField,
	Timestamp: TextField
}

export default fieldTypes;