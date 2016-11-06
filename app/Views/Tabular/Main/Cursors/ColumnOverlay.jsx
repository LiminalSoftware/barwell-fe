import React from "react"
import fieldTypes from "../../../fields"

import constants from "../../../../constants/MetasheetConstants"

import modelActionCreators from "../../../../actions/modelActionCreators"

import Overlay from '../Overlay'

export default class Pointer extends React.Component {
	shouldComponentUpdate = (nextProps, nextState) => {
		return false
	}

	componentWillReceiveProps = (nextProps) => {
		
	}

	getRows = () => {
		return null
	}

	render = () => {
		const {view, rowCount, index, model, store, column} = this.props
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
				fudge={{left: -1, width: 1, top: 1}}
				position = {position}>
			{this.getRows()}
		</Overlay>
	}
}