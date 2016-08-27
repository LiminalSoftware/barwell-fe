import React from "react"
import util from '../../util/util'

// ACTIONS
import modelActionCreators from "../../actions/modelActionCreators"

// MIXINS
import blurOnClickMixin from "../../blurOnClickMixin"
import popdownClickmodMixin from '../../Views/Fields/popdownClickmodMixin'

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

	handleConfirmDelete: function (e) {
		modelActionCreators.destroy('model', true, this.props.model)
	},

	handleCancelDelete: function () {
		this.setState({deleting: false})
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
				Rename model
			</div>
			
			{this.state.deleting ?
			<div className = "selectable popdown-item">
				Delete this model?
			</div>
			:
			<div div className = "selectable popdown-item" 
				onClick = {this.handleClickDelete}>
				<span className="icon icon-trash2"/>	
				Delete model
			</div>
			}
			{this.state.deleting ?
				<div div className = "selectable popdown-item" 
					onClick={this.handleConfirmDelete}>Delete</div>
				: null
			}
			{this.state.deleting ?
				<div div className = "selectable popdown-item" 
					onClick={this.handleCancelDelete}>Nevermind</div>
				: null
			}
		</div>
	}
})

export default ModelContext
