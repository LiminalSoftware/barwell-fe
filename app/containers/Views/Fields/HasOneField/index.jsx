import React from "react"
import _ from "underscore"
import $ from "jquery"

import styles from "./hasOneStyles.less"

import AttributeStore from "../../../../stores/AttributeStore"
import RelationStore from "../../../../stores/RelationStore"
import ModelStore from "../../../../stores/ModelStore"

import constant from "../../../../constants/MetasheetConstants"
import modelActionCreators from "../../../../actions/modelActionCreators"
import selectableMixin from '../selectableMixin'
import blurOnClickMixin from '../../../../blurOnClickMixin'
import keyPressMixin from '../keyPressMixin'

import hasSomeConfigA from '../HasSomeParts/hasSomeConfigA'
import SearchDropdown from '../HasSomeParts/SearchDropdown'
import Bubble from '../HasSomeParts/Bubble'

var hasOneField = {
	
	configCleanser: function (config) {
		var label = config.label
		var model_id = config.related_model_id
		var model = ModelStore.get(model_id)
		var attribute_id = label.substring(1)
		var attribute = AttributeStore.get(attribute_id)
		if (!attribute) config.label = ModelStore.label_attribute_id
		return config
	},

	configA: hasSomeConfigA,

	element: React.createClass({

		mixins: [selectableMixin],

		shouldComponentUpdate: function (nextProps, nextState) {
			return nextProps.value !== this.props.value ||
				nextProps.config !== this.props.config ||
				nextState.selected !== this.state.selected ||
				nextState.editing !== this.state.editing
		},

		handleDragEnter: function (e) {
			e.preventDefault();
			this.setState({droppable: true})
		},

		handleDragLeave: function () {
			this.setState({droppable: false})
		},

		getInitialState: function () {
			return {editing: false}
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
			var array = this.props.value
			var obj = (array instanceof Array ? array[0] : null)
			var config = this.props.config || {}
			var relatedModel = ModelStore.get(config.related_model_id)
			var style = this.props.style || {}
			var showDetail = this.props.selected && !this.state.editing
			var value = (array instanceof Array ? array[0][config.label] : '')
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

			return <span
				className = {"table-cell " + (this.state.selected ? " table-cell-selected" : "")}
				onDrop = {this.handleDrop}
				style={style} >
				<span 
					className = "table-cell-inner"
					style = {cellStyle}>
				{obj ? <Bubble
						obj = {obj}
						model = {relatedModel}
						label = {config.label}/>
					: null
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



export default hasOneField
