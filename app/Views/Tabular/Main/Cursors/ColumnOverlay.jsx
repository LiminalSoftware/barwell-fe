import React from "react"
import fieldTypes from "../../../fields"

import constants from "../../../../constants/MetasheetConstants"

import modelActionCreators from "../../../../actions/modelActionCreators"

import Overlay from '../Overlay'
import TabularTBody from "../TabularTBody"

export default class Pointer extends React.Component {
	shouldComponentUpdate = (nextProps, nextState) => {
		return true
	}

	componentWillReceiveProps = (nextProps) => {
		
	}

	render = () => {
		const {view, rowCount, index, model, store, column, rowOffset} = this.props
		const position = {
			top: 0,
			bottom: rowCount - 1,
			left: index,
			right: index
		}
		const id = `column-overlay-${column.column_id}` 
		return <Overlay
				{...this.props}
				className = "column-overlay"
				key={id}
				id={id}
				dragOffset={this.props.dragOffset}
				fudge={{left: -1, width: 1, top: 1}}
				position = {position}>
			<TabularTBody {...this.props} columns={[column]} style={{marginTop: -1}}/>
		</Overlay>
	}
}