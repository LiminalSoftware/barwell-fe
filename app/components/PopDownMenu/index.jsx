import React from "react"
import _ from "underscore"

var PopDownMenu = React.createClass({

	// handleKeyPress: function (e) {
	// 	if (e.keyCode === constant.keycodes.ESC) this.props._revert()
	// },

	getInitialState: function () {
		return {mounted: false}
	},

	componentWillMount: function () {
		addEventListener('keyup', this.handleKeyPress)
	},

	componentWillUnmount: function () {
		removeEventListener('keyup', this.handleKeyPress)
	},

	componentDidMount: function () {
		this.setState({mounted: true})
	},

	shouldOpenDown: function () {
		return this.props.spaceBottom > 5 
			&& (this.props.spaceBottom > this.props.spaceTop)
	},

	render: function () {
		var _this = this
		var model = this.props.model;
		var style = {
			left: 0,
			right: 0,
			marginLeft: '-1px',
			marginRight: '0',
			pointerEvents: 'auto',
			maxHeight: this.state.mounted ? ((50 * _.flatten(this.props.children).length) + 'px') : 0
		};
		var shouldOpenDown = this.shouldOpenDown()

		return <ul 
			className = {"green " + (shouldOpenDown ? " pop-down-menu " : " pop-up-menu")}
			style = {style}>
			{
			shouldOpenDown ? 
			<span className = "pop-down-pointer-outer pop-down-pointer-outer--green"/>
          	:
          	<span className = "pop-up-pointer-outer pop-up-pointer-outer--green"/>
          	}
          	{
			shouldOpenDown ? 
			<span className = "pop-down-pointer-inner"/>
          	:
          	<span className = "pop-up-pointer-inner"/>
          	}
          	
			{this.props.children}
				
			</ul>
	}

})

export default PopDownMenu