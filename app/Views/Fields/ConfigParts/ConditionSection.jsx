import React from "react"
import AttributeStore from "../../../stores/AttributeStore"

export default class ConditionSection {

	toggleConditional (e) {
		const conditional = !this.state.conditional
		this.setState({conditional: conditional})
		if (!conditional) this.chooseCondition(null)
		this.blurChildren(e)
	}

	chooseCondition (e) {
		this.commitChanges({
			[this.conditionProperty]: e.target.value,
		})
	}

	renderConditionDropdown () {
	    const view = this.props.view
	    
	    return <select value={this.state[this.conditionProperty]} onChange={this.chooseCondition}>
	    	{
	    	boolAttrs = AttributeStore
			.query({type: 'BOOLEAN', model_id: view.model_id})
			.map(a => <option value={a.attribute_id}>{a.attribute}</option>)
	    	}
	    </select>
	},

	render () {
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
