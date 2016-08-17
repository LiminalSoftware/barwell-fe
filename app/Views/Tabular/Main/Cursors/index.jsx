import React from "react"
import fieldTypes from "../../../fields"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import constants from "../../../../constants/MetasheetConstants"

import Overlay from '../Overlay'

import PopDownMenu from "../../../../components/PopDownMenu"
import util from "../../../../util/util"

const nav = window.navigator
const userAgent = nav.userAgent

const IS_CHROME = userAgent.indexOf("Chrome") > -1
const HAS_3D = util.has3d()
const RIGHT_FRINGE = 200

var Cursors = React.createClass ({

	showContextMenu: function (e) {
		var cursors = ReactDOM.findDOMNode(this.overlayInner)
		var view = this.props.view
		var geo = view.data.geometry
		var offset = $(cursors).offset()
		var y = e.pageY - offset.top
		var x = e.pageX - offset.left

		this.setState({contextPos: {x: x, y: y}})
	},

	getPointerElement: function () {
		// console.log('getPointerElement')
		var view = this.props.view;
		var model = this.props.model;
		var geo = view.data.geometry;
		var store = this.props.store;
		var ptr = this.props.pointer;
		var col = view.data._visibleCols[ptr.left];
		var obj = store.getObject(ptr.top);
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

			spaceTop: ptr.top - this.props.rowOffset,
			spaceBottom: this.props.visibleRows + this.props.rowOffset - ptr.top,

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
				background: 'white'
			}
		})
	},


	renderCursor: function () {
		const view = this.props.view
		const model = this.props.model
		const focused = true

		
		const ptr = this.props.pointer
		const sel = this.props.selection
		const cpy = this.props.copyarea
		const showJaggedEdge = ((sel.right >= view.data._fixedCols.length)
			&& (sel.left < view.data._fixedCols.length + this.props.columnOffset) && (this.props.columnOffset > 0));

		const singleton = (sel.top === sel.bottom && sel.left === sel.right)
		
		const rowsSelected = Object.keys(this.props.store.getSelection()).length > 0;
		const rowOffset = this.props.rowOffset

		const store = this.props.store
		const rowCount = store.getRecordCount()
		const geo = view.data.geometry
		
		const hideCursor = (rowsSelected || rowCount === 0);

		if (hideCursor) return null
		return [

			<Overlay
				{...this.props}
				className = "pointer"
				ref = "pointer"
				key={`pointer-${ptr.left}-${ptr.top}`}
				fudge = {{width: -1, left: 1, top: 1, height: -1}}
				position = {ptr}>
				{this.getPointerElement()}
			</Overlay>,


			<Overlay
				{...this.props}
				className = {"selection-outer" + (singleton ? '-singleton' : '')}
				ref="selectionOuter"
				key="selectionOuter"
				position = {sel}
				fudge = {{left: -3, top: -3.25, height: 7.5, width: 6.75}}>
				<div className = "selection-border selection-border"
					style={{left: "-3px", right: "-3px", top: "-3px", bottom: "-3px"}}/>
				
			</Overlay>,

			<Overlay
				{...this.props}
				columns = {view.data._visibleCols}
				className = {" copyarea running marching-ants " + (focused ? " focused" : "")}
				ref = "copyarea"
				key="copyare"
				position = {cpy}
				fudge = {{left: 0.25, top: 0.25, height: 1, width: 1}}/>,

			showJaggedEdge ? <Overlay
				{...this.props}
				className = " jagged-edge "
				ref = "jaggedEdge"
				key="jaggedEdge"
				showHiddenHack = {true}
				position = {{
					left: view.data._fixedCols.length,
					width: '10px',
					top: sel.top,
					bottom: sel.bottom
				}}
				fudge = {{left: -6, width: 10, top: 1, height: -4}} />
			: null
		]
	},

	getOuterWrapperStyle: function () {
		const view = this.props.view
		const geo = view.data.geometry
		const fixedWidth = view.data._fixedWidth
		const floatWidth = view.data._floatWidth
		const adjustedWidth = fixedWidth + floatWidth + geo.labelWidth
			- this.props.hiddenColWidth

		return {
			top: geo.headerHeight - 3,
			bottom: 0,
			left: 0,
			width: (fixedWidth + floatWidth + geo.labelWidth + RIGHT_FRINGE) + 'px',
			overflow: 'hidden',
			zIndex: 6,
			pointerEvents: 'none',
		}
	},

	getInnerWrapperStyle: function () {
		const geo = this.props.view.data.geometry
		const marginTop = (-1 * this.props.rowOffset * geo.rowHeight)
		const store = this.props.store
		const rowCount = store.getRecordCount()

		return {
			top: 1,
			left: 0,
			right: 0,
			height: rowCount  * geo.rowHeight + 3,
			transition: IS_CHROME ? 'transform 75ms linear' : null,
			transform: HAS_3D ? `translate(0,${marginTop + 2}px)` : null,
			marginTop: HAS_3D ? null : (marginTop + 2 + 'px'),
		}
	},

	render: function () {
		const view = this.props.view
		const model = this.props.model
		const focused = this.props.focused

		return <div className = "wrapper overlay"
				style = {this.getOuterWrapperStyle()} 
				onDoubleClick = {this.props._handleEdit}
				onContextMenu = {this.props._handleContextMenu}
				onWheel = {this.props._handleWheel}>

				<div className = "wrapper force-layer"
					ref = "overlayInner"
					style = {this.getInnerWrapperStyle()}>
					{
					!focused ? 
						null : 
						this.renderCursor()
					}
				</div>
			</div>
	}
});

export default Cursors
