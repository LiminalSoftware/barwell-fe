// LIBS AND SUCH
import React from "react"
import { Link } from "react-router"

// STORES
import ViewStore from "../../stores/ViewStore"

// CONSTANTS
import viewTypes from '../Views/viewTypes'

// COMPONENTS
import ViewLink from "./ViewLink"
import ModelContext from "./ModelContext"
import ViewAddContext from "./ViewAddContext"

// MIXINS
import blurOnClickMixin from "../../blurOnClickMixin"

// UTILS
import util from "../../util/util"

var ModelSection = React.createClass ({

	mixins: [blurOnClickMixin],

	getInitialState: function () {
		return {
			renaming: false,
			context: false
		}
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

	handleCommit: function () {
		modelActionCreators.updateModel({
			model_id: this.props.model.model_id, 
			model: this.state.name
		})
		this.revert()
	},

	handleShowContext: function () {
		this.setState({context: true})
	},

	handleNameUpdate: function (e) {
		var name = e.target.value
		this.setState({name: name})
	},

	handleDelete: function (e) {
		modelActionCreators.destroy('model', true, this.props.model)
	},

	// RENDER =================================================================

	render: function () {
		const _this = this
		const model = this.props.model
		const modelId = model.model_id || model.cid
		const workspaceId = model.workspace_id
		const views = ViewStore.query({model_id: modelId})

		const modelDisplay = this.state.editing ?
			<input 
				className="renamer header-renamer" 
				ref="renamer" 
				value={this.state.name} 
				onChange={this.handleNameUpdate}
				onMouseDown = {util.clickTrap}
				onBlur={this.commitChanges} /> 
			:
			<span onDoubleClick = {this.handleRename}>{model.model}</span>

		return <div className="mdlbar-section ">

			<div className="mdlbar-link">
				{modelDisplay}
				<span style = {{float: 'right'}}>
					
					<ModelContext {...this.props} 
						_parent = {this} direction = "left"/>

					<ViewAddContext {...this.props}
						_parent = {this} direction = "left"/>
					
				</span>
			</div>

			{views.map(v => 
			<ViewLink {..._this.props} key={v.view_id} view={v}/>
			)}
		</div>
	}
})

export default ModelSection