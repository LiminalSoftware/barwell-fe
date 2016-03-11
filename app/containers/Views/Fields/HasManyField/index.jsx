import React from "react"
import _ from "underscore"
import $ from "jquery"

import AttributeStore from "../../../../stores/AttributeStore"
import ModelStore from "../../../../stores/ModelStore"
import KeyStore from "../../../../stores/KeyStore"
import KeycompStore from "../../../../stores/KeycompStore"
import constant from "../../../../constants/MetasheetConstants"
import modelActionCreators from "../../../../actions/modelActionCreators"

import selectableMixin from '../selectableMixin'

import LabelChoice from '../HasSomeParts/LabelChoice'
import BubbleColorchoice from '../HasSomeParts/BubbleColorchoice'
import SearchDropdown from '../HasSomeParts/SearchDropdown'
import AlignChoice from '../textFieldConfig/AlignChoice'
import Bubble from '../HasSomeParts/Bubble'

var hasManyField = {
	
	defaultWidth: 200,

	configParts: [AlignChoice, LabelChoice, BubbleColorchoice],

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

	element: React.createClass({
		mixins: [selectableMixin],

		getInitialState: function () {
			return {
				droppable: false, 
				editing: false
			}
		},

		handleDragEnter: function (e) {
			e.preventDefault();
			this.setState({droppable: true})
		},

		preventDefault: function (e) {
			e.preventDefault();
		},

		handleDragLeave: function () {
			this.setState({droppable: false})
		},

		handleDragEnd: function () {
			this.setState({droppable: false})
		},

		commitChanges: function () {
			if (this.state.editing) this.refs.search.chooseSelection({})
			this.revert()
		},

		revert: function () {
			this.setState({editing: false})
			this.props._handleBlur()
		},

		cancelChanges: function () {
			this.revert()
		},

		handleEdit: function (e) {
			this.setState({
				editing: true
			})
		},

		handleDrop: function (e) {
			var model = this.props.model
			var config = this.props.config
			var relationId = config.relation_id
			var thisObj = this.props.object
			var relObj = JSON.parse(
				e.dataTransfer.getData('application/json')
			)
			modelActionCreators.moveHasMany(relationId, thisObj, relObj)
			e.dataTransfer.dropEffect = 'move'
			this.setState({droppable: false})
		},

		render: function () {
			var model = this.props.model
			var value = this.props.value
			var config = this.props.config || {}
			var relatedModel = ModelStore.get(config.related_model_id)
			var style = this.props.style || {}
			var showDetail =  this.props.selected && !this.state.editing
			var cellStyle = {
				lineHeight: this.props.rowHeight + 'px',
				background: this.props.selected ? 'white' : null
			}
			var editorIconStyle

			if (showDetail) {
				editorIconStyle = {
					position: 'absolute',
					top: 0, 
					bottom: 0,
					width: '25px',
					lineHeight: this.props.rowHeight + 'px',
					zIndex: 251
				}
				if (config.align === 'right') editorIconStyle.left = 0
				else editorIconStyle.right = 0
			}

		// console.log('showDetail: ' + showDetail)

			return <span
				onDragEnter = {this.handleDragEnter}
				onDragLeave = {this.handleDragLeave}
				onDragEnd = {this.handleDragEnd}
				onDragOver = {this.preventDefault}
				onDrop = {this.handleDrop}
				className = {"table-cell " + (this.state.selected ? " table-cell-selected" : "")}
				style={style} >
				<span className = "table-cell-inner"
					style = {cellStyle}>
				{
					(value || []).map(function(obj, idx) {
						if(idx < 5) return <Bubble
							key = {obj.cid || obj[relatedModel._pk]}
							obj = {obj}
							model = {relatedModel}
							color = {config.bubbleColor}
							label = {config.label}/>
					})
				}
				{showDetail ? <span
					className = "editor-icon icon icon-magnifier"
					style = {editorIconStyle}
					onClick = {this.handleEdit}/>
					: null}
				</span>
				{
					this.state.editing ? 
					<SearchDropdown ref = "search" _revert = {this.revert} {...this.props}/>
					: null
				}
			</span>
		},
	})

}

export default hasManyField

