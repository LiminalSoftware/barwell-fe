import React, { Component, PropTypes } from 'react';
import update from 'react/lib/update'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import AttributeStore from "../../../../stores/AttributeStore"

import constants from "../../../../constants/MetasheetConstants"
import modelActionCreators from "../../../../actions/modelActionCreators"
import constant from "../../../../constants/MetasheetConstants"
import fieldTypes from "../../../fields"


import util from "../../../../util/util"

export default class DefaultValueContext extends Component {

	constructor (props) {
		super(props)
		const config = this.props.config
		const attribute = AttributeStore.get(config.attribute_id)
	}

	componentWillUnmount = () => {
		// this.setDefault(this.state.defaultValue)
	}

	handleSetDefault = (value) => {
		console.log('handleSetDefault: ' + value)
		const {config} = this.props
		modelActionCreators.setColumnDefault(config, value)
	}

	teardown = (shouldCommit) => {
		console.log('teardown')
		return this.refs.field.handleBlur(!shouldCommit)
	}

	renderDefaultField = () => {
		const {config} = this.props
		const fieldType = fieldTypes[config.type]
		const attribute = AttributeStore.get(config.attribute_id)


		return React.createElement(fieldType.element, {
			ref: 'field',
			noAutoFocus: true,
			commit: this.handleSetDefault,
			value: attribute.default_value,
			alwaysEdit: true,
			config: config,
			selected: true,
			rowHeight: 35,
			style: {
				border: 'none',
		        left: '10px',
		        bottom: '0px',
		        top: '0px',
		        right: '10px',
		     }
		})
		
	}

	render () {
		const _this = this
		const view = this.props.view

		return <div>
			<div className="popdown-item bottom-divider title">
				Default:
			</div>

			<div className="popdown-item"
			style={{position: "relative", display: "block"}}>
				{this.renderDefaultField()}
			</div>

			<div className="popdown-item top-divider selectable" onClick={this.props.blurSelf}>
				<span className="icon icon-arrow-left icon-detail-left"/>
				<span>Back</span>
			</div>
		</div>
	}

}