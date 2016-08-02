// LIBS
import React from "react"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import _ from "underscore"

// CONSTANTS
import fieldTypes from "../../Views/fields"
import constants from "../../constants/MetasheetConstants";

// STORES
import AttributeStore from "../../stores/AttributeStore";
import ModelStore from "../../stores/ModelStore";
import RelationStore from "../../stores/RelationStore";

// ACTIONS
import modelActionCreators from "../../actions/modelActionCreators.jsx"

// UTIL
import util from "../../util/util"

const cardinalityMap = {
	'ONE_TO_ONE': ['HAS_ONE', 'HAS_ONE'],
	'HAS_ONE': ['HAS_ONE', 'HAS_MANY'],
	'HAS_MANY': ['HAS_MANY', 'HAS_ONE'],
	'MANY_TO_MANY' : ['HAS_MANY', 'HAS_MANY']
}

const inverseCardinalityMap = _.invert(cardinalityMap)

const defaultState = {
	open: false, 
	type: null,
	name: "",
	reverseName: "",
	cardinality: [],
	step: 0,
	nameError: null,
	hasBeenRenamed: false,
	reverseHasBeenRenamed: false,
	relatedModel: null,
	defaultValue: null
}

const stepDescriptions = {
	0: "",
	1: "Attribute data type:",
	2: "Additional details:",
	3: "Relation details"
}

var ColumnAdder = React.createClass({

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return defaultState
	},

	componentWillMount: function () {
		this._debounceErrorCheck= _.debounce(this.errorCheck, 250)
	},

	componentDidUpdate: function () {
		if (this.state.step === 0) this.setState({
			step: 1
		})
	},

	// UTILITIES ===============================================================

	errorCheck: function () {
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
		var name = this.state.hasBeenRenamed ? this.state.name : nameRoot
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
		this.setState({name: name, hasBeenRenamed: true})
		this._debounceErrorCheck()
	},

	handleReverseNameChange: function (e) {
		const name = e.target.value
		this.setState({reverseName: name, reverseHasBeenRenamed: true})
		this._debounceErrorCheck()
	},

	handleChooseRelatedModel: function (e) {
		const fieldType = fieldTypes[this.state.type]
		const modelId = e.target.value
		const thisModel = ModelStore.get(this.props.model.model_id)
		const cardinality = cardinalityMap[this.state.type]
		const relatedModel = ModelStore.get(modelId)

		this.setState({
			step: 3,
			relatedModel: modelId,
			cardinality: cardinality,
			name: this.state.hasBeenRenamed ? 
				this.state.name : 
				cardinality[0] === 'HAS_MANY' ? 
					relatedModel.plural :
					relatedModel.model,
			reverseName: this.state.reverseHasBeenRenamed ? 
				this.state.reverseName : 
				cardinality[1] === 'HAS_MANY' ?
					thisModel.plural :
					thisModel.model
		})
		
	},

	// really this should be called handle blur, but the mixin is written this way
	handleCommit: function () {
		this.setState(defaultState)
	},

	handleConfirm: function () {
		const model = this.props.model
		const fieldType = fieldTypes[this.state.type]

		if (fieldType.category === 'Relations') {
			modelActionCreators.create('relation', true, {
				model_id: model.model_id,
				related_model_id: parseInt(this.state.relatedModel),
				relation: this.state.name,
				related_relation: this.state.reverseName,
				type: this.state.type
			})
		} else {
			modelActionCreators.create('attribute', true, {
				attribute: this.state.name,
				model_id: model.cid || model.model_id,
				type: this.state.type,
				default_value: this.state.defaultValue
			})
		}
		
		this.setState(defaultState)
	},

	handleSetDefault: function (value) {
		if (value !== null) this.setState({defaultValue: value})
	},

	handleSelectCardinality: function (dir, e) {
		var value = e.target.value
		var cardinality = this.state.cardinality
		var thisModel = this.props.model
		var relatedModel = ModelStore.get(this.state.relatedModel)

		if (dir === 'fwd') cardinality[0] = value
		else cardinality[1] = value
		
		this.setState({
			cardinality: cardinality,
			type: inverseCardinalityMap[cardinality],
			name: this.state.hasBeenRenamed ? 
				this.state.name : 
				cardinality[0] === 'HAS_MANY' ? 
					relatedModel.plural :
					relatedModel.model,
			reverseName: this.state.reverseHasBeenRenamed ? 
				this.state.reverseName : 
				cardinality[1] === 'HAS_MANY' ?
					thisModel.plural :
					thisModel.model
		}, )
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

		return <div className="menu-item menu-sub-item">
			<span className="attr-style ">
				Default value:
			</span>
			<span style = {{position: "relative"}}>
				<span style = {{position: "absolute", background: "white", width: "100%", height: "100%"}}>
				{React.createElement(fieldType.element, {
					_recordCommit: this.handleSetDefault,
					_handleBlur: this.handleSetDefault,
					noAutoFocus: true,
					value: this.state.defaultValue,
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
			</span>
		</div>
	},

	renderRelatedModelPicker: function () {
		const model = this.props.model

		return <div className="attr-style menu-item menu-sub-item">
			<span className="attr-style ">
				Related item:
			</span>
			<span style={{position: "relative"}} className="attr-style">
				<select className="renamer flush" onChange={this.handleChooseRelatedModel}>
				<option>-- Pick one --</option>
				{
				ModelStore.query({workspace_id: model.workspace_id}).map(mdl =>
					<option value={mdl.model_id} key={mdl.model_id}>
						{mdl.model}
					</option>
				)
				}
				</select>
			</span>
		</div>
	},

	renderCardinalityForm: function () {
		var relatedModel = ModelStore.get(this.state.relatedModel)
		var thisModel = this.props.model
		var _this = this
		var fieldType = fieldTypes[this.state.type]
		var fwdCardinality = this.state.cardinality[0]
		var bwdCardinality = this.state.cardinality[1]

		return <div className="wizard-inner" key = "steup3">

			<div className="attr-style menu-item menu-sub-item">
				<span className="attr-style ">
					Attribute type:
				</span>
				<span style={{}} className="attr-style selectable-attr-style"
				onClick={e => _this.setState({step: 1})}>
					<span className={"icon icon-" + fieldType.icon} style={{marginLeft: "5px"}}/>
					<span>{fieldType.description}</span>
				</span>
			</div>

			<div className="attr-style menu-item menu-sub-item">
				<span className="attr-style ">
					Related item
				</span>
				<span style={{position: "relative"}} 
					onClick={e => _this.setState({step: 2})}
					className="attr-style selectable-attr-style">
					<span style={{marginLeft: "5px"}}>{relatedModel.model}</span>
				</span>
			</div>

			<div className="attr-style menu-item menu-sub-item">
				{this.renderCadinalityLeg(
					thisModel, 
					fwdCardinality, 
					this.handleSelectCardinality.bind(this, 'fwd'),
					this.state.name,
					this.handleNameChange
				)}
			</div>

			<div className="attr-style menu-item menu-sub-item">
				{this.renderCadinalityLeg(
					relatedModel, 
					bwdCardinality, 
					this.handleSelectCardinality.bind(this, 'bwd'),
					this.state.reverseName,
					this.handleReverseNameChange
				)}
			</div>

			{this.renderConfirmButtons()}
		</div>
	},

	renderCadinalityLeg: function (model, cardinality, selectCardinality, name, changeName) {

		return <span className="attr-style" style = {{position: "relative"}}>
			Each <span>{model.model}</span> can have

			<select className="renamer" value = {cardinality}
				onChange = {selectCardinality}
				style={{marginRight: "5px", marginLeft: "5px", height: "32px"}}>
				<option value="HAS_ONE"> at most one </option>
				<option value="HAS_MANY"> many </option>
			</select>

			<span>
				<input style={{height: "28px"}} 
					autoFocus className = "renamer" value={name}
					onChange = {changeName}/>
			</span>
		</span>
	},


	renderConfirmButtons: function () {
		return <div className="menu-item menu-config-item" 
		style={{position: "absolute", bottom: 0, left: 0, right: 0}}>
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
	},

	renderDetailForm: function () {
		var fieldType = fieldTypes[this.state.type]
		var _this = this
		var isRelation = (fieldType.category === 'Relations' )


		return <div className="wizard-inner" key = "step2">
			
				<div className="attr-style menu-item menu-sub-item">
					<span className="attr-style ">
						Attribute type:
					</span>
					<span style={{}} className="attr-style selectable-attr-style"
					onClick={e => _this.setState({step: 1})}>
						<span className={"icon icon-" + fieldType.icon} style={{marginLeft: "5px"}}/>
						<span>{fieldType.description}</span>
					</span>
				</div>

				{isRelation ?
				this.renderRelatedModelPicker()
				: 
				<div className="attr-style menu-item menu-sub-item">
					<span className="attr-style ">
						Attribute name:
					</span>
					<span style={{ position: "relative"}}>
						<input style={{}} 
						autoFocus
						className = "flush renamer" value={this.state.name}
						onChange = {this.handleNameChange}/>
					</span>
				</div>
				}
				
				{!isRelation?
					this.renderDefaultField()
					: null
				}
				
				{
					this.state.nameError  ? 
					<div className="menu-item menu-sub-item"><span style = {{color: "lightcoral"}}>
					<span className="icon icon-warning"/>
					{this.state.nameError}
					</span></div>
					: null
				}

			{!isRelation? this.renderConfirmButtons() : null}
		</div>
	},

	render: function () {
		var step = this.state.step

		return <div className="wizard-overlay">
			
			<div className="wizard-title" key="title">
				<span>{stepDescriptions[this.state.step]}</span>
				<span style = {{float: "right"}}>(Step {this.state.step})</span>
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
				: this.state.step === 3 ?
				this.renderCardinalityForm()
				: <span key="done">done!</span>			
				}
			</ReactCSSTransitionGroup>
		</div>
	
	},
})

export default ColumnAdder