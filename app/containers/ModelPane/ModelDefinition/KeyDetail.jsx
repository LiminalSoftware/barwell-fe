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
			return <KeyDetail key={"model-definition-key-" + keyId} mdlKey = {key} keyOrd = {keyOrd} />;
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
		var key = this.props.mdlKey; 
		return {
			open: (key._dirty === true),
			renaming: false,
			key: key.key
		}
	},

	toggleDetails: function (event) {
		this.setState({open: !this.state.open});
	},

	handleDelete: function (event) {

	},

	handleUniqClick: function (event) {
		var key = this.props.mdlKey
		key.uniq = !(key.uniq)
		modelActionCreators.create('key', false, key)
	},

	render: function () {
		var _this = this
		var key = this.props.mdlKey;
		var keyOrd = this.props.keyOrd;
		var reactKey = 'key-' + (key.key_id || key.cid);
		var wedgeClasses = "small grayed icon wedge icon-geo-triangle " +
			(this.state.open ? "open" : "closed");
		var ord = keyOrd[key.key_id];
		var keyIcon = <span className={getIconClasses(ord, key)}></span>;
		var components = KeycompStore.query({key_id: (key.key_id || key.cid)}, 'ord');

		var attrSelections = AttributeStore.query({model_id: key.model_id}).map(function (attr) {
			return <option value={(attr.attribute_id || attr.cid)}>
  				{attr.attribute}
  			</option>;
		})
		attrSelections.unshift(<option value="0"> ---- </option>)

		var compTrs = components.map(function (keycomp, idx) {
			return <KeycompDetail 
				key = {'keycomp-' + (keycomp.keycomp_id || keycomp.cid)}
				_key = {key}
				idx = {idx}
				keycomp = {keycomp}/>
		});

		if (key._dirty === true) compTrs.push(<KeycompDetail 
				key = {'keycomp-new'}
				_key = {key}
				idx = {compTrs.length}/>)

		return <tbody key={reactKey} className={this.state.open ? '' : 'singleton'}>
					<tr 
					key={reactKey + '-' + 'keyrow'} 
					className={key._dirty ? 'unsaved' : ''}>
			<td onClick={this.toggleDetails} className="no-line"><span className={wedgeClasses}></span></td>
			<td>{key.key}</td>
			<td>{keyIcon}</td>
			<td><input type="checkbox" checked={key.uniq} onClick={this.handleUniqClick}></input></td>
			<td className="centered"><span className="showonhover clickable grayed icon icon-kub-trash" title="Delete attribute" onClick={_this.handleDelete}></span></td>

		</tr>{this.state.open ? compTrs : null}</tbody>;
	}

});

var KeycompDetail = React.createClass({

	handleAttrChoice: function (event) {
		var key = this.props._key;
		var keycomp = {
			key_id: key.cid,
			attribute_id: attribute_id,
			ord: this.props.idx
		}
		var model = ModelStore.get(key.model_id)
		var attribute_id = event.target.value

		keycomp.key_id = key.cid
		keycomp.attribute_id = attribute_id

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
		var keycomp = this.props.keycomp;
		var key = this.props._key;
		var attribute_id = (!!keycomp) ? keycomp.attribute_id : 0;
		var attribute_name = (!!keycomp) ? AttributeStore.get(keycomp.attribute_id).attribute : '';
		var idx = this.props.idx;

		var attrSelections = AttributeStore.query({model_id: key.model_id}).map(function (attr) {
			return <option value={(attr.attribute_id || attr.cid)}>
  				{attr.attribute}
  			</option>;
		})
		if (!keycomp) attrSelections.unshift(<option value={0}> ---- </option>)

		return <tr className = {key._dirty ? 'unsaved':''}>
			<td className="no-line">
				<span className="num-circle">{idx + 1}</span> 
			</td>
			<td>
				
				<span>
					{key._dirty ?
						<select 
							ref="selector" 
							name="type" 
							value = {attribute_id || 0} 
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
			{key._persist === false && (!!keycomp) ? <span 
				className="showonhover small clickable grayed icon icon-kub-remove" 
				title="Delete component" 
				onClick={this.handleDelete}>
			</span> : null }</td>
		</tr>
	}
})

export default KeyDetailList;