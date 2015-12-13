import React from "react"
import { RouteHandler, Link } from "react-router"
import styles from "./style.less"
import detailStyles from "./detail.less"
import ModelDefinition from "../ModelDefinition"
import ModelStore from "../../stores/ModelStore"
import ViewStore from "../../stores/ViewStore"

import ViewSelector from '../ViewSelector'

import viewTypes from "../Views/viewTypes"
import modelActionCreators from "../../actions/modelActionCreators"
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var ModelPane = React.createClass({

	getInitialState: function () {
		return {
			selection: "model",
			viewListOpen: false,
			miniaturized: false
		}
	},

	selectModel: function () {
		this.setState({selection: "model"})
	},

	selectView: function () {
		this.setState({selection: "view"})
	},

	componentWillUnmount: function () {
		ModelStore.removeChangeListener(this._onChange)
		ViewStore.removeChangeListener(this._onChange)
	},

	componentWillMount: function () {
		ModelStore.addChangeListener(this._onChange)
		ViewStore.addChangeListener(this._onChange)
	},

	_onChange: function () {
		this.forceUpdate()
	},

	toggleSidebar: function () {
		this.props.toggleSidebar();
	},

	focus: function () {
   	modelActionCreators.setFocus('model-config')
   },

	 toggleViewList: function () {
		 var toggle = !(this.state.viewListOpen)
		 this.setState({viewListOpen: toggle})
	 },

	render: function() {
		console.log('model-views render')
		var _this = this
		var workspace_id = this.props.params.workspaceId
		var model_id = this.props.params.modelId
		var view_id = this.props.params.viewId
		var view = ViewStore.get(view_id)
		var model = ModelStore.get(model_id)

		var viewDetailContent
		var detailContent
		var bodyContent

		var activePane = this.state.activePane

		if (view && view.model_id != model_id) view = null
		if (!view) activePane = 'model-def'

		if (!!view && (view.type in viewTypes)) {
			var type = viewTypes[view.type]
			var bodyElement = type.mainElement
			var configElement = type.inlineConfigElement

			bodyContent = React.createElement(bodyElement, {
				model: model,
				view: view,
				key: "view-pane-" + (view.cid || view.view_id)
			})

			configElement = React.createElement(configElement, {
				model: model,
				view: view
			})
		}

		else {
			bodyContent = <div className=" view-body-wrapper" key="no-view">
				<ModelDefinition model={model}/>
			</div>
			configElement = <div className = "view-config">
				<ViewSelector view = {view} model = {model}/>
			</div>;
			viewDetailContent = null
		}

		return <div className="model-views">
			<div className="view-bar" >
				{configElement}
			</div>
			<div className = "model-panes">
				{bodyContent}
			</div>
		</div>
	}
});

export default ModelPane
