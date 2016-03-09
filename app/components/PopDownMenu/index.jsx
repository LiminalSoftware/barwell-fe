import React from "react"
import _ from "underscore"

var PopDownMenu = React.createClass({

	// handleKeyPress: function (e) {
	// 	if (e.keyCode === constant.keycodes.ESC) this.props._revert()
	// },

	getInitialState: function () {
		return {mounted: true}
	},

	componentWillMount: function () {
		addEventListener('keyup', this.handleKeyPress)
	},

	componentWillUnmount: function () {
		removeEventListener('keyup', this.handleKeyPress)
	},

	componentDidMount: function () {
		// setTimeout(t => this.setState({mounted: true}), 0)
	},

	shouldOpenUp: function () {
		return (this.props.spaceTop > this.props.spaceBottom)
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
			maxHeight: this.state.mounted ? ((40 * _.flatten(this.props.children).length) + 'px') : 0
		};
		var shouldOpenUp = this.shouldOpenUp()

		return <ul 
			className = {shouldOpenUp ? " pop-up-menu " : " pop-down-menu"}
			style = {style}>
			{
			shouldOpenUp ? 
			<span className = "pop-up-pointer-outer "/>
          	:
          	<span className = "pop-down-pointer-outer "/>
          	}
          	{
			shouldOpenUp ? 
			<span className = "pop-up-pointer-inner"/>
          	:
          	<span className = "pop-down-pointer-inner"/>
          	}
          	
			{this.props.children}
				
			</ul>
	}

})

export default PopDownMenu