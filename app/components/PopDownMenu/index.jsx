import React from "react"
import _ from "underscore"
import util from "../../util/util"

var PopDownMenu = React.createClass({

	getInitialState: function () {
		return {mounted: true}
	},

	componentWillMount: function () {
		addEventListener('keyup', this.handleKeyPress)
	},

	componentWillUnmount: function () {
		removeEventListener('keyup', this.handleKeyPress)
	},
	
	shouldOpenUp: function () {
		// if (this.props.parentEl) {
		// 	var pos = $(this.props.parentEl).offset();
		// 	var windowHeight = document.body.offsetHeight();
		// 	var windowHeight = document.body.offsetHeight();
		// 	return (pos.top > windowHeight - pos.bottom)
		// }
		return (this.props.spaceTop > this.props.spaceBottom)
	},

	clickTrap: util.clickTrap,

	render: function () {
		var _this = this
		var model = this.props.model;
		var style = {
			left: 0,
			right: 0,
			marginLeft: '-1px',
			marginRight: '0',
			pointerEvents: 'auto',
			// maxHeight: this.state.mounted ? ((40 * _.flatten(this.props.children).length) + 'px') : 0
		};
		var shouldOpenUp = this.shouldOpenUp()

		if (this.props.width) style.width = this.props.width + 'px';

		return <ul 
			className = {
				(shouldOpenUp ? " pop-up-menu " : " pop-down-menu") + 
				(this.props.split ? " split-menu " : "")
			}
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