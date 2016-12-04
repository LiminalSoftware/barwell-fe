import React from "react"
import _ from "underscore"

var Overlay = React.createClass ({
	shouldComponentUpdate: function (nextProps, nextState) {
		return	!_.isEqual(this.props.position, nextProps.position) || 
				this.props.view !== nextProps.view ||
				this.props.columnOffset !== nextProps.columnOffset ||
				this.props.className !== nextProps.className ||
				this.props.children !== nextProps.children ||
				this.props.focused !== nextProps.focused ||
				this.props.dragOffset !== nextProps.dragOffset
	},

	render: function () {
		const {view, position: pos, className, fudge, showHiddenHack} = this.props
		const style = this.props._getRangeStyle(pos, showHiddenHack)
		let classes = className
		
		style.top = style.top + (fudge.top || 0)
		style.left = style.left + (fudge.left || 0)
		style.height = style.height + (fudge.height || 0)
		style.width = style.maxWidth = style.width + (fudge.width || 0)

		if (pos && (pos.left === pos.right) && (pos.top === pos.bottom))
			classes += ' singleton';
		if (!pos) return null
		
		return <div
			{...this.props}
			className = {classes}
			style = {style}>
			{this.props.children}
		</div>;
		}
});


export default Overlay
