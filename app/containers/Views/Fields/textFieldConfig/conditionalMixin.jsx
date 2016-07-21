import React from "react"
import AttributeStore from "../../../../stores/AttributeStore"
import Dropdown from '../../../Dropdown'

var conditionalMixin = {

	toggleConditional: function (e) {
		const conditional = !this.state.conditional
		this.setState({conditional: conditional})
		if (!conditional) this.chooseCondition(null)
		this.blurChildren(e)
	},

	chooseCondition: function (attributeId, e) {
		this.commitChanges({
			[this.conditionProperty]: attributeId,
		})
	},

	renderConditionDropdown: function () {
	    const view = this.props.view
	    const boolAttrs = AttributeStore
	      .query({type: 'BOOLEAN', model_id: view.model_id})
	      .map(function(a){
	        return {
	          "key": a.attribute_id, 
	          "label": a.attribute, 
	          "icon": 'icon-check-square'
	        }})
	    
	    return <Dropdown choices = {boolAttrs} 
	      _choose = {this.chooseCondition}
	      ref = "conditionDropdown"
	      selection = {this.state[this.conditionProperty]}/>
	},

	renderConditionSection: function () {
		const _this = this
		const view = this.props.view
		const boolAttrs = AttributeStore
		.query({type: 'BOOLEAN', model_id: view.model_id})

		return <div className="popdown-section" key="condition">
			{
			boolAttrs.length > 0 ?
			<div className="popdown-item title top-divider" >
				<span onClick = {_this.toggleConditional}>
					<input type="checkbox" checked = {_this.state.conditional} />
					Conditional
				</span>
			</div>
			:
			null
			}

			{
			this.state.conditional ? 
			this.renderConditionDropdown()
			:
			null
			}
		</div>
	},
	
	
}

export default conditionalMixin
