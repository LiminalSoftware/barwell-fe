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
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var ModelDetails = React.createClass({

	mixins: [PureRenderMixin, ConfirmationMixin],

	getInitialState: function () {
		var model = this.props.model;
		return {
			name: model.model,
			plural: model.plural,
		}
	},

	componentWillUnmount: function () {
		document.removeEventListener('keyup', this.handleKeyPress)
	},

	commitChanges: function () {
		var model = this.props.model
		var name = this.state.name
		var plural = this.state.plural

		if (this.state.editingName) plural = pluralize.plural(name)

		this.setState({
			plural: plural
		});

		model.model = name
		model.plural = plural
		modelActionCreators.create('model', false, model)
		this.revert()
	},

	cancelChanges: function () {
		this.revert()
	},

	handlePickLabel:function (event) {
		var model = this.props.model
		var value = event.target.value
		var key
		var numComps = _.countBy(KeycompStore.query({model_id: model.model_id}), 'key_id')
		var candidateKc = KeycompStore.query({attribute_id: value}).forEach(function (kc) {
			if (numComps[kc.key_id] === 1) key = KeyStore.get(kc.key_id)
		});
		if (!key) {
			modelActionCreators.create('key', false, {
				_named: false,
				_label: true,
				model_id: model.model_id
			}).then(function (key) {
				modelActionCreators.create('keycomp', false, {key_id: key.cid, attribute_id: value})
			})
		}
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
		this.setState({name: event.target.value})
	},

	handlePluralUpdate: function (event) {
		this.setState({plural: event.target.value})
	},

	render: function () {
		var model = this.props.model;
		return <div className="detail-block">
		<div className="detail-section-header">
			<h3>Database Details</h3>
			<ul className="light mb-buttons">
				<li onClick={this.handleEdit}>Edit</li>
			</ul>
		</div>

			<div className="detail-table">
					<div className={'detail-row'}>
						<span className="width-30 title">
							Name
						</span>
						<span className={"width-70 " + (this.state.editing ? " tight" : "")}>
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
					<div className='detail-row'>
						<span className="width-30 title">Plural</span>
						<span className={"width-70 " + (this.state.editing ? " tight" : "")}>
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
					<div className="detail-row">
						<span className="width-30 title">Label</span>
						<span className={"width-70 " + (this.state.editing ? " tight" : "")}>
							{this.state.editing ?
								<select value = {model.label_attribute_id} onChange = {this.handlePickLabel}> {
									[<option value={null} key="null-option">-Select from dropdown-</option>].concat(
									AttributeStore.query({model_id: model.model_id, type: 'TEXT'}).map(function (attr) {
										return <option value={attr.attribute_id} key={attr.attribute_id}>
					  						{attr.attribute}
					  					</option>
									}))
								} </select>
								:
								model.label_attribute_id
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
