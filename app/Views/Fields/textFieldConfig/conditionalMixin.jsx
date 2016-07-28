import React from "react"
import AttributeStore from "../../../stores/AttributeStore"

var conditionalMixin = {

	toggleConditional: function (e) {
		const conditional = !this.state.conditional
		this.setState({conditional: conditional})
		if (!conditional) this.chooseCondition(null)
		this.blurChildren(e)
	},

	chooseCondition: function (e) {
		this.commitChanges({
			[this.conditionProperty]: e.target.value,
		})
	},

	renderConditionDropdown: function () {
	    const view = this.props.view
	    
	    return <select value={this.state[this.conditionProperty]} onChange={this.chooseCondition}>
	    	{
	    	boolAttrs = AttributeStore
			.query({type: 'BOOLEAN', model_id: view.model_id})
			.map(a => <option value={a.attribute_id}>{a.attribute}</option>)
	    	}
	    </select>
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
