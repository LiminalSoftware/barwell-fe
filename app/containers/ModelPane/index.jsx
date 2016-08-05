import React from "react"
import { RouteHandler, Link } from "react-router"
import ReactDOM from "react-dom"

import styles from "./style.less"
import detailStyles from "./detail.less"
import ModelDefinition from "../ModelDefinition"
import ModelStore from "../../stores/ModelStore"
import ViewStore from "../../stores/ViewStore"
import FocusStore from "../../stores/FocusStore"

import ViewConfigStore from "../../stores/ViewConfigStore"
import ModelConfigStore from '../../stores/ModelConfigStore'
import groomView from '../../Views/groomView'

import ChangeHistory from '../../Views/ChangeHistory'

import viewTypes from "../../Views/viewTypes"
import modelActionCreators from "../../actions/modelActionCreators"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import constants from "../../constants/MetasheetConstants"

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

	componentWillMount: function () {
		ModelStore.addChangeListener(this._onChange)
		ViewStore.addChangeListener(this._onChange)
		FocusStore.addChangeListener(this._onChange)
	},

	componentWillUnmount: function () {
		ModelStore.removeChangeListener(this._onChange)
		ViewStore.removeChangeListener(this._onChange)
		FocusStore.removeChangeListener(this._onChange)
	},

	_onChange: function () {
		this.forceUpdate()
	},

	toggleSidebar: function () {
		this.props.toggleSidebar();
	},

	focus: function () {
		modelActionCreators.setFocus('model-' + this.props.model.model_id)
	},

	render: function() {
		const _this = this
		const view = this.props.view
		const model = ModelStore.get(view.model_id);
		const viewconfig = {}

		const content = React.createElement(viewTypes[view.type].mainElement, {
				model: model,
				view: view,
				focused: ('v' + view.view_id === FocusStore.getFocus()),
				viewconfig: viewconfig,
				key: "view-pane-" + (view.cid || view.view_id)
			})

		const config = React.createElement(viewTypes[view.type].configElement, {
				model: model,
				view: view,
				viewconfig: viewconfig,
				key: "view-config-" + (view.cid || view.view_id)
			})

		return <div className="model-views">

			<ReactCSSTransitionGroup
				ref="pane"
				key="model-panes"
				className="model-pane"
				{...constants.transitions.fadeinout}>

				{content}

				{config}

			</ReactCSSTransitionGroup>

		</div>
	}
});

export default ModelPane