import React from "react"
import util from '../../util/util'
import _ from "underscore"

// MIXINS
import blurOnClickMixin from "../../blurOnClickMixin"
import popdownClickmodMixin from '../../Views/Fields/popdownClickmodMixin'

// CONSTANTS
import viewTypes from "../../Views/viewTypes"

// STORES
import ViewStore from "../../stores/ViewStore"

// ACTIONS
import modelActionCreators from "../../actions/modelActionCreators"

var ViewAddContext = React.createClass ({

	getInitialState: function () {
		return {}
	},

	getIcon: function () {
		return "icon icon-plus-square"
	},

	createNewView: function (type) {
		const model = this.props.model
		const nameRoot = model.model + ' ' + type
		let iterator = 1
		let name = nameRoot

		while (ViewStore.query({model_id: model.model_id, view: name}).length > 0)
			name = `${nameRoot} ${iterator++}`

		modelActionCreators.createView({
			view: name,
			type: type,
			model: model.cid || model.model_id
		}, true)

		this.handleBlur()
	},

	render: function () {
		const model = this.props.model
		const _this = this

		return <div className="view-link add-new-item">
			<span className="icon green icon-plus"/>
			<span>Add additional view</span>
			{
			this.state.open ? <div className = "popdown">
				{_.map(viewTypes, (type, typeKey) =>
	        	<div className = "selectable popdown-item" key = {typeKey}
	        		onClick = {_this.createNewView.bind(_this, typeKey)}>
	            	<span className = {"icon " + type.icon}/>
	            	{type.type}
	            </div>
		        )}
			</div> : null
			}
		</div>

	}
})

export default ViewAddContext
