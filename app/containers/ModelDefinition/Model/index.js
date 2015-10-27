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
			pluralUpdated: false,
			label: null
		}
	},

	componentWillUnmount: function () {
		document.removeEventListener('keyup', this.handleKeyPress)
	},

	commitChanges: function () {
		this.setState({committing: true, editing: false});
		var _this = this
		var key
		var model = _.clone(this.props.model)
		var name = this.state.name
		var plural = this.state.plural
		var label = this.state.label
		var numComps = _.countBy(KeycompStore.query({model_id: model.model_id}), 'key_id')

		var candidateKc = KeycompStore.query({attribute_id: label}).forEach(function (kc) {
			if (numComps[kc.key_id] === 1) key = KeyStore.get(kc.key_id)
		});
		if (!key) {
			modelActionCreators.create('key', false, {
				_named: false,
				_label: true,
				model_id: model.model_id
			}).then(function (k) {
				key = k
				modelActionCreators.create('keycomp', false, {key_id: key.cid, attribute_id: label})
			})
		}

		model.model = name
		model.plural = plural
		model.lock_user = 'me'

		modelActionCreators.create('model', true, model).then(function () {
			key.keycomps = KeycompStore.query({key_id: (key.key_id || key.cid)})
				.map(function(kc) {return _.pick(kc, 'attribute_id', 'ord')})
			console.log('key: ')
			console.log(key);
			// if (!key.key_id) return modelActionCreators.create('key', true, key, false)
		}).then(function (key) {
				// model.label = key.key_id
				model.lock_user = null
				modelActionCreators.create('model', true, model)
		}).then(function () {
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
		var model = this.props.model
		var value = event.target.value
		this.setState({label: value});
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
								<select value = {model.label} onChange = {this.handlePickLabel}> {
									[<option value={null} key="null-option">-Select from dropdown-</option>].concat(
									AttributeStore.query({model_id: model.model_id, type: 'TEXT'}).map(function (attr) {
										return <option value={attr.attribute_id} key={attr.attribute_id}>
					  						{attr.attribute}
					  					</option>
									}))
								} </select>
								:
								model.label
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
