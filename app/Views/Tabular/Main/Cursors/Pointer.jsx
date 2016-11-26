import React from "react"
import fieldTypes from "../../../fields"

import constants from "../../../../constants/MetasheetConstants"

import modelActionCreators from "../../../../actions/modelActionCreators"

import Overlay from '../Overlay'

export default class Pointer extends React.Component {
	shouldComponentUpdate = (nextProps, nextState) => {
		return nextProps.position !== this.props.position ||
			nextProps.view !== this.props.view ||
			nextProps.obj !== this.props.obj ||
			nextProps.col !== this.props.col ||
			nextProps.columnOffset !== this.props.columnOffset
			nextProps.dragOffset !== this.props.dragOffset
	}

	

	getPointerElement = () => {
		const {view, model, store, position, col, obj} = this.props
		if (!position) return null
		var geo = view.data.geometry;
			
		
		var element = col ? (fieldTypes[col.type]).element : null;
		
		if (!obj) return;

		const commit = (value, extras) => {
			let patch = {}
			if (model._pk in obj) patch[model._pk] = obj[model._pk]
			else patch.cid = obj.cid
			patch[col.column_id] = value
			modelActionCreators.multiPatchRecords(model, patch, {method: ' typing a new value'})
		}


		
		if (element) return React.createElement(element, {
			key: (obj.cid || obj[model._pk]) + '-' + col.columnId,
			config: col,
			model: model,
			view: view,
			selected: true,
			object: obj,
			value: obj[col.column_id],

			spaceTop: position.top - this.props.rowOffset,
			spaceBottom: this.props.visibleRows + this.props.rowOffset - position.top,

			rowHeight: geo.rowHeight,

			_handleBlur: this.props._handleBlur,
			_handleClick: this.props._handleClick,
			_handleWheel: this.props._handleWheel,

			commit: commit,
			
			className: 'table-cell',
			ref: 'pointerCell',
			sorted: false,
			style: {
				left: '0px',
				bottom: '0px',
				top: '0px',
				right: '0px',
				border: 'none',
				lineHeight: geo.rowHeight + 'px',
				background: constants.colors.TABLE_BACKING,
				overflow: 'visible'
			}
		})
	}

	render = () => {
		const {view, model, store, position} = this.props
		if (position === null) return null
		return <Overlay
				{...this.props}
				className = "pointer"
				key={`pointer-${position.left}-${position.top}`}
				fudge={this.props.fudge}
				position = {position}>
			{this.getPointerElement()}
		</Overlay>
	}
}