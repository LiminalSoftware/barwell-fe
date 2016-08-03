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
		var col = view.data.visibleCols[ptr.left];
		var obj = store.getObject(ptr.top);
		var element = col ? (fieldTypes[col.type]).element : null;
		var selector = {};
		
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

			// can be eliminated?
			// column_id: ('a' + (col.attribute_id || col.cid)),

			spaceTop: ptr.top - this.props.rowOffset,
			spaceBottom: this.props.visibleRows + this.props.rowOffset - ptr.top,

			rowHeight: geo.rowHeight,

			_handleBlur: this.props._handleBlur,
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
				lineHeight: geo.rowHeight + 'px'
			}
		})
	},

	getOuterWrapperStyle: function () {
		const view = this.props.view
		const geo = view.data.geometry
		const fixedWidth = view.data.fixedWidth
		const floatWidth = view.data.floatWidth
		const adjustedWidth = fixedWidth + floatWidth + geo.labelWidth
			- this.props.hiddenColWidth

		return {
			top: geo.headerHeight - 1 - 2 + 'px',
			bottom: 0,
			left: geo.leftGutter + 'px',
			width: (fixedWidth + floatWidth + geo.labelWidth + RIGHT_FRINGE) + 'px',
			overflow: 'hidden',
			transformStyle: 'preserve-3d',
			transform: 'translateZ(0)',
			zIndex: 10,
			pointerEvents: 'none',
		}
	},

	getInnerWrapperStyle: function () {
		const geo = this.props.view.data.geometry
		const marginTop = (-1 * this.props.rowOffset * geo.rowHeight)
		const store = this.props.store
		const rowCount = store.getRecordCount()

		return {
			top: "1px",
			left: 0,
			right: 0,
			height: ((rowCount + 1) * geo.rowHeight) + 'px',
			transformStyle: 'preserve-3d',
			transition: IS_CHROME ? 'transform 75ms linear' : null,
			transform: HAS_3D ? `translate3d(0,${marginTop + 2}px, 20px)` : null,
			marginTop: HAS_3D ? null : (marginTop + 2 + 'px'),
			zIndex: 10
		}
	},

	showColumnOverlays: function () {
		const _this = this
		const view = this.props.view
		const store = this.props.store
		const rowCount = store.getRecordCount()
		const height = Math.min(this.props.rowOffset + 50, rowCount)

		const labelStyle = {
			transform: "rotate(-90deg)",
			transformOrigin: "left top 0",
		    display: "block",
		    position: "absolute",
		    top: "40%",
		    left: "40%",
		    width: "500px",
		}
		return null;
		
		return view.data.fixedCols
		.concat(view.data.floatCols)
		.map( (col, idx) => 
			<Overlay {..._this.props} 
			key = {col.column_id}
			className = "view-reference-box"
			position = {{
				left: idx, 
				right: idx, 
				top: this.props.rowOffset, 
				bottom: height
			}}>
				<span style={labelStyle}>
				<span className={`icon icon-${fieldTypes[col.type].icon}` }
					style={{fontSize: "20px", lineHeight: "24px"}}/>
				{col.name}
				</span>
			</Overlay>
		).concat([<Overlay {..._this.props}
		className = "view-reference-outline"
		position = {{
			left: 0, 
			right: view.data.fixedCols.length - 1, 
			top: this.props.rowOffset,
			bottom: height
		}}>Fixed Columns</Overlay>])
	},

	renderCursor: function () {
		const view = this.props.view
		const model = this.props.model
		const focused = true

		
		const ptr = this.props.pointer
		const sel = this.props.selection
		const cpy = this.props.copyarea
		const showJaggedEdge = ((sel.right >= view.data.fixedCols.length)
			&& (sel.left < view.data.fixedCols.length + this.props.columnOffset) && (this.props.columnOffset > 0));

		const singleton = (sel.top === sel.bottom && sel.left === sel.right)
		const pointerFudge = {width: -1, top: 1, height: -1};
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
				className = {"pointer " + (focused ? " focused" : " ") + 
					(focused ? " " : "  ") +
					(this.props.expanded ? " pointer--expanded " : "")}
				ref = "pointer"
				fudge = {pointerFudge}
				position = {ptr}>
				{this.getPointerElement()}
			</Overlay>,

			<Overlay
				{...this.props}
				className = {"selection-border selection-border--" + (focused ? "focused" : "blurred")}
				ref = "selectionBorder"
				position = {sel}
				fudge = {{left: -2.25, top: -0.25, height: 2.5, width: 3.5}}>
				<div className = {"selection-drag-box selection-drag-box--" + (focused ? "focused" : "blurred")} />
			</Overlay>,

			<Overlay
				{...this.props}
				className = {"selection-outer" + (singleton ? '-singleton' : '')}
				ref = "selectionOuter"
				position = {sel}
				fudge = {{left: -3.75, top: -2.75, height: 7.5, width: 6.75}}>
			</Overlay>,

			<Overlay
				{...this.props}
				columns = {view.data.visibleCols}
				className = {" copyarea running marching-ants " + (focused ? " focused" : "")}
				ref = "copyarea"
				position = {cpy}
				fudge = {{left: -1.25, top: 0, height: 1, width: 1.25}}/>,

			showJaggedEdge ? <Overlay
				{...this.props}
				className = " jagged-edge "
				ref = "jaggedEdge"
				showHiddenHack = {true}
				position = {{
					left: view.data.fixedCols.length,
					width: '10px',
					top: sel.top,
					bottom: sel.bottom
				}}
				fudge = {{left: -6, width: 10 }} />
			: null
		]
	},

	render: function () {
		const view = this.props.view
		const model = this.props.model
		const focused = this.props.focused
		
		

		return <div className = {`wrapper overlay ${this.props.focused?"":"gray-out"}`}
				style = {this.getOuterWrapperStyle()} 
				onDoubleClick = {this.props._handleEdit}
				onContextMenu = {this.props._handleContextMenu}
				onWheel = {this.props._handleWheel}>
				<ReactCSSTransitionGroup comonent="div"
					{...constants.transitions.fadeinout}
					className = "wrapper force-layer"
					ref = "overlayInner"
					style = {this.getInnerWrapperStyle()}>

					{
					!focused ? 
						this.showColumnOverlays() : 
						this.renderCursor()
					}

				</ReactCSSTransitionGroup>
			</div>
	}
});

export default Cursors
