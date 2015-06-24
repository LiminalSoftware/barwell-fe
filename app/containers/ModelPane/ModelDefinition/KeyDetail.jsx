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

var KeyDetailList = React.createClass({

	handleAddNewKey: function (event) {
		var model = this.props.model;
		var obj = {
			key: 'New key',
			model_id: model.model_id,
			indexed: false,
			uniq: false
		}
		modelActionCreators.create('key', false, obj)
	},

	render: function () {
		var model = this.props.model
		var iter = 0
		var keyOrd = {}
		var keyList

		KeyStore.query({model_id: model.model_id}, 'key_id').forEach(function (key) {
			return keyOrd[key.key_id] = iter ++ ;
		})
		keyList = KeyStore.query({model_id: (model.model_id || model.cid)}).map(function (key) {
			var keyId = (key.key_id || key.cid)
			return <KeyDetail key={"model-definition-key-" + keyId} _key = {key} keyOrd = {keyOrd} />;
		})

		return <div className = "detail-block">
			<h3 key="keys-header">Keys</h3>
			<table key="keys-table" className="detail-table">
				<thead>
					<tr key="key-header-row">
						<th className="width-10" key="key-header-expand"></th>
						<th className="width-40" key="key-header-name">Name / Component</th>
						<th className="width-10" key="key-header-icon"></th>
						<th className="width-20" key="key-header-uniq">Unique?</th>
						<th className="width-20" key="attr-header-actions"></th>
					</tr>
				</thead>
				{keyList}
			</table>
			<div><a className="new-adder new-key" onClick={this.handleAddNewKey}><span className="small addNew icon icon-plus"></span>New key</a></div>
		</div>
	}

})

var KeyDetail = React.createClass({

	getInitialState: function () {
		var key = this.props._key; 
		return {
			open: (key._dirty === true),
			renaming: false,
			name: key.key
		}
	},

	componentWillUnmount: function () {
		document.removeEventListener('keyup', this.handleKeyPress)
	},

	commitChanges: function () {
		var key = _.clone(this.props._key);
		key.key = this.state.name
		modelActionCreators.create('key', false, key)
		this.revert()
	},
	
	cancelChanges: function () {
		this.revert()
	},
	
	handleEdit: function () {
		var key = this.props._key;
		if (this.state.renaming) return
		this.setState({
			renaming: true,
			name: key.key
		}, function () {
			React.findDOMNode(this.refs.renamer).focus();
		})
		document.addEventListener('keyup', this.handleKeyPress)
	},
	
	revert: function () {
		var key = this.props._key;
		document.removeEventListener('keyup', this.handleKeyPress)
		this.setState({
			renaming: false,
			name: key.key
		})
	},

	handleKeyPress: function (event) {
		if (event.keyCode === 27) this.cancelChanges()
		if (event.keyCode === 13) this.commitChanges()
	},

	handleNameUpdate: function (event) {
		this.setState({name: event.target.value})
	},

	handleDelete: function (event) {
		var key = this.props._key
		modelActionCreators.destroy('key', false, key)
		event.preventDefault()
	},

	handleUndelete: function (event) {
		var key = this.props._key
		modelActionCreators.undestroy('key', key)
		event.preventDefault()
	},

	toggleDetails: function (event) {
		this.setState({open: !this.state.open});
	},

	handleUniqClick: function (event) {
		var key = this.props._key
		key.uniq = event.value
		modelActionCreators.create('key', false, key)
	},

	render: function () {
		var _this = this
		var key = this.props._key;
		var keyOrd = this.props.keyOrd;
		var reactKey = 'key-' + (key.key_id || key.cid);
		var wedgeClasses = "small grayed icon wedge icon-geo-triangle " +
			(this.state.open ? "open" : "closed");
		var ord = keyOrd[key.key_id];
		var keyIcon = <span className={getIconClasses(ord, key)}></span>;
		var components = KeycompStore.query({key_id: (key.key_id || key.cid)}, 'ord');
		var nameField
		var actions = []

		var compTrs = components.map(function (keycomp, idx) {
			return <KeycompDetail 
				key = {'keycomp-' + (keycomp.keycomp_id || keycomp.cid)}
				_key = {key}
				idx = {idx}
				keycomp = {keycomp}/>
		});

		if (key._destroy) {
			actions.push(<span className="showonhover clickable grayed icon icon-tl-undo" 
				title="Restore" 
				key="restore"
				onClick={this.handleUndelete}>
				</span> )
		} else if (key.key_id) {
			if(!key.is_primary) actions.push(<span className="showonhover clickable grayed icon icon-kub-trash" 
				title="Delete key" 
				key="delete"
				onClick={this.handleDelete}>
				</span>)
			actions.push(<span className="showonhover clickable grayed icon icon-tl-pencil" 
				title="Edit key" 
				key="edit"
				onClick={this.handleEdit}>
				</span>)
			
		} else {
			actions.push(<span className="showonhover small clickable grayed icon icon-kub-remove" 
				title="Cancel"
				key="cancel"
				onClick={this.handleDelete}>
				</span>)
			actions.push(<span className="showonhover clickable grayed icon icon-tl-pencil" 
				title="Edit key" 
				key="edit"
				onClick={this.handleEdit}>
				</span>)
		}

		if (key._dirty === true) 
			compTrs.push(<KeycompDetail 
				key = {'keycomp-new'}
				_key = {key}
				idx = {compTrs.length}/>)


		if (this.state.renaming) 
			nameField = <input ref="renamer" 
				value={this.state.name} 
				onChange={this.handleNameUpdate} 
				onBlur={this.commitChanges}/> 
		else nameField = key.key;


		return <tbody key={reactKey} className={this.state.open ? '' : 'singleton'}>
					<tr 
					key={reactKey + '-' + 'keyrow'} 
					className={(key._dirty?'unsaved':'') + (key._destroy?'destroyed':'')}>
			<td onClick={this.toggleDetails} className="no-line"><span className={wedgeClasses}></span></td>
			<td onDoubleClick={this.handleEdit} title={key.key_id}>
				{nameField}
			</td>
			<td>{keyIcon}</td>
			<td><input type="checkbox" checked={key.uniq} onChange={this.handleUniqClick}></input></td>
			<td className="centered">
				{actions}
			</td>

		</tr>{this.state.open ? compTrs : null}</tbody>;
	}

});

var KeycompDetail = React.createClass({

	handleAttrChoice: function (event) {
		var key = this.props._key;
		var keycomp = this.props.keycomp || {}
		var model = ModelStore.get(key.model_id)
		var attribute_id = event.target.value

		keycomp.key_id = key.cid
		keycomp.attribute_id = attribute_id
		keycomp.ord = this.props.idx

		modelActionCreators.create('keycomp', false, keycomp)
	},

	handleDelete: function (event) {
		var keycomp = this.props.keycomp;
		if (!keycomp) return
		modelActionCreators.genericAction(
			'keycomp',
			'destroy',
			{cid: keycomp.cid})
	},

	render: function () {
		var keycomp = this.props.keycomp || {};
		var key = this.props._key;
		var attribute_name = (!!keycomp.attribute_id) ? AttributeStore.get(keycomp.attribute_id).attribute : ''
		var idx = this.props.idx
		var existingComps = {}
		var attrSelections = []
		
		if (key._dirty) {
			// find existing selections so we can exclude them from the menu
			KeycompStore.query({key_id: (key.key_id || key.cid)}).forEach(function (kc) {
				existingComps[kc.attribute_id] = kc.attribute_id
			})
			AttributeStore.query({model_id: key.model_id}).forEach(function (attr) {
				if (attr.attribute_id != keycomp.attribute_id && attr.attribute_id in existingComps) return;
				if (attr._destroy) return;
				var attribute_id = (attr.attribute_id || attr.cid)
				attrSelections.push(
					<option value={attribute_id} key={attribute_id}>
  						{attr.attribute}
  					</option>
  				);
  			})
  			if (!keycomp.keycomp_id) attrSelections.unshift(<option value={0}> ---- </option>);
		}
		

		return <tr className={(key._dirty?'unsaved':'') + (key._destroy?'destroyed':'')}>
			<td className="no-line">
				<span className="num-circle">{idx + 1}</span> 
			</td>
			<td>
				
				<span>
					{key._dirty ?
						<select 
							ref="selector" 
							name="type" 
							value = {keycomp.attribute_id || 0}
							onChange = {this.handleAttrChoice}>
							{attrSelections}
						</select>
						: attribute_name
					}
					
				</span>
			</td>
			<td></td>
			<td></td>
			<td className="centered">
			{!keycomp.keycomp_id && !keycomp.cid ? null : <span 
				className="showonhover small clickable grayed icon icon-kub-remove" 
				title="Delete component" 
				onClick={this.handleDelete}>
			</span>}</td>
		</tr>
	}
})

export default KeyDetailList;