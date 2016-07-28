import React, { Component, PropTypes } from 'react'

function calcInitialStyle(props) {
	const pos = {left: idx, right: idx, top: 0, bottom: 0}
	let style = props._getRangeStyle(pos)
	style.top = style.bottom = 0
	style.display = "block"
	return style
}

export default class Column extends Component {

	static propTypes = {
		column: PropTypes.object,
		_getRangeStyle: PropTypes.function
	}

	render () {
		const column = this.props.column
		return <div className="view-reference-box" style={calcStyle(column)}>
			{column.name}
		</div>
	}
	
}