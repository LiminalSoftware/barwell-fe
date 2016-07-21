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

import ChangeHistory from '../Views/ChangeHistory'

import viewTypes from "../Views/viewTypes"
import modelActionCreators from "../../actions/modelActionCreators"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import PureRenderMixin from 'react-addons-pure-render-mixin';

var ModelPane = React.createClass({

	mixins: [PureRenderMixin],

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
		var _this = this
		var workspace_id = this.props.params.workspaceId
		var model_id = this.props.params.modelId
		var model = ModelStore.get(model_id);
		var modelConfig = ModelConfigStore.get(model_id) || {};
		var view_id = this.props.params.viewId || modelConfig.selected_view_id;
		var view = view_id === 'config' ? null : ViewStore.get(view_id)
		var viewconfig = {} // (view_id === 'config' ? null : ViewConfigStore.get(view_id)) || {}
		var bodyContent
		var bodyElement
		var configElement = <div className = "view-config">

		</div>;
		

		if (view && view.model_id != model_id) view = null;
		if (view) {
			var type = viewTypes[view.type]
			bodyElement = type.mainElement
			configElement = type.inlineConfigElement

			view = groomView(view)

			bodyContent = React.createElement(bodyElement, {
				model: model,
				view: view,
				viewconfig: viewconfig,
				_showPopUp: this.props._showPopUp,
				_clearPopUp: this.props._clearPopUp,
				key: "view-pane-" + (view.cid || view.view_id)
			})

			configElement = React.createElement(configElement, {
				model: model,
				view: view,
				viewconfig: viewconfig,
				_showPopUp: this.props._showPopUp,
				_clearPopUp: this.props._clearPopUp
			})
		} else if (view_id === 'history') {
			bodyContent = <ChangeHistory model = {model}/>
		} else if (view_id === 'config') {
			bodyContent = <ModelDefinition model={model}/>
		} else {
			bodyContent = null
		}

		return <div className="model-views">
			<div className="view-bar">
				{configElement}
			</div>
			{bodyContent}
		</div>
	}
});

export default ModelPane
