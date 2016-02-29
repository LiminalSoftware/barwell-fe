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

import hasSomeConfigA from '../HasSomeParts/hasSomeConfigA'
import SearchDropdown from '../HasSomeParts/SearchDropdown'
import Bubble from '../HasSomeParts/Bubble'

var hasManyField = {
	
	defaultWidth: 150,

	configA: hasSomeConfigA,

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
			var showDetail = this.state.selected && !this.state.editing
			var cellStyle = {
				lineHeight: this.props.rowHeight + 'px',
				background: this.props.selected ? 'white' : null
			}
			var editorIconStyle = {
				lineHeight: this.props.rowHeight + 'px',
				right: 0
			}

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
							label = {config.label}/>
					})
				}
				{showDetail ? <span
					className = "editor-icon icon icon-search"
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

