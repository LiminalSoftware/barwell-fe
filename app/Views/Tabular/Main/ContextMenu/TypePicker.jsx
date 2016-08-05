import React, { Component, PropTypes } from 'react'
import _ from "underscore"
import fieldTypes from "../../../fields"

const menuStyle = {
	height: "28px", 
	lineHeight: "28px", 
	paddingTop: 0, 
	paddingBottom: 0,
	color: "steelblue"
}

export default class typePicker extends Component {

	static propTypes = {
		
		/*
		 * called when a type is selected
		 */
		handleChooseType: PropTypes.func.isRequired,

	}

	constructor (props) {
		super(props)
	}


	renderCategoriesList = () => {
		var _this = this
		var categories = _.uniq(Object.keys(fieldTypes)
			.map(type => fieldTypes[type].category))
			.filter(_.identity);

		return categories.map(c => <div className="" key={c}>
			<span className="menu-item menu-sub-item menu-label" style={menuStyle}>{c}</span>
			{_this.renderFieldList(c)}
		</div>)
	}

	renderFieldList = (category) => {
		const config = this.props.config
		const _this = this
		const types = Object.keys(fieldTypes)
			.filter(_.identity)
			.map(function(id) {
				var type = fieldTypes[id];
				type.typeId = id
				return type
			}).filter(type => type.category === category)

		return types.map(type =>
		<span className="menu-item menu-sub-item"
			style = {menuStyle}
			key = {type.typeId}
			onClick = {e => _this.handleChooseType(type.typeId)}>
			<span className = {"icon icon-" + type.icon}/>
			{type.description}
		</span>)
		
	}

	render = () => {
		return <div>
			{this.renderCategoriesList()}
		</div>
	}
}