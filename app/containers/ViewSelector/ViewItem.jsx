import React from "react"
import ViewStore from "../../stores/ViewStore"
import styles from "./style.less"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"

import ViewTypeMenu from './ViewTypeMenu'
import util from "../../util/util"


var ViewItem = React.createClass({

	getInitialState: function () {
			var view = this.props.view || {}
			return {
				name: view.view,
				editing: false
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

	render: function () {
		var view = this.props.view
		var model = this.props.model



		if (view) return <Link
				to = {`/workspace/${model.workspace_id}/model/${view.model_id}/view/${view.view_id}`}
				className = "menu-item menu-sub-item">

					{this.props.editing ?
							<span className = "draggable icon grayed icon-Layer_2"/>
						: this.props.selected ?
							<span className = "small green icon icon-geo-circle"/>
						: <span className = "small hovershow icon icon-geo-circle"/>}

				<ViewTypeMenu type = {view.type} editing = {this.state.editing}/>
				<span className = "double">
					{this.state.editing ?
						<input className = "menu-input text-input"
								value = {this.state.name}
								onClick = {util.clickTrap}
								onChange = {this.handleNameChange}/>
						: view.view}

				</span>
				{this.props.editing ?
						<span>
							<span className = "icon icon-pencil-2"
								onClick = {this.handleClickEdit}>
							</span>
							<span className = "icon icon-cr-delete"></span>
						</span>
						: null}
			</Link>
		else return <div className = "menu-item menu-sub-item ">
			No view selected
		</div>
	}
})

export default ViewItem
