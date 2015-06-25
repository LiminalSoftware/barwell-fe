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

		if (this.editingName) plural = pluralize.plural(name)

		console.log('plural: '+ JSON.stringify(plural, null, 2));
		
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
		return <div className="detail-block">
			<h3>Details</h3>
			<table className="detail-table">
				<tbody>
					<tr className="top-line">
						<td className="width-30">Name:</td>
						<td className="width-70"onDoubleClick={this.handleEditName}>
							{this.state.editingName ? 
								<input value={this.state.name} onChange={this.handleNameUpdate} ref="renamer"/>
								: <span>{this.state.name}
								<span className="showonhover clickable grayed icon icon-tl-pencil" 
									title="Edit name" onClick={this.handleEditName}></span></span>
							}
						</td>
					</tr>
					<tr className="bottom-line">
						<td className="width-30">Plural:</td>
						<td className="width-70" onDoubleClick={this.handleEditPlural}>
							{this.state.editingPlural ? 
								<input value={this.state.plural} onChange={this.handlePluralUpdate} ref="replural"/>
								: <span>{this.state.plural}
								<span className="showonhover clickable grayed icon icon-tl-pencil" 
									title="Edit plural" onClick={this.handleEditPlural}></span></span>
							}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	}
});

export default ModelDetails;

