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
			display: 'block',
			maxHeight: this.props.maxHeight
		};
		var shouldOpenUp = this.shouldOpenUp()
		var direction = this.props.direction || (this.shouldOpenUp() ? "up" : "down")
		var color = this.props.green ? "green" : "";

		if (this.props.width) style.width = this.props.width + 'px';

		return <div
			{...this.props}
			className = {
				(shouldOpenUp ? " pop-up-menu " : " pop-down-menu") + 
				(this.props.green ? " green " : "") +
				(this.props.split ? " split-menu " : "")
			}
			style = {style}>
			
			<span className = {"pop-" + direction + "-pointer-outer " + color}/>
          	<span className = {"pop-" + direction + "-pointer-inner " }/>
          	
			{this.props.children}
				
			</div>
	}

})

export default PopDownMenu