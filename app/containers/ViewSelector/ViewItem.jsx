import React from "react"
import ViewStore from "../../stores/ViewStore"
import styles from "./style.less"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"

import ViewTypeMenu from './ViewTypeMenu'
import util from "../../util/util"
import modelActionCreators from "../../actions/modelActionCreators.jsx"

var ViewItem = React.createClass({

	getInitialState: function () {
			var view = this.props.view || {}
			return {
				name: view.view,
				editing: false,
				deleting: false
			}
	},

	handleNameChange: function (e) {
		this.setState({name: e.target.value})
	},

	handleClickEdit: function (e) {
		this.setState({editing: true})
		util.clickTrap(e)
	},

	handleClickDelete: function (e) {
		this.setState({deleting: true})
		util.clickTrap(e)
	},

	handleClickRestore: function (e) {
		this.setState({deleting: false})
		util.clickTrap(e)
	},

	componentWillReceiveProps: function (nextProps) {
		var props = this.props
		if (props.editing && !nextProps.editing) this.saveChanges()
	},

	saveChanges: function () {
		var view = this.props.view
		view.type = this.refs.viewTypeMenu.state.type
		view.view = this.state.name
		if (this.state.deleting)
			modelActionCreators.destroyView(view);
		else modelActionCreators.createView(view, true, true);
	},

	render: function () {
		var view = this.props.view
		var model = this.props.model

		if (view && this.props.editing)
			return <div className = "menu-item menu-sub-item no-left-padding">
				<span className = "draggable icon grayed icon-Layer_2"/>
				<ViewTypeMenu ref = "viewTypeMenu" type = {view.type} editing = {this.state.editing} deleting = {this.state.deleting}/>
				<span className = "double ellipsis">
					{this.state.editing ?
						<input className = "menu-input text-input"
								value = {this.state.name}
								onClick = {util.clickTrap}
								onChange = {this.handleNameChange}/>
						: view.view}
				</span>
				{this.props.editing && !this.state.deleting && !this.state.editing?
						<span className = "icon icon-pencil-2"
							onClick = {this.handleClickEdit}/> : null}
				{this.props.editing && this.state.deleting ?
						<span className = "icon icon-tl-undo"
							onClick = {this.handleClickRestore}/> :
						<span className = "icon icon-cr-delete"
							onClick = {this.handleClickDelete}/>}
			</div>
		else if (view)
			return <Link
				to = {`/workspace/${model.workspace_id}/model/${view.model_id}/view/${view.view_id}`}
				className = {"menu-item menu-sub-item no-left-padding " 
				+ (this.props.singleton ? " singleton" : "")}>
				{
				this.props.singleton ? 
					null :
					<span className = {"small icon icon-geo-circle " +
					(this.props.selected ? 'green' : 'hovershow')}/>
				}
				<ViewTypeMenu type = {view.type} editing = {false}/>
				<span className = "double ellipsis">
					{view.view}
				</span>
			</Link>
		else return <div className = "singleton menu-item menu-sub-item no-left-padding">
			<span className = "large icon icon-tl-toolbox"></span>
			<span className = "double-column-config">Database Configuration</span>
		</div>
	}
})

export default ViewItem
