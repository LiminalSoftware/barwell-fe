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

	mixins: [blurOnClickMixin, popdownClickmodMixin],

	getInitialState: function () {
		return {}
	},

	getIcon: function () {
		return "icon icon-plus-square"
	},

	createNewView: function (type) {
		console.log('create new view: ' + type)
		const model = this.props.model
		var iterator = 1
		const nameRoot = model.model + ' ' + type
		var name = nameRoot

		while (ViewStore.query({model_id: model.model_id, view: name}).length > 0) {
			name = nameRoot + ' ' + iterator++
		}

		modelActionCreators.createView({
			view: name,
			type: type,
			model_id: model.model_id
		}, true)

		this.handleBlur()
	},

	renderMenu: function () {
		const model = this.props.model
		const _this = this

		return <div className = "popdown-section">
			<div className="popdown-item header bottom-divider title">
				Choose type for new view:
			</div>
			{_.map(viewTypes, (type, typeKey) =>
        	<div className = "selectable popdown-item" key = {typeKey}
        		onClick = {_this.createNewView.bind(_this, typeKey)}>
            	<span className = {"icon " + type.icon}/>
            	{type.type}
            </div>
	        )}
		</div>
	}
})

export default ViewAddContext
