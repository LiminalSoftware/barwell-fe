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
import util from '../../../util/util'
import ConfirmationMixin from '../ConfirmationMixin'
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

var AttributeDetail = React.createClass({

	mixins: [PureRenderMixin],

	getInitialState: function () {
		var attribute = this.props.attribute
		return attribute
	},

	componentWillReceiveProps: function (nextProps) {
		var attribute = nextProps.attribute
		if (!this.props.editing) this.setState(attribute)
	},

	commitUpdate: function (state) {
		var attribute = _.extend(this.props.attribute, state)
		this.setState(state)
		modelActionCreators.create('attribute', false, attribute)
	},

	handleNameUpdate: function (e) {
		this.commitUpdate({attribute: e.target.value})
	},

	handleTypeChange: function (e) {
		this.commitUpdate({type: e.target.value})
	},

	handleDelete: function (event) {
		var attribute = this.props.attribute
		modelActionCreators.destroy('attribute', false, attribute)
		event.preventDefault()
	},

	toggleVisibility: function () {
		this.commitUpdate({hidden: !this.state.hidden})
	},

	render: function () {
		var _this = this;
		var col = this.props.attribute;
		var model = this.props.model;
		var keyOrd = this.props.keyOrd;
		var name = col.attribute;
		var keyIcons = [];
		var components = KeycompStore.query({attribute_id: col.attribute_id});

		var typeFieldChoices = Object.keys(constants.fieldTypes).filter(function (type) {
			return type !== 'PRIMARY_KEY'
		}).map(function (type) {
  			return <option value={type} key={type}>
  				{constants.fieldTypes[type]}
  			</option>;
		});

		components.forEach(function (comp, idx) {
			var key = KeyStore.get(comp.key_id)
			if (!key) return;
			var ord = keyOrd[key.key_id]
			keyIcons.push(<span
				key = {'keycomp-' + comp.keycomp_id}
				className={getIconClasses(ord, key)}
				title={key.key} />
			);
		});

		if(keyIcons.length === 0) keyIcons.push(<span>-</span>)

		var key = "attribute-" + (col.attribute_id || col.cid);

		var actions = [];

		return <ReactCSSTransitionGroup
				transitionEnterTimeout={500}
				transitionLeaveTimeout={300} 
				key={key} 
				transitionName="detail-row" 
				component = "div"
				className={("detail-row ") + (col._dirty ?' unsaved ':'') + (col._destroy ? ' destroyed ':'') +
				 (this.props.editing ? ' editing ' : '') + (this.state.new ? ' new' : '')}>

				{this.props.editing ?
					<span className="draggable" key="drag-cell">
						<span className="grayed icon icon-Layer_2 model-reorder"></span>
					</span>
					: null
				}
				<span  key={key + '-name'} 
					title={col.attribute_id}
					style = {{width: '35%'}}>
					{this.props.editing ?
					<input ref="renamer"
						className="renamer header-renamer"
						value = {this.state.attribute}
						onChange = {this.handleNameUpdate}
						onBlur = {this.commitUpdate}
						/>
					: col.attribute
					}
				</span>
				{
					this.props.editing ?
					<span style = {{width: '25%'}}>
						<select name="type" value={col.type} onChange={this.handleTypeChange}>
							{typeFieldChoices}
						</select>
					</span>
					:
					<span style = {{width: '20%'}}>
						{constants.fieldTypes[col.type]}
					</span>
				}
				<span  style = {{width: '20%', textAlign: 'center'}}>
					{keyIcons}
				</span>
				<span style = {{width: '20%', textAlign: 'center'}}>
					<span className = {"grayed clickable icon " + (this.state.hidden ? " icon-eye-4 " : " icon-eye-3")}
						onClick = {this.toggleVisibility}/>
					{
						this.props.editing ? 
						<span className="grayed clickable icon icon-cr-remove"
						title="Delete attribute" onClick={this.handleDelete}/>
						: null
					}
				</span>

			</ReactCSSTransitionGroup>


	}
});

export default AttributeDetail
