import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import _ from "underscore"

import modelActionCreators from '../../actions/modelActionCreators';

import MetasheetDispatcher from '../../dispatcher/MetasheetDispatcher';

import ModelStore from "../../stores/ModelStore"
import ViewStore from "../../stores/ViewStore"
import MetasheetConst from '../../constants/MetasheetConstants'

var SideBar = React.createClass({

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
	
	getInitialState: function () {
		return {keyControl: false}
	},

	handleAddModel: function () {
		modelActionCreators.createModel({
			model: 'New model',
			plural: 'New models'
		})
	},

	render: function () {
		var _this = this;
		var curModelId = this.props.params.modelId
		var modelLinks = ModelStore.getAll().map(function (model, idx) {
			if (!model) return <li key={"loader-" + idx}><a>Loading</a></li>
			var modelId = model.model_id
			return <ModelLink 
				key={'model-link-' + modelId} 
				keyCtl={idx + 1} 	
				model={model} 
				active={curModelId == modelId}/>;
		});
		return <div className="left-side-bar">
			<ul>
				{modelLinks}
				<li className = "li-model ">
					<a className="clickable addNew" onClick={this.handleAddModel}>
						<span className="small addNew icon icon-plus"></span>
						Create new model
					</a>
				</li>
			</ul>
		</div>
	}

})
export default SideBar

var ModelLink = React.createClass ({

	componentDidMount: function () {
		
	},
	
	componentWillUnmount: function () {
		ModelStore.removeChangeListener(this._onChange)
		ViewStore.removeChangeListener(this._onChange)
	},

	componentWillMount: function () {
		ModelStore.addChangeListener(this._onChange)
		ViewStore.addChangeListener(this._onChange)
	},

	_onChange: function (changeEvent) {
		this.forceUpdate()
	},
	
	render: function() {
		var _this = this
		var model = this.props.model
		var views

		if (this.props.active) {
			views = ViewStore.getModelViews(model.model_id).map(function (view) {
				if (!view) return;
				
				if (view.model_id !== model.model_id) return;
				return <ViewLink 
					key={'view-link-' + view.view_id} 
					view={view} 
					model={model}/>	
			})
			views.push(<ViewAdder key={"model-view-adder-" + model.model_id} model={model} />)
		} else views = ""
		
		return <li>
			<ul key={"model-views-ul-" + model.model_id}>
				<li className={"li-model" + (this.props.active ? " li-hilite" : "")}>
					<Link to="model" params={{modelId: model.model_id}} key={"model-link-" + model.model_id}>
						{model.model}
					</Link>
				</li>
				{views}
			</ul>
		</li>
	}
})

var ViewLink = React.createClass({
	
	getInitialState: function () {
		var view = this.props.view
		var viewName = view.view
		return {
			renaming: false,
			name: viewName
		}
	},
	
	handleNameUpdate: function (e) {
		var name = e.target.value
		this.setState({name: name})
	},
	
	render: function () {
		var view = this.props.view;
		var model = this.props.model;
		var key = "view-link-" + view.view_id
		var viewDisplay = (!!this.state.renaming) ?  
			(<input className="view-renamer" ref="renamer" value={this.state.name} onChange={this.handleNameUpdate} onBlur={this.commitChanges}/>) : 
			(<span>{this.state.name}</span>) ;
		return <li className="li-view" key={"view-li-" + view.view_id}>
			<Link to="view" params={{modelId: model.model_id, viewId: view.view_id}} key={key} onDoubleClick={this.edit} >
				<span className={"icon "+view.data.icon}></span>{viewDisplay}
			</Link></li>;
	},
	
	commitChanges: function () {
		var view = this.props.view;
		var model = this.props.model;
		view.view = this.state.name

		MetasheetDispatcher.dispatch({
	    	actionType: 'VIEW_CREATE',
	    	view: {
	    		model_id: model.model_id,
	    		view_id: view.view_id,
	    		view: this.state.name
	    	}
	    });
		this.revert()
	},
	
	cancelChanges: function () {
		var view = this.props.view
		this.setState({name: view.view})
		this.revert()
	},
	
	edit: function () {
		var view = this.props.view;
		if (this.state.renaming) return
		this.setState({renaming: true}, function () {
			React.findDOMNode(this.refs.renamer).focus();
		})
		document.addEventListener('keyup', this.handleKeyPress)
	},
	
	revert: function () {
		document.removeEventListener('keyup', this.handleKeyPress)
		this.setState({renaming: false})
	},

	handleKeyPress: function (event) {
		if (event.keyCode === 27) this.cancelChanges()
		if (event.keyCode === 13) this.commitChanges()
	}
})


var ViewAdder = React.createClass ({

	handleAddView: function() {
		var model = this.props.model
		MetasheetDispatcher.dispatch({
	      	actionType: 'VIEW_CREATE',
	    	view: {
	    		view: "New view",
	    		model_id: model.model_id,
	    		type: "Tabular"
	    	}
	    });
	},

	render: function () {
		var _this = this
		var model = this.props.model
		
		return <li className="li-view li-hilite" key={"model-add-li-" + model.model_id}>
			<a className="addNew clickable" onClick={this.handleAddView}>
				<span className="small addNew icon icon-plus"></span> Create new view
			</a>
		</li>
	}

})

