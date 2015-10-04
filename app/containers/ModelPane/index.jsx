import React from "react"
import { RouteHandler } from "react-router"
import viewTypes from "containers/Views/viewTypes"
import ViewSelector from "./ViewSelector"
import styles from "./style.less"
import detailStyles from "./detailTable.less"
import ModelDefinition from "./ModelDefinition"
import ModelStore from "../../stores/ModelStore"
import ViewStore from "../../stores/ViewStore"
import sortable from 'react-sortable-mixin'

import modelActionCreators from "../../actions/modelActionCreators"
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var ModelPane = React.createClass({

	getInitialState: function () {
		return {
			activePane: "model-def",
			miniaturized: false
		}
	},

	showModelDef: function () {
		this.setState({activePane: "model-def"})
	},

	showViewConfig: function () {
		this.setState({activePane: "view-config"})
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

	render: function() {
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
			var configElement = type.configElement

			bodyContent = React.createElement(bodyElement, {
				model: model,
				view: view,
				key: "view-pane-" + (view.cid || view.view_id)
			})

			viewDetailContent = React.createElement(configElement, {
				model: model,
				view: view,
				key: "view-config-" + view_id
			})
		}

		else {
			bodyContent = <div className="no-view-content view-body-wrapper" key="no-view">
				<span className="icon icon-face-nomimic"></span>No view selected
			</div>

			viewDetailContent = <div>Placeholder</div>
		}

		if (activePane === "model-def") {
			detailContent = <ModelDefinition model={model} />
		} else if (activePane === "view-config") {
			detailContent = <div className="view-details">
				<ViewSelector
					view={view}
					key={"view-selector-" + view_id}/>
				{viewDetailContent}
			</div>
		}

		return <div className="model-views">
			<div className = "model-panes">
				<div className="detail-bar" onClick={this.focus}>
					<div className="detail-hider" onClick={this.toggleSidebar}>
						<span className="clickable grayed right-align icon icon-cl-chevron-left" title="Hide sidebar">
					</span></div>
					<div className="right-header header-container">
						<h1>{model ? model.model : null}</h1>
						{view ? <h1> /  {view.view}</h1> : null}

						<ul className="dark mb-buttons"><li>Create view</li></ul>
						<ul className="dark mb-buttons"><li><span className="small icon icon-chevron-down"></span></li></ul>
					</div>
					<ul className="rh-sidebar-accordian">
						<li>
							<span className="accordian-icon">
								<span className="large icon icon-db-database-02"></span>
							</span>
							<span className="accordian-label">
								<h3>Database Design</h3>
								<p>Use this section to define the attributes of this database and its relation to other databases</p>
							</span>
						</li>
						<li>
							<span className="accordian-icon">
								<span className="large icon icon-glasses"></span>
							</span>
							<span className="accordian-label">
								<h3>View Configuration</h3>
								<p>Use this section to control how you want to view and interact with the data in this database</p>
							</span>
						</li>
					</ul>

				</div>


				<div className = "model-panes">
				<div className="view-body-wrapper">
				<div className="right-header header-container">
					<h3 className="current-user-label">Signed in as</h3>
				</div>
				{bodyContent}
				</div>
				</div>

			</div>
		</div>
	}
});

export default ModelPane
