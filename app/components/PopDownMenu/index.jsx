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

	shouldOpenUp: function () {
		return this.props.spaceTop > 5 
			&& (this.props.spaceTop > this.props.spaceBottom)
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
		var shouldOpenUp = this.shouldOpenUp()

		return <ul 
			className = {(this.props.green ? "menu--green " : "") + (shouldOpenUp ? " pop-up-menu " : " pop-down-menu")}
			style = {style}>
			{
			shouldOpenUp ? 
			<span className = {"pop-up-pointer-outer " + 
				(this.props.green ? " pop-up-pointer-outer--green" : "")}/>
          	:
          	<span className = {"pop-down-pointer-outer " + + 
          		(this.props.green ? " pop-down-pointer-outer--green" : "")}/>
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