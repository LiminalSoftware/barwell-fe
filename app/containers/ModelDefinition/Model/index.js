import React from "react"
import { Link } from "react-router"

import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"
import modelActionCreators from '../../../actions/modelActionCreators'
import constants from '../../../constants/MetasheetConstants'
import getIconClasses from '../getIconClasses'
import _ from 'underscore'
import pluralize from 'pluralize'

import ConfirmationMixin from '../ConfirmationMixin'
import PureRenderMixin from 'react-addons-pure-render-mixin';

var ModelDetails = React.createClass({

	mixins: [PureRenderMixin, ConfirmationMixin],

	getInitialState: function () {
		var model = this.props.model;
		return {
			name: model.model,
			plural: model.plural,
			pluralUpdated: false,
			label_attribute_id: model.label_attribute_id
		}
	},

	componentWillUnmount: function () {
		document.removeEventListener('keyup', this.handleKeyPress)
	},

	commitChanges: function () {
		var _this = this
		var key
		var model = _.clone(this.props.model)
		var name = this.state.name

		model.model = this.state.name
		model.plural = this.state.plural
		model.label_attribute_id = this.state.label_attribute_id

		this.setState({committing: true, editing: false});

		modelActionCreators.create('model', true, model).then(function () {
			_this.setState({editing: false, committing: false})
			// modelActionCreators.createNotification('Model udpate complete!', 'Your changes have been committed to the server', 'info')
		})
	},

	cancelChanges: function () {
		var model = this.props.model;
		this.setState({
			editing: false,
			name: model._server.model,
			plural: model._server.plural,
			label: model._server.label
		})
	},

	handlePickLabel:function (event) {
		var _this = this
		var model = this.props.model
		var value = event.target.value
		console.log('value: ' + value)
		this.setState({
			label_attribute_id: value
		})
	},

	revert: function () {
		var model = this.props.model;
		this.setState({
			editing: false,
			name: model.model,
			plural: model.plural
		})
	},

	handleNameUpdate: function (event) {
		var name = event.target.value
		this.setState({
			name: name,
			plural: (this.state.pluralUpdated ? this.state.plural : pluralize.plural(name))
		})
	},

	handlePluralUpdate: function (event) {
		this.setState({
			plural: event.target.value,
			pluralUpdated: true
		})
	},

	render: function () {
		var model = this.props.model;
		var labelAttribute = AttributeStore.get(this.state.label_attribute_id) || {}

		return <div className="detail-block">
		<div className="detail-section-header">
			<h3>Database Details</h3>
			<ul className="light mb-buttons">
				<li onClick={this.handleEdit}>Edit</li>
			</ul>
		</div>
			<div className="detail-table ">
					<div className={'detail-row' + (this.state.editing ? " editing" : "")}>
						<span style = {{width: "30%"}}>
							Name
						</span>
						<span style = {{width: "70%"}} >
								{this.state.editing ?
								<input
									value={this.state.name}
									onChange={this.handleNameUpdate}
									ref="renamer"/>
								:
								<span>
									{this.state.name}
								</span>
								}
						</span>
					</div>
					<div className= {'detail-row' + (this.state.editing ? " editing" : "")}>
						<span style = {{width: "30%"}}>Plural</span>
						<span style = {{width: "70%"}}>
							{this.state.editing ?
								<input
									value={this.state.plural}
									onChange={this.handlePluralUpdate}
									ref="replural"/>
								: <span>
									{this.state.plural}
								</span>
							}
						</span>
					</div>
					<div className={"detail-row" + (this.state.editing ? " editing" : "")}>
						<span style = {{width: "30%"}}>Label</span>
						<span style = {{width: "70%"}}>
							{this.state.editing ?
								<select value = {labelAttribute.attribute_id} onChange = {this.handlePickLabel}> {
									[<option value={null} key="null-option">-Select from dropdown-</option>].concat(
									AttributeStore.query({model_id: model.model_id, type: 'TEXT'}).map(function (attr) {
										return <option value={attr.attribute_id} key={attr.attribute_id}>
					  						{attr.attribute}
					  					</option>
									}))
								} </select>
								:
								labelAttribute.attribute
							}

						</span>
					</div>
			</div>
			<div className="confirm-div">
				{this.getConfirmationButtons()}
			</div>
		</div>
	}
});

export default ModelDetails;
