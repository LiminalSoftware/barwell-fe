import React from "react"
import util from '../../util/util'

// MIXINS
import blurOnClickMixin from "../../blurOnClickMixin"
import popdownClickmodMixin from '../Views/Fields/popdownClickmodMixin'

var ModelContext = React.createClass ({

	mixins: [blurOnClickMixin, popdownClickmodMixin],

	getInitialState: function () {
		return {
			deleting: false
		}
	},
	
	handleClickDelete: function () {
		this.setState({deleting: true})
	},

	handleCancelDelete: function () {
		this.setState({deleting: false})
	},

	handleRename: function () {
		this.props._parent.handleRename()
	},

	getIcon: function () {
		return "icon icon-ellipsis"
	},

	renderMenu: function() {
		const model = this.props.model

		return <div className = "pop-down-section">
			<div className="popdown-item header bottom-divider title">
				Model actions:
			</div>

			<div div className = "selectable popdown-item" onClick = {this.handleRename}>
				<span className="icon icon-pencil"/>
				Rename model
			</div>
			
			{this.state.deleting ?
			<div className = "selectable popdown-item">
				Delete this model?
			</div>
			:
			<div div className = "selectable popdown-item" onClick = {this.handleClickDelete}>
				<span className="icon icon-trash2"/>	
				Delete model
			</div>
			}
			{this.state.deleting ?
				<div div className = "selectable popdown-item" onClick={this.props._delete}>Delete</div>
				: null
			}
			{this.state.deleting ?
				<div div className = "selectable popdown-item" onClick={this.handleCancelDelete}>cancel</div>
				: null
			}
		</div>
	}
})

export default ModelContext
