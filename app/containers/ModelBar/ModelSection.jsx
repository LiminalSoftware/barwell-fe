// LIBS AND SUCH
import React from "react"
import {pure} from "recompose"
import { Link } from "react-router"
import _ from "underscore"

// STORES
import ViewStore from "../../stores/ViewStore"

// CONSTANTS
import viewTypes from '../../Views/viewTypes'

// COMPONENTS
import ViewLink from "./ViewLink"
import ModelContext from "./ModelContext"
import ViewAddContext from "./ViewAddContext"
import Dropdown from "../../components/Dropdown"
import Renameable from "../../components/Renameable"

// MIXINS
import blurOnClickMixin from "../../blurOnClickMixin"

// UTILS
import util from "../../util/util"

// ACTIONS
import modelActionCreators from "../../actions/modelActionCreators"

var ModelSection = React.createClass ({

	componentWillMount: function () {
		this._debounceSetMouseOver = _.debounce(this.setMouseOver, 150)
	},

	componentWillReceiveProps: function (nextProps) {
		if (!this.renaming) this.setState({name: nextProps.model.model})
	},

	getInitialState: function () {
		return {
			editing: false,
			expanding: false,
			expanded: false,
			name: this.props.model.model
		}
	},

	componentDidUpdate: function (oldProps, oldState) {
		if (oldState.expanded !== this.state.expanded)
			this.props._calibrate()
	},

	revert: function () {
		document.removeEventListener('keyup', this.handleKeyPress)
		this.setState({editing: false})
	},

	// HANDLERS ===============================================================

	handleRename: function () {
		var model = this.props.model;
		if (this.state.renaming) return
		this.setState({
			editing: true,
			name: model.model
		})
	},

	handleClickExpand: function (e) {
		const _this = this
		if (this.state.expanded) return;
		this.setState({
			expanded: true,
			expanding: true
		})
		clearTimeout(this._overflowTimer)
		this._overflowTimer = setTimeout(f=>_this.setState({expanding: false}),200)
	},

	handleToggleExpand: function (e) {
		const _this = this
		this.setState({
			expanded: !this.state.expanded,
			expanding: true
		})
		clearTimeout(this._overflowTimer)
		this._overflowTimer = setTimeout(f=>_this.setState({expanding: false}),200)
		e.stopPropagation()
	},

	handleCommit: function (e) {
		modelActionCreators.updateModel({
			model_id: this.props.model.model_id,
			model: this.state.name
		})
		this.setState({editing: false})
	},

	handleFocus: function () {
		this.setState({focused: true})
	},

	handleBlur: function () {
		this.setState({focused: false})
	},

	setMouseOver: function (toggle) {
		this.setState({mouseover: toggle})
	},

	handleMouseOver: function () {
		this._debounceSetMouseOver(true)
	},

	handleMouseOut: function () {
		this._debounceSetMouseOver(false)
	},

	handleShowContext: function () {
		this.setState({context: true})
	},

	handleNameUpdate: function (e) {
		var name = e.target.value
		this.setState({name: name})
	},

	// RENDER =================================================================

	renderModelName: function () {
		return this.state.editing ?
			<input
				className="renamer header-renamer"
				autoFocus
				ref="renamer"
				value={this.state.name}
				onChange={this.handleNameUpdate}
				onMouseDown={util.clickTrap}
				onBlur={this.commitChanges} />
			:
			<span onDoubleClick = {this.handleRename} className="ellipsis">
				{this.state.name}
			</span>
	},

	render: function () {
		const _this = this
		const {history, model: {model: name, views: views, collapsed}} = this.props
		const {focused} = this.state

		return <div className="mdlbar-section"
			onFocus = {this.handleFocus}
			onBlur = {this.handleBlur}
			onMouseOver = {this.handleMouseOver}
			onMouseOut = {this.handleMouseOut}
			tabIndex={this.props.idx * 100}>

			<div className="model-link" onClick={this.handleClickExpand}>
				<span onClick={this.handleToggleExpand}
					className={"section-expander " + (collapsed ? "" : "section-expander--open")}/>
				<span className="link-label ellipsis">
					{this.renderModelName}
					<Renameable value={name} commit={f=>null}/>
				</span>

				<span className="spacer"/>
				{this.state.focused || this.state.mouseover ? <span>
					<Dropdown {...this.props}
						title="configure this model"
						onClick = {this.enterConfigMode}
						icon="icon-cog"/>
					<ViewAddContext {...this.props} idx={this.props.idx * 100}/>
					<ModelContext {...this.props}
						_parent = {this} direction = "left"/>
				</span> : null}
			</div>
			<div style={{
					maxHeight: views.length * 40,
					overflow: this.state.expanding ? "hidden" : "visible"
				}}
				className="model-view-list">

			{views.map(v => <ViewLink
				key={v.view_id}
				view={v}
				history={history}/>)}
			</div>
		</div>
	}
})

export default pure(ModelSection)
