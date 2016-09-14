import React from "react"
import ReactDOM from "react-dom"
import fieldTypes from "../../fields"
import _ from "underscore"

import constants from "../../../constants/MetasheetConstants"

import modelActionCreators from "../../../actions/modelActionCreators"
import ViewStore from "../../../stores/ViewStore"

export default class TabularPage extends React.Component {

	prepareRow (obj, index, orderProps) {
		const {store, model, pointer, prefix} = this.props
		const {start: offset} = this.state
		const pk = model._pk

		const rowKey = prefix + '-tr-' + (obj.cid || obj[pk])
		const selectedRecords = this.props.store.getSelection()
		const rowCount = store.getRecordCount()

		return <TabularTR
			view = {this.props.view}
			model = {this.props.model}
			hasRowLabel = {this.props.hasRowLabel}
			selected = {(obj.cid || obj[pk]) in selectedRecords}
			columns = {this.props.columns}
			obj = {obj}
			row = {index + offset}
			rowKey = {rowKey}
			ref = {rowKey}
			key = {rowKey}
			{...orderProps}/>
	}

	render = () => {

		
	}
}