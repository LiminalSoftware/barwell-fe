import _ from "underscore"
import React from "react"

import ViewStore from "../../stores/ViewStore"
import viewTypes from "../Views/viewTypes"

import modelActionCreators from "../../actions/modelActionCreators.jsx"
import util from '../../util/util'

var Dropdown = React.createClass({

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return {open: false}
	},

	componentWillUnmount: function () {
		
	},

	// HANDLERS ===============================================================

	handleClick: function (e) {
		this.setState({open: true})
	},

	handleBlur: function () {
		this.setState({open: false})
	},

	// UTILITY ================================================================
	
	// RENDER =================================================================

	render: function () {
		const _this = this
		const style = {position: 'relative'}
		const selected = this.props.choices
			.filter(c => c.key === this.props.selection)[0] 
			|| this.props.choices[0]
		

		return <div className="pop-down-section"
			style={style} onMouseDown = {this.handleClick}>
			
			{
				this.state.open ? 
				<div className = "pop-down-menu-bordered" 
				style = {{position: 'absolute', top: 0, left: 0, right: 0}}>{
					this.props.choices
					.map(c => <DropdownItem onMouseDown = {_this.props._choose.bind(_this, c.key)} 
						key = {c.key} choice = {c}/>)
				}</div>
				:
				null
			}
			
			<div className = "pop-down-menu-bordered">
			<DropdownItem choice = {selected} showpointer = {true} />
			</div>
		</div>
	}
})

var DropdownItem = React.createClass({
	render: function () {
		const choice = this.props.choice
		return <div className = {"popdown-item selectable " + (this.props.classes || '')}>
			{choice.icon ?
				<span className = {"icon view-icon " + choice.icon}/>
				: null}
			{choice.label}
			{this.props.showpointer ?
				<span className = "icon icon-chevron-down icon--small" 
				style = {{float: 'right', lineHeight: '30px', marginRight: 0}}/>
				: null
			}
		</div>
	}
})

export default Dropdown
