import React from "react";
import { Link } from "react-router"
import viewTypes from "../Views/viewTypes"
import modelActionCreators from "../../actions/modelActionCreators.jsx"

var ViewItemSingleton =  React.createClass({

	// HANDLERS ===============================================================

	handleClick: function (e) {
		var model = this.props.model;
		var view = this.props.view;
		modelActionCreators.create('modelconfig', false, {
			model_id: model.model_id,
			selected_view_id: view.view_id
		});
		if (this.props._blurMenu) {
			console.log('blurrrr')
			this.props._blurMenu();
		}
	},

	// RENDER =================================================================

	render: function () {
		var view = this.props.view
		var model = this.props.model

		if (view)
			return <Link
				onClick = {this.handleClick}
				to = {`/workspace/${model.workspace_id}/model/${view.model_id}/view/${view.cid || view.view_id}`}
				className = {"menu-item menu-sub-item " + (this.props.suppressHilite ? '' : 'menu-clickable ') + (this.props.selected ? " menu-selected " : "")}>
				
				<span className = {"icon " + viewTypes[view.type].icon}/>
				<span className = "double ellipsis">
					{view.view}
				</span>
				{
				!this.props.suppressHilite && this.props.isDefault ?
				<span className = {"icon icon-star " + (this.props.isDefault ? "green" : " grayed ")}/>
				: null
				}
			</Link>
		else return <div className = "singleton menu-item menu-sub-item no-left-padding">
			<span className = "large icon icon-pencil-ruler"></span>
			<span className = "double-column-config">Database Configuration</span>
		</div>
	}

})

export default ViewItemSingleton
