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
import fieldTypes from "../../Views/fields"

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
		const viewType = viewTypes[view.type]
		const model = ModelStore.get(view.model_id);
		const viewconfig = {}
		const viewStr = 'v' + view.view_id
		const isFocused = viewStr === this.props.focus.slice(0, viewStr.length)

		const content = React.createElement(viewType.mainElement, {
				model: model,
				view: view,
				focused: isFocused,
				viewconfig: viewconfig,
				key: "view-pane-" + (view.cid || view.view_id)
			})

		const config = React.createElement(viewType.configElement, {
				model: model,
				view: view,
				focus: this.props.focus,
				viewconfig: viewconfig,
				key: "view-config-" + (view.cid || view.view_id)
			})

		return <div className="model-views" >
			{this.props.multiViews ? 
			<div className="model-pane-label" onClick={this.focus} style={{position: "relative"}}>
				<span>
					<span className={`icon ${viewType.icon}`}/>
					{view.view}
				</span>
				<span style={{position: "absolute", right: "4px", top: "4px"}}
					className="icon icon-cross"/>
			</div> 
			: null
			}
			<ReactCSSTransitionGroup
				ref="pane"
				key="model-panes"
				className="model-pane"
				{...constants.transitions.fadeinout}>

				{content}

				{isFocused ? config : null}

			</ReactCSSTransitionGroup>

		</div>
	}
});

export default ModelPane