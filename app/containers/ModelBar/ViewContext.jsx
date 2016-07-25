import React from "react"
import util from '../../util/util'

// MIXINS
import blurOnClickMixin from "../../blurOnClickMixin"
import popdownClickmodMixin from '../Views/Fields/popdownClickmodMixin'

var ViewContext = React.createClass ({

	mixins: [blurOnClickMixin, popdownClickmodMixin],

	getInitialState: function () {
		return {
			deleting: false
		}
	},
	
	handleClickDelete: function () {
		this.props._parent.handleDelete()
		this.handleBlur()
	},

	handleRename: function () {
		this.props._parent.handleRename()
		this.handleBlur()
	},

	getIcon: function () {
		return "icon icon-ellipsis"
	},

	renderMenu: function() {
		const model = this.props.model

		return <div className = "popdown-section">
			<div className="popdown-item header bottom-divider title">
				Model actions:
			</div>

			<div div className = "selectable popdown-item" onClick = {this.handleRename}>
				<span className="icon icon-pencil"/>
				Rename view
			</div>
			
			
			<div div className = "selectable popdown-item" onClick = {this.handleClickDelete}>
				<span className="icon icon-trash2"/>	
				Delete view
			</div>
			
		</div>
	}
})

export default ViewContext
