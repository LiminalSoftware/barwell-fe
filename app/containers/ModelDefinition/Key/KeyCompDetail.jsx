import React from "react"
import { Link } from "react-router"
import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"
import modelActionCreators from '../../../actions/modelActionCreators'
import constants from '../../../constants/MetasheetConstants'
import getIconClasses from '../getIconClasses'
import _ from 'underscore'

import PureRenderMixin from 'react-addons-pure-render-mixin';

var KeycompDetail = React.createClass({

	handleDelete: function (event) {
		var keycomp = this.props.keycomp;
		if (!keycomp) return
		modelActionCreators.destroy('keycomp', false, keycomp)
	},

	render: function () {
		var keycomp = this.props.keycomp || {};
		var key = this.props._key;
		var attribute_name = (!!keycomp.attribute_id) ? AttributeStore.get(keycomp.attribute_id).attribute : ''
		var idx = this.props.idx
		var existingComps = {}
		var attrSelections = []

		if (key._dirty) {
			// find existing selections so we can exclude them from the menu
			KeycompStore.query({key_id: (key.key_id || key.cid)}).forEach(function (kc) {
				existingComps[kc.attribute_id] = kc.attribute_id
			})
			AttributeStore.query({model_id: key.model_id}).forEach(function (attr) {
				if (attr.attribute_id != keycomp.attribute_id && attr.attribute_id in existingComps) return;
				if (attr._destroy) return;
				var attribute_id = (attr.attribute_id || attr.cid)
				attrSelections.push(
					<option value={attribute_id} key={attribute_id}>
  						{attr.attribute}
  					</option>
  				);
  			})
  			if (!keycomp.keycomp_id) attrSelections.unshift(<option value={0}> ---- </option>);
		}


		return <div className={(key._dirty?'unsaved':'') + (key._destroy?'destroyed':'') + ' detail-row'}>

			<span>

				<span>
					{key._dirty ?
						<select
							ref="selector"
							name="type"
							value = {keycomp.attribute_id || 0}
							onChange = {this.handleAttrChoice}>
							{attrSelections}
						</select>
						: attribute_name
					}

				</span>
			</span>
			<span></span>
			<span></span>
			<span className="centered">
			{!keycomp.keycomp_id && !keycomp.cid ? null : <span
				className="showonhover small clickable grayed icon icon-kub-remove"
				title="Delete component"
				onClick={this.handleDelete}>
			</span>}</span>
		</div>
	}
})

export default KeyDetailList;
