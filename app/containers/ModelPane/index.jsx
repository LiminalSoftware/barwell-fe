import React from "react"
import { RouteHandler, Link } from "react-router"
import styles from "./style.less"
import detailStyles from "./detail.less"
import ModelDefinition from "../ModelDefinition"
import ModelStore from "../../stores/ModelStore"
import ViewStore from "../../stores/ViewStore"
import ViewConfigStore from "../../stores/ViewConfigStore"
import ModelConfigStore from '../../stores/ModelConfigStore'
import groomView from '../../containers/Views/groomView'

import ViewSelector from '../ViewSelector'

import viewTypes from "../Views/viewTypes"
import modelActionCreators from "../../actions/modelActionCreators"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

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
		ViewConfigStore.removeChangeListener(this._onChange)
	},

	componentWillMount: function () {
		ModelStore.addChangeListener(this._onChange)
		ViewStore.addChangeListener(this._onChange)
		ViewConfigStore.addChangeListener(this._onChange)
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
		// console.log('render ModelPane')
		var _this = this
		var workspace_id = this.props.params.workspaceId
		var model_id = this.props.params.modelId
		var model = ModelStore.get(model_id);
		var modelConfig = ModelConfigStore.get(model_id) || {};
		var view_id = this.props.params.viewId || modelConfig.selected_view_id;
		var view = view_id === 'config' ? null : ViewStore.get(view_id)
		var viewconfig = {} // (view_id === 'config' ? null : ViewConfigStore.get(view_id)) || {}
		var bodyContent
		
		

		if (view && view.model_id != model_id) view = null;
		if (view) {
			var type = viewTypes[view.type]
			var bodyElement = type.mainElement
			var configElement = type.inlineConfigElement

			view = groomView(view)

			bodyContent = React.createElement(bodyElement, {
				model: model,
				view: view,
				viewconfig: viewconfig,
				key: "view-pane-" + (view.cid || view.view_id)
			})

			configElement = React.createElement(configElement, {
				model: model,
				view: view,
				viewconfig: viewconfig,
				focusDepth: 0
			})
		}
		else {
			bodyContent = <ModelDefinition model={model}/>
			configElement = <div className = "view-config">
				<ViewSelector view = {view} model = {model}/>
			</div>;
		}

		return <div className="model-views">
			<div className="view-bar" >
				{configElement}
			</div>
			{bodyContent}
		</div>
	}
});

export default ModelPane
