import React, { Component, PropTypes } from 'react';
import update from 'react/lib/update';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import _ from "underscore"

import AttributeStore from "../../../../stores/AttributeStore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import constants from "../../../../constants/MetasheetConstants"
import fieldTypes from "../../../fields"

import util from "../../../../util/util"

const FIELDS_PER_ROW = 2

const getNameErrors = function (model_id, name) {
	name = name || ""
	const unique = AttributeStore.query().filter(a=>a.model_id === model_id && 
		a.attribute === name).length === 0
	const nonEmpty = name.length > 0

	if (!unique) return "Attribute with this name already exists"
	if (!nonEmpty) return "Attribute name cannot be blank"
}

export default class NewAttributeContext extends Component {

	constructor (props) {
		super(props)
		this.state = {
			detailElement: null
		}
	}

	chooseType = (type, e) => {
		const fieldType = fieldTypes[type]
		const nameRoot = "New " + fieldType.description
		const view = this.props.view

		var name = this.state.hasBeenRenamed ? this.state.name : nameRoot
		var iterator = 1
		var error = getNameErrors(view.model_id, name)

		while (error && iterator < 100) {
			name = nameRoot + " " + iterator++
			error = getNameErrors(view.model_id, name)
		}

		if (type.newAttributeDialog) {
			this.setState({
				detailElement: type.newAttributeDialog,
				type: type,
				name:  name
			})
		} else {
			modelActionCreators.create('attribute', true, {
				attribute: name,
				model_id: view.model_id,
				type: type
			})
		}
	}

	renderCategoriesList = ()  => {
		var _this = this
		var categories = _.uniq(Object.keys(fieldTypes)
			.map(type => fieldTypes[type].category))
			.filter(_.identity);

		return <div className="context-menu" key="chooseType">
			
			{categories.map((c,idx) => <div className="" key={c}>
				
				{_this.renderFieldList(c)}
			</div>)}
			
		</div>
	}

	renderFieldList = (category) => {
		var _this = this
		var config = this.props.config
		var numRows = 0
		var types = Object.keys(fieldTypes)
			.map((id, idx) => {
				var type = fieldTypes[id];
				type.typeId = id
				type.idx = idx
				return type
			}).filter(type =>
				type instanceof Object && 
				type.category === category
			).map((type, idx) => {
				type.row = numRows = Math.floor(idx / FIELDS_PER_ROW)
				return type
			})

		return types.map(type =>
			<span className="popdown-item selectable"
			key = {type.typeId}
			onClick = {_this.chooseType.bind(_this, type.typeId)}>
			<span className = {"icon icon-" + type.icon}/>
			{type.description}
		</span>)
		
	}

	renderMainMenu = () => {
		return this.renderCategoriesList()
	}

	render () {
		const view = this.props.view
		const style = Object.assign({}, 
			this.props._getRangeStyle({left: view.data._visibleCols.length, top: 0}), {
				height: "0",
				marginLeft: "-1px",
				top: view.data.geometry.headerHeight + 'px',
				position: "absolute",
				minWidth: "350px",
				overflow: "visible",
				pointerEvents: "auto"
		})
		const type = fieldTypes[this.state.type]

		return <ReactCSSTransitionGroup
			{...constants.transitions.slideleft}
			style={style} onClick={util.clickTrap}>
			{type ? 
				React.createElement(this.state.detailElement, 
					update(this.props, {$merge: {blurSelf: this.blurMode, blurMenu: this.blurMenu}}) )
				: this.renderMainMenu()
			}
		</ReactCSSTransitionGroup>
	}

}