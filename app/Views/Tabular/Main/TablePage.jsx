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
			row = {index}
			rowKey = {rowKey}
			ref = {rowKey}
			key = {rowKey}
			{...orderProps}/>
	}

	render = () => {
		const {view} = this.props
		const geo = view.data.geometry

		return <div className="table-row" 
		style = {{
			left: 0,
			top: this.props.start * geo.rowHeight,
			height: this.props.end * geo.rowHeight,
			overflow: "hidden"
		}}>
		{
			this.props.rows.slice().map(r=>this.prepareRow()
		}
		</div>
		
	}
}