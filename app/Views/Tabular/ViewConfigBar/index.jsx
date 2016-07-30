import React, { Component, PropTypes } from 'react'

const viewConfigBarStyle = {
	right: "10px",
	bottom: "10px",
	position: "absolute",
	display: "flex"
}

const viewConfigItemStyle = {

}

export default class ViewConfigBar extends Component {

	static propTypes = {
		model: PropTypes.object,
		view: PropTypes.object
	}

	render () {
		return <div style={viewConfigBarStyle}>
			
		</div>
	}
}