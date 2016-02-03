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
			name: key.key,
			_isNamed: !(key.key_id)
		}
	},

	cancelChanges: function () {
		this.setState({editing: true})
	},

	handleNameUpdate: function (e) {
		this.setState({name: e.target.value, _isNamed: true})
	},

	handleBlurName: function (e) {
		this.commitUpdate({
			key: this.state.name,
		})
	},

	handleCompChoice: function (e) {
		var value = e.target.value
		var key = this.props._key
		var components = KeycompStore.query({key_id: (key.cid || key.key_id)}, 'ord');
		var attribute = AttributeStore.get(value)
		var keycomp = {
			key_id: key.cid || key.key_id,
			attribute_id: value,
			order: components.length
		}
		if (!value || value === 'null') return
		modelActionCreators.create('keycomp', false, keycomp)

		// if the key has not been named, then name it based on the selected component
		if (!this.state._isNamed) {
			key.key = attribute.attribute + ' key'
			modelActionCreators.create('key', false, key)
		}
	},

	commitUpdate: function (diff) {
		var key = _.clone(this.props._key)
		key = _.extend(key, diff || {})
		this.setState(diff)
		modelActionCreators.create('key', false, key)
	},

	handleDeleteComp: function (e, keycomp) {
		console.log('delete key comp: ' + JSON.stringify(keycomp))
		modelActionCreators.destroy('keycomp', false, keycomp)
	},

	handleDelete: function (event) {
		console.log('delete key')
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
		var selections = [<option value={'null'} key="null-choice"> -- Select --</option>]
		var relations = RelationStore.query({related_key_id: key.key_id})
		var hasRelations = relations.length > 0
		var isPrimary = (model.primary_key_key_id === key.key_id)
		var isLabel = (model.label_key_id === key.key_id)
		var isChangable = !isPrimary && !hasRelations && !isLabel
		
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
								<input value={_this.state.name} 
									onChange = {this.handleNameUpdate} 
									onBlur = {this.handleBlurName}/>
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
						{this.props.editing && isChangable ? 
							<span className="clickable grayed icon icon-cr-remove"
								title="Delete key" onClick={this.handleDelete}>
							</span> : null}
					</span>
				</div>
				<div className="faint detail-row">
					<span style={{width: '100%'}}>
						<span>Includes: </span>
						{
						(this.props.editing && isChangable) ?
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
						(this.props.editing && isChangable) ? <select 
							className = "inline-select"
							style = {{marginLeft: '3px'}}
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
