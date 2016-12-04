// LIBS
import _ from "underscore"
import React from "react"

// STORES
import ViewStore from "../../stores/ViewStore"

// CONTANTS


// ACTIONS AND UTILS
import modelActionCreators from "../../actions/modelActionCreators.jsx"
import util from '../../util/util'

// MIXINS
import blurOnClickMixin from "../../blurOnClickMixin"


var Dropdown = React.createClass({

	mixins: [blurOnClickMixin],

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return {open: false}
	},

	componentWillUnmount: function () {
		
	},

	// HANDLERS ===============================================================

	handleClick: function (e) {
		if (!this.state.open) {
			this.setState({open: true})
			util.clickTrap(e)	
		}
	},

	// UTILITY ================================================================
	
	// RENDER =================================================================

	render: function () {
		const _this = this
		const outerStyle = {position: 'relative'}
		const choices = this.props.choices
		const selection = this.props.selection
		const selected = choices.filter(c => c.key === selection)[0] 
			|| this.props.choices[0]
		const selectedIndex = this.props.choices.indexOf(selected)
		const style = {
			position: 'absolute',
			top: util.makePercent(-1 * selectedIndex),
			left: 0,
			right: 0,
			zIndex: 0,
			margin: '-1px',
			marginTop: selectedIndex * 2 + 'px'
		}
		
		return <div className = "popdown-menu-bordered" 
			style={outerStyle}
			onMouseDown = {this.handleClick}>
			{
			this.state.open ? 
			<div className = "popdown-menu-bordered" style = {style}>{
				this.props.choices
				.map(c => <DropdownItem {...this.props}
					key = {c.key} choice = {c}/>)
			}</div>
			:
			<DropdownItem choice = {selected} placeholder = {true} />
			}
		</div>
	}
})

var DropdownItem = React.createClass({

	handleChoice: function () {	
		this.props._choose(this.props.choice.key)
	},

	render: function () {
		const choice = this.props.choice
		const classes = "popdown-item selectable " + (this.props.classes || "")
			+ (choice.key === this.props.selection ? " selected " : "" )
		return <div 
			onMouseDown = {this.props.placeholder ? null : this.handleChoice}
			className = {classes}>
			{choice.icon ?
				<span className = {"icon view-icon " + choice.icon}/>
				: null}
			{choice.label}
			{this.props.placeholder ?
				<span className = "icon icon-chevron-down icon--small" 
				style = {{float: 'right', lineHeight: '30px', marginRight: 0}}/>
				: null
			}
		</div>
	}
})

export default Dropdown
