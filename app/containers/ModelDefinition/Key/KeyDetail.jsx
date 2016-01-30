import React from "react"
import { Link } from "react-router"

import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"
import RelationStore from "../../../stores/RelationStore"
import modelActionCreators from '../../../actions/modelActionCreators'
import constants from '../../../constants/MetasheetConstants'

import getIconClasses from '../getIconClasses'
import _ from 'underscore'

import ConfirmationMixin from '../ConfirmationMixin'
import PureRenderMixin from 'react-addons-pure-render-mixin';


var KeyDetail = React.createClass({

	getInitialState: function () {
		var key = this.props._key;
		return {
			name: key.key
		}
	},

	commit: function () {
		var key = _.clone(this.props._key);
		if (key.name !== this.state.name) key._named = true
		key.key = this.state.name
		modelActionCreators.create('key', false, key)
		this.revert()
	},

	cancelChanges: function () {
		this.setState({editing: true})
	},

	handleNameUpdate: function (event) {
		this.setState({name: event.target.value})
	},

	handleCompChoice: function (e) {
		var value = e.target.value
		var key = this.props._key
		var components = KeycompStore.query({key_id: (key.key_id || key.cid)}, 'ord');
		var keycomp = {
			key_id: key.key_id,
			attribute_id: value,
			order: components.length
		}
		modelActionCreators.create('keycomp', false, keycomp)
	},

	handleDeleteComp: function (e, keycomp_id) {
		modelActionCreators.destroy('keycomp', false, {})
	},

	handleDelete: function (event) {
		var key = this.props._key
		modelActionCreators.destroy('key', false, key)
		event.preventDefault()
	},

	handleUniqClick: function (event) {
		var key = this.props._key
		if (this.props.editing) {
			key.uniq = !key.uniq
			modelActionCreators.create('key', false, key)
		}
	},

	render: function () {
		var _this = this;
		var key = this.props._key;
		var model = ModelStore.get(key.model_id)
		var keyOrd = this.props.keyOrd;
		var ord = keyOrd[key.key_id];
		var keyIcon = <span className={getIconClasses(ord, key)}></span>;
		var components = KeycompStore.query({key_id: (key.key_id || key.cid)}, 'ord');
		var compIndex = _.indexBy(components, 'attribute_id')
		var selections = [<option value={null} key="null-choice"> -- Select --</option>]
		var relations = RelationStore.query({related_key_id: key.key_id})
		var hasRelations = relations.length > 0
		var isPrimary = (model.primary_key_key_id === key.key_id)
		
		AttributeStore.query({model_id: key.model_id}).forEach(function (attr) {
			if (!(attr.attribute_id in compIndex)) selections.push(<option value = {attr.attribute_id} key = {attr.attribute_id}>
				{attr.attribute}
			</option>)
		})

		return <div className={"detail-grouping " + (this.props.editing ? ' editing' : '')}>
				<div key='keyrow' className = "detail-row main-row">
					{this.props.editing ?
						<span className="draggable" key="drag-cell">
							<span className="grayed icon icon-Layer_2 model-reorder"></span>
						</span>
						: null
					}
					<span style={{width: "70%"}} title = {key.key_id}>
						{
							this.props.editing ?
								<input value={_this.state.name}/>
								: key.key
						}		
					</span>
					<span style={{width: "10%"}}>
						{keyIcon}
					</span>
					<span style={{width: "10%"}}>
						<input type="checkbox"
							checked={key.uniq}
							onChange={this.handleUniqClick}/>
					</span>
					<span style={{width: "10%"}}>
						{this.props.editing ? <span className="clickable grayed icon icon-cr-remove"
							title="Delete key" onClick={this.handleDelete}>
							</span> : null}
					</span>
				</div>
				<div className="faint detail-row">
					<span style={{width: '100%'}}>
						<span>Includes: </span>
						{
						(this.props.editing && !isPrimary && !hasRelations) ?
						components.map(function (kc) {
							var attr = AttributeStore.get(kc.attribute_id)
							return <span className=  "keycomp-bubble" key={kc.cid || kc.keycomp_id}>
								{attr.attribute} 
								<span 
									className="clickable small grayed icon icon-kub-remove"
									onClick = {e => _this.handleDeleteComp(e, kc)}
									style = {{padding: '5px', lineHeight: '20px'}}>
								</span>
							</span>
						})
						:
						(components.map(function (comp) {
							return AttributeStore.get(comp.attribute_id).attribute
						}).join(', '))
						}
						{
						isPrimary ? 
							<span style={{marginLeft: '5px'}}> (The primary key cannot be changed)</span>
							: ''
						}
						{
						hasRelations ? 
							<span style={{marginLeft: '5px'}}>
								(This key is used as part of a relation:
								{relations.map(r => r.relation).join(', ')})
							</span> 
							: ''
						}
										
						{
						(this.props.editing && !isPrimary && !hasRelations) ? <select 
							className = "inline-select"
							onChange = {this.handleCompChoice} >
							{selections}
						</select> : null
						}

					</span>
				</div>
			</div>;
	}

});

export default KeyDetail;
