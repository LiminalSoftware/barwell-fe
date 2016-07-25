// LIBS
import React from "react"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import _ from "underscore"

// CONSTANTS
import fieldTypes from "../../../fields"
import constants from '../../../../../constants/MetasheetConstants';

// STORES
import AttributeStore from "../../../../../stores/AttributeStore";
import ModelStore from "../../../../../stores/ModelStore";
import RelationStore from "../../../../../stores/RelationStore";

// ACTIONS
import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"

// MIXINS
import blurOnClickMixin from '../../../../../blurOnClickMixin';
import popdownClickmodMixin from '../../../Fields/popdownClickmodMixin'

// UTIL
import util from '../../../../../util/util'

var ColumnAdder = React.createClass({

	mixins: [blurOnClickMixin],

	stepDescriptions: {
		0: "",
		1: "Attribute data type:",
		2: "Additional details:"
	},

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return {
			open: false, 
			type: null,
			name: "",
			step: 0,
			nameError: null
		}
	},

	componentWillMount: function () {
		this._debounceCheckName = _.debounce(this.checkName, 250)
	},

	componentDidUpdate: function () {
		if (this.state.step === 0 && this.state.open) this.setState({step: 1})
	},

	// UTILITIES ===============================================================

	checkName: function () {
		const errors = this.getNameErrors(this.state.name)
		this.setState({nameError: errors})
	},

	getNameErrors: function (name) {
		name = name || ""
		const model = this.props.model
		const unique = AttributeStore.query().filter(a=>a.model_id === model.model_id && 
			a.attribute === name).length === 0
		const nonEmpty = name.length > 0

		if (!unique) return "Attribute with this name already exists"
		if (!nonEmpty) return "Attribute name cannot be blank"
	},

	// HANDLERS ================================================================

	handleChooseType: function (type, e) {
		const fieldType = fieldTypes[type]
		const nameRoot = "New " + fieldType.description
		var name = nameRoot
		var iterator = 1
		var error = this.getNameErrors(name)

		while (error && iterator < 100) {
			name = nameRoot + " " + iterator++
			error = this.getNameErrors(name)
		}
		this.setState({
			type: type, 
			step: 2, 
			name:  name
		})
	},

	handleNameChange: function (e) {
		const name = e.target.value
		this.setState({name: name})
		this._debounceCheckName()
	},

	// really this should be called handle blur, but the mixin is written this way
	handleCommit: function () {
		this.setState({step: 0, type: null, name: null, open: false})
	},

	handleConfirm: function () {
		const model = this.props.model
		modelActionCreators.create('attribute', true, {
			attribute: this.state.name,
			model_id: model.cid || model.model_id,
			type: this.state.type
		})
		this.setState({step: 0, open: false})
	},

	handleSetDefault: function (value) {
		if (value !== null) this.setState({default: value})
	},

	// RENDER ===================================================================

	renderCategoriesList: function () {
		var _this = this
		var categories = _.uniq(Object.keys(fieldTypes)
			.map(type => fieldTypes[type].category))
			.filter(_.identity);

		return <div className="wizard-inner" key="chooseType">
			<div className = "wizard-blocks">
				{categories.map(c => <div className="block" key={c}>
					<span className="block-header attr-style">{c}</span>
					{_this.renderFieldList(c)}
				</div>)}
			</div>
		</div>
	},

	renderFieldList: function (category) {
		var config = this.props.config
		var _this = this
		var types = Object.keys(fieldTypes)
			.filter(_.identity)
			.map(function(id) {
				var type = fieldTypes[id];
				type.typeId = id
				return type
			}).filter(type => type.category === category)

		return types.map(type =>
		<span className="block-body attr-style selectable-attr-style"
			key = {type.typeId}
			onClick = {_this.handleChooseType.bind(_this, type.typeId)}>
			<span className = {"icon icon-" + type.icon}/>
			{type.description}
		</span>)
		
	},

	renderDefaultField: function () {
		var fieldType = fieldTypes[this.state.type]

		return <tr className="menu-item menu-sub-item">
			<td className="attr-style ">
				Default value:
			</td>
			<td style = {{position: "relative"}}>
				<span style = {{position: "absolute", background: "white", width: "100%", height: "100%"}}>
				{React.createElement(fieldType.element, {
					_recordCommit: this.handleSetDefault,
					_handleBlur: this.handleSetDefault,
					noAutoFocus: true,
					value: this.state.default,
					alwaysEdit: true,
					config: {type: this.state.type},
					selected: true,
					rowHeight: '40px',
					style: {
				        left: '0px',
				        bottom: '0px',
				        top: '0px',
				        right: '0px',
				        border: 'none'
				     }
				})}
				</span>
			</td>
		</tr>
	},

	renderRelatedModelPicker: function () {
		const model = this.props.model

		return <tr className="attr-style menu-item menu-sub-item">
			<td className="attr-style ">
				Related item
			</td>
			<td style={{position: "relative"}} className="attr-style">
				<select className="renamer flush">
				<option>-- Pick one --</option>
				{
				ModelStore.query({workspace_id: model.workspace_id}).map(mdl =>
					<option value={mdl.model_id} key={mdl.model_id}>
						{mdl.model}
					</option>
				)
				}
				</select>
			</td>
		</tr>
	},

	renderDetailForm: function () {
		var fieldType = fieldTypes[this.state.type]
		var _this = this

		return <div className="wizard-inner" key = "steup2">
			<table key="step2" style={{width: "100%"}}><tbody>
				<tr className="attr-style menu-item menu-sub-item">
					<td className="attr-style ">
						Attribute type:
					</td>
					<td style={{}} className="attr-style"
					onClick={e => _this.setState({step: 1})}>
						<span className={"icon icon-" + fieldType.icon}/>
						<span>{fieldType.description}</span>
					</td>
				</tr>
				{fieldType.category === 'Relations' ?
					this.renderRelatedModelPicker()
					: null
				}

				<tr className="attr-style menu-item menu-sub-item">
					<td className="attr-style ">
						Attribute name:
					</td>
					<td style={{ position: "relative"}}>
						<input style={{}} 
						autoFocus
						className = "flush renamer" value={this.state.name}
						onChange = {this.handleNameChange}/>
					</td>
				</tr>
				
				{fieldType.category === 'Relations' ?
					null
					: this.renderDefaultField()
				}

				{
				// <tr className="attr-style menu-item menu-sub-item">
				// 	<td className="attr-style ">
				// 		Description/notes:
				// 	</td>
				// </tr>
				// <tr><td>
				// 	<textarea className="renamer" style = {{width: "100%", height: "100px"}}/>
				// </td></tr>
				}
				
				{
					this.state.nameError  ? 
					<tr className="menu-item menu-sub-item"><td style = {{color: "lightcoral"}}>
					<span className="icon icon-warning"/>
					{this.state.nameError}
					</td></tr>
					: null
				}
			</tbody></table>

			<div className="menu-item menu-config-item" style={{position: "absolute", bottom: 0, left: 0, right: 0}}>
				<span 
					onClick = {this.handleCommit}
					className="menu-sub-item  selectable-attr-style attr-border  attr-style">
					<span className="icon icon-cross"/>
					<span>Nevermind</span>
				</span>
				<span 
					onClick = {this.handleConfirm}
					className="menu-sub-item selectable-attr-style attr-border attr-style">
					<span className="icon icon-check"/>
					<span>Done</span>
				</span>
				
			</div>
		</div>
	},

	render: function () {
		var step = this.state.step

		return <div 
			className="menu-item menu-config-item">

			<div className = {"menu-sub-item attr-style selectable-attr-style "}
				onClick = {this.handleOpen} key="adder">
				<span className = "icon icon-plus"/>
				<span>Add new attribute</span>
			</div>

			{
			this.state.open ? 
			<div className="wizard-overlay">
				
				<div className="wizard-title" key="title">
					<span>{this.stepDescriptions[this.state.step]}</span>
					<span style = {{float: "right"}}>(Step {this.state.step}/2)</span>
				</div>
				<ReactCSSTransitionGroup
					className="wizard-inner"
					{...constants.transitions.slideleft}
					onMouseDown={util.clickTrap}>
					{
					this.state.step === 1 ?
					this.renderCategoriesList()
					: this.state.step === 2 ?
					this.renderDetailForm()
					: <span key="done">done!</span>			
					}
				</ReactCSSTransitionGroup>
			</div>
			: null
			}
		</div>
	},
})

export default ColumnAdder