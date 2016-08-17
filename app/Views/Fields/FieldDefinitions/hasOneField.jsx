import React, { Component, PropTypes } from 'react';

import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"

/*
 *	Align styler
 */
import AlignChoice from "../ConfigParts/AlignChoice"
import getAlignStyles from "../ConfigParts/AlignChoice/getStyles"

import fieldUtils from "../fieldUtils"

import DropdownElement from "../DropdownElement"
import getHTML from "../DropdownElement/getHTML"

import createHasManyPatch from "../hasSomeParts/createHasManyPatch"

const format = function (value, config) {
	return (value || {})[config.label]
}

const stylers = [getAlignStyles]



export default {
	
	configCleanser: function (config) {
		var label = config.label
		var model_id = config.related_model_id
		var model = ModelStore.get(model_id)
		var attribute_id = label.substring(1)
		var attribute = AttributeStore.get(attribute_id)
		if (!attribute) config.label = ModelStore.label_attribute_id
		if (!config.align) config.align = 'left'
		return config
	},

	sortable: false,

	defaultWidth: 200,

	defaultAlign: 'center',

	icon: 'arrows-merge',

	isSingular: true,

	category: 'Relations',

	description: 'Has one',

	configParts: [AlignChoice],

	getDisplayHTML: getHTML.bind(null, format, stylers),
	
	element: class HasOneElement extends Component {

		handleEdit (e) {
			this.refs.el.handleEdit(e)
		}

		handleBlur = (commit) => {
			this.refs.el.handleBlur(commit)
		}

		commit = (relatedObject) => {
			const hasOneObj = this.props.object
			const config = this.props.config
			const patch = createHasManyPatch(
				config.relation_id, 
				this.props.object,
				relatedObject)

			// this.props.commit(patch)
			
		}

		render () {
			return <DropdownElement {...this.props}
				ref = "el"
				commit = {this.commit}
				format = {format}
				stylers = {stylers}/>
		}

	}

}