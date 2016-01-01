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

	handleCompChoice: function () {

	},

	handleDelete: function (event) {
		var key = this.props._key
		modelActionCreators.destroy('key', false, key)
		event.preventDefault()
	},

	handleUniqClick: function (event) {
		var key = this.props._key
		key.uniq = !key.uniq
		modelActionCreators.create('key', false, key)
	},

	render: function () {
		var _this = this;
		var key = this.props._key;
		var keyOrd = this.props.keyOrd;
		var ord = keyOrd[key.key_id];
		var keyIcon = <span className={getIconClasses(ord, key)}></span>;
		var components = KeycompStore.query({key_id: (key.key_id || key.cid)}, 'ord');

		var selections = AttributeStore.query({model_id: key.model_id}).map(function (attr) {
			return <option value = {attr.attribute_id} key = {attr.attribute_id}>
				{attr.attribute}
			</option>
		})

		return <div className={"detail-grouping " + (this.props.editing ? ' editing' : '')}>
				<div key='keyrow' className = "detail-row main-row">
					{this.props.editing ?
						<span className="draggable" key="drag-cell">
							<span className="tighter icon icon-Layer_2 model-reorder"></span>
						</span>
						: null
					}
					<span className="width-70">
						{
							this.props.editing ?
							<input value={_this.state.name}/>
							:
							<div>
								<div>{key.key}</div>
								<div className="faint">
									<span className="">Including: </span> {
										components.map(function (comp) {
											return AttributeStore.get(comp.attribute_id).attribute
										}).join(', ')
									}
								</div>
							</div>
						}
					</span>
					<span className="width-10">
						{keyIcon}
					</span>
					<span className="width-10">
						<input type="checkbox"
							checked={key.uniq}
							onChange={this.handleUniqClick}/>
					</span>
					<span className="width-10 grayed">
						{this.props.editing ? <span className="clickable icon icon-kub-trash"
							title="Delete key" onClick={this.handleDelete}>
							</span> : null}
					</span>
				</div>
				{
					this.props.editing ?
					components.map(function (comp) {
						return <div className="detail-row sub-row">
							<span className="width-70">
								<select value = {comp.attribute_id}
												onChange = {_this.handleCompChoice}>
									{selections}
								</select>
							</span>
							<span className="width-10"></span>
							<span className="width-10"></span>
							<span className="width-10 grayed">
								<span className="clickable icon icon-kub-trash"
									title="Delete component" onClick={_this.handleDelete}>
								</span>
							</span>
						</div>;
					}).concat(<div className="detail-row sub-row">
						<span className="width-70">
						<ul className="light mb-buttons">
							<li onClick={this.handleEdit}>Add component</li>
						</ul>
						</span>
						<span className="width-10"></span>
						<span className="width-10"></span>
						<span className="width-10"></span>
					</div>)
					:
					null
				}
			</div>;
	}

});

export default KeyDetail;
