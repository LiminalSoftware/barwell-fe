import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"
import modelActionCreators from '../../../actions/modelActionCreators'
import constants from '../../../constants/MetasheetConstants'
import getIconClasses from './getIconClasses'
import _ from 'underscore'
import pluralize from 'pluralize'

var ModelDetails = React.createClass({

	getInitialState: function () {
		var model = this.props.model;
		return {
			name: model.model,
			plural: model.plural,
			editingName: false,
			editingPlural: false
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
		var numComps = _.countBy(KeycompStore.query(), 'key_id')
		var candidateKc = KeycompStore.query({attribute_id: value}).forEach(function (kc) {
			if (numComps[kc.key_id] === 1) key = KeyStore.get(kc.key_id)
		});
		if (!key) {
			
		}
	},
	
	handleEditName: function () {
		var model = this.props.model;
		if (this.state.editingName) return
		this.setState({
			editingName: true,
			editingPlural: false,
			name: model.model
		}, function () {
			React.findDOMNode(this.refs.renamer).focus();
		})
		document.addEventListener('keyup', this.handleKeyPress)
	},

	handleEditPlural: function () {
		var model = this.props.model;
		if (this.state.editingPlural) return
		this.setState({
			enditingName: false,
			editingPlural: true,
			plural: model.plural
		}, function () {
			React.findDOMNode(this.refs.replural).focus();
		})
		document.addEventListener('keyup', this.handleKeyPress)
	},
	
	revert: function () {
		var model = this.props.model;
		document.removeEventListener('keyup', this.handleKeyPress)
		this.setState({
			editingPlural: false,
			editingName: false,
			name: model.model,
			plural: model.plural
		})
	},

	handleKeyPress: function (event) {
		if (event.keyCode === 27) this.cancelChanges()
		if (event.keyCode === 13) this.commitChanges()
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
			<h3>Details</h3>
			<table className="detail-table">
				<tbody>
					<tr 
					className={'top-line ' + (model._dirty?'unsaved':'')}>
					
						<td className="width-30">
							Name:
						</td>
						<td className="width-60"
							onDoubleClick={this.handleEditName}>
								{this.state.editingName ? 
								<input 
									value={this.state.name} 
									onChange={this.handleNameUpdate} 
									ref="renamer"/>
								: 
								<span>
									{this.state.name}
								</span>
								}
						</td>
						<td className="width-10">
							
								<span className="showonhover clickable grayed icon icon-tl-pencil" 
									title="Edit name" onClick={this.handleEditName}></span>
						</td>
					</tr>
					<tr className={ (model._dirty?'unsaved':'')}>
						<td className="width-30">Plural:</td>
						<td className="width-60" onDoubleClick={this.handleEditPlural}>
							{this.state.editingPlural ? 
								<input 
									value={this.state.plural} 
									onChange={this.handlePluralUpdate} 
									ref="replural"/>
								: <span>
									{this.state.plural}
								</span>
							}
						</td>
						<td>
							<span className="showonhover clickable grayed icon icon-tl-pencil" 
									title="Edit plural" onClick={this.handleEditPlural}></span>
						</td>
					</tr>
					<tr className={ (model._dirty?'unsaved':'')}>
						<td className="width-30">Label:</td>
						<td className="width-60">
							<select value = {model.label_attribute_id} onChange = {this.handlePickLabel}> {
								AttributeStore.query({model_id: model.model_id, type: 'TEXT'}).map(function (attr) {
									return <option value={attr.attribute_id} key={attr.attribute_id}>
				  						{attr.attribute}
				  					</option>
								})
							} </select>
						</td>
						<td>
						</td>
					</tr>
					<ModelDeleter model={model} />
				</tbody>
			</table>
		</div>
	}
});

var ModelDeleter = React.createClass({
	getInitialState: function () {
		return {
			armed: false, 
			input: ''
		}
	},
	arm: function () {
		this.setState({armed: true})
		document.addEventListener('keyup', this.handleKeyPress)
	},
	disarm: function () {
		this.setState({armed: false, input: ''})
		document.removeEventListener('keyup', this.handleKeyPress)
	},
	handleKeyPress: function (event) {
		if (event.keyCode === constants.keycodes.ESC) 
			this.disarm()
	},
	handleTyping: function (event) {
		var val = event.target.value
		this.setState({input: val})
		if (val.toUpperCase() == 'DESTROY') {
			console.log('launch code complete')
			modelActionCreators.dropModel(this.props.model)
		}
	},
	render: function () {
		return !this.state.armed ?
		<tr>
			<td colSpan="3" className="clickable" onClick = {this.arm}>
				Delete this model
			</td>
		</tr>
		:
		<tr>
			<td className="destroy-td">
				<span className="large icon redened icon-skull-bones"></span>
				Type "destroy":
			</td>
			<td colSpan="2">
				<input className="destroyer" 
					onBlur = {this.disarm}
					value = {this.state.input}
					autoFocus onChange={this.handleTyping} 
					ref="deleteInput"/>
			</td>
		</tr>
		;
	}
})

export default ModelDetails;

