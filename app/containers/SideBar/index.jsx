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

		var modelLinks = ModelStore.query(null, ['model']).map(function (model, idx) {
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

	getInitialState: function () {
		return {renaming: false}
	},

	_onChange: function (changeEvent) {
		this.forceUpdate()
	},

	commitChanges: function () {
		var model = this.props.model;
		model.model = this.state.name
		modelActionCreators.createModel(model)
		this.revert()
	},
	
	cancelChanges: function () {
		this.revert()
	},
	
	edit: function () {
		var model = this.props.model;
		if (this.state.renaming) return
		this.setState({
			renaming: true,
			name: model.model
		}, function () {
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
	},

	handleNameUpdate: function (event) {
		var name = event.target.value
		this.setState({name: name})
	},
	
	render: function() {
		var _this = this
		var model = this.props.model
		var views
		var lock_icon

		var modelDisplay = (!!this.state.renaming) ?  
			(<input className="model-renamer" ref="renamer" value={this.state.name} onChange={this.handleNameUpdate} onBlur={this.commitChanges}/>) : 
			(<span>{model.model}</span>) ;

		if (this.props.active) {
			views = ViewStore.query({model_id: model.model_id}, ['view']).map(function (view) {
				if (!view) return;
				
				return <ViewLink 
					key={'view-link-' + view.view_id} 
					view={view} 
					model={model}/>	
			})
			views.push(<ViewAdder key={"model-view-adder-" + model.model_id} model={model} />)
		} else views = ""

		if (model.lock_user) 
			lock_icon = <span className="icon grayed icon-lock-close" 
							title={'locked by ' + model.lock_user}></span>
						
		
		return <li>
			<ul key={"model-views-ul-" + model.model_id}>
				<li className={"li-model" + (this.props.active ? " li-hilite" : "")}>
					<Link to="model" params={{modelId: model.model_id}} key={"model-link-" + model.model_id} onDoubleClick={this.edit}>
					{lock_icon}
					{modelDisplay}
					</Link>
				</li>
				{views}
			</ul>
		</li>
	}
})

var ViewLink = React.createClass({

	componentDidMount: function () {
		var _this = this
		var view = this.props.view;
		setTimeout(function () {
			view._new = false;
			modelActionCreators.create('view', false, view)
		}, 0)
	},
	
	getInitialState: function () {
		return {
			renaming: false,
			isnew: true
		}
	},
	
	handleNameUpdate: function (e) {
		var name = e.target.value
		this.setState({name: name})
	},

	handleDelete:function (e) {
		var view = this.props.view;
		modelActionCreators.destroyView(view)
		e.preventDefault();
	},
	
	render: function () {
		var view = this.props.view;
		var model = this.props.model;
		var key = "view-link-" + (view.view_id || view.cid)
		var viewDisplay = (!!this.state.renaming) ?  
			(<input className="view-renamer" ref="renamer" value={this.state.name} onChange={this.handleNameUpdate} onBlur={this.commitChanges}/>) : 
			(<span>{view.view}</span>) ;
		return <li className={"li-view " + (view._new ? "new" : "")} key={"view-li-" + view.view_id}>
			<Link to="view" params={{modelId: model.model_id, viewId: (view.view_id || view.cid)}} key={key} onDoubleClick={this.edit} >
				<span className={"icon "+view.data.icon}></span>{viewDisplay}
			</Link>
			<span className="view-delete grayed icon icon-kub-trash" onClick={this.handleDelete}></span>
			</li>;
	},
	
	commitChanges: function () {
		var view = this.props.view;
		var model = this.props.model;
		view.view = this.state.name

		modelActionCreators.createView(view)
		this.revert()
	},
	
	cancelChanges: function () {
		this.revert()
	},
	
	edit: function () {
		var view = this.props.view;
		if (this.state.renaming) return
		this.setState({renaming: true, name: view.view}, function () {
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

	handleAddView: function(event) {
		var model = this.props.model
		modelActionCreators.createView({
			model_id: model.model_id,
			view: (model.model + ' - New view'),
			type: 'Tabular',
			_new: true
		})
		event.preventDefault()
	},

	render: function () {
		var _this = this
		var model = this.props.model
		
		return <li className="li-view li-hilite" key={"model-add-li-" + model.model_id}>
			<a herf="#" className="addNew clickable" onClick={this.handleAddView}>
				<span className="small addNew icon icon-plus"></span> Create new view
			</a>
		</li>
	}

})

