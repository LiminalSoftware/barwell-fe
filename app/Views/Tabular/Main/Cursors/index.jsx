import React from "react"
import fieldTypes from "../../../fields"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';


import style from "./style.less"

import constants from "../../../../constants/MetasheetConstants"

import Overlay from '../Overlay'

import util from "../../../../util/util"

import Pointer from "./Pointer"
import ColumnOverlay from "./ColumnOverlay"


const nav = window.navigator
const userAgent = nav.userAgent

const IS_CHROME = userAgent.indexOf("Chrome") > -1
const HAS_3D = util.has3d()
const RIGHT_FRINGE = 200

export default class Cursors extends React.Component {

	constructor (props) {
		super(props)
		this.state = {
			pointer: props.pointer,
			selection: props.selection
		}
	}

	componentWillMount = () => {
		const _this = this
		this._debounceSetPointer = this._setPointer//_.debounce(this._setPointer, 300)
	}

	_setPointer = (pointer) => {
		this.setState({pointer: pointer})
	}

	componentWillReceiveProps = (props) => {
		const resizeColumnChanged = props.resizeColumn !== this.props.resizeColumn
		const {view, pointer} = this.props
		let newState = {}

		this._debounceSetPointer(pointer)

		if (resizeColumnChanged) {
			newState = _.extend(newState,
				{resizeWidth: view.data.columns[props.resizeColumn]}
			)
		}

		this.setState(newState)
	}

	showContextMenu = (e) => {
		var cursors = ReactDOM.findDOMNode(this.overlayInner)
		var view = this.props.view
		var geo = view.data.geometry
		var offset = $(cursors).offset()
		var y = e.pageY - offset.top
		var x = e.pageX - offset.left

		this.setState({contextPos: {x: x, y: y}})
	}

	renderOverlays = () => {
		const {view, resizeColumn, model, columnOffset, focused,
			selection: sel, copyarea: cpy} = this.props
		const {dragOffset, pointer: ptr} = this.state

		const numFixed = view.data._fixedCols.length

		const showJaggedEdge = ((sel.right >= numFixed)
			&& (sel.left < numFixed + columnOffset) && (columnOffset > 0));

		const jaggedEdgeIsLight = (sel.right > numFixed + columnOffset)

		const singleton = (sel.top === sel.bottom && sel.left === sel.right)

		const rowsSelected = Object.keys(this.props.store.getSelection()).length > 0;
		const rowOffset = this.props.rowOffset

		const store = this.props.store
		const rowCount = store.getRecordCount()
		const geo = view.data.geometry

		const col = view.data._visibleCols[ptr.left];
		const obj = store.getObject(ptr.top);


		const hideCursor = (rowsSelected || rowCount === 0 || resizeColumn);

		return ([

			(!focused || hideCursor) ? null :
				<Pointer {...this.props}
				col = {col}
				obj = {obj}
				key = "pointer"
				dragOffset = {dragOffset}
				position={ptr}
				fudge = {{width: -1, left: 0, top: 1, height: -1}}
				ref="pointer" />,

			(!focused || hideCursor)  ? null :
			<Overlay
			{...this.props}
			className = {"selection-outer" +
				(singleton ? '-singleton ' : ' ') +
				(this.props.isMouseDown ? " selection-outer-pressed " : "")}
			ref="selectionOuter"
			key="selectionOuter"
			position = {sel}
			dragOffset = {dragOffset}
			fudge = {{left: -5, top: -4, height: 9, width: 9}}>
				<div className = {"selection-border " + (this.props.isMouseDown ? " selection-border-pressed " : "")}
					style={{left: "-3px", right: "-3px", top: "-3px", bottom: "-3px"}}/>

			</Overlay>,

			cpy ? <Overlay
				{...this.props}
				columns={view.data._visibleCols}
				className={" copyarea running marching-ants "}
				ref="copyarea"
				key="copyarea"
				dragOffset = {dragOffset}
				position = {cpy}
				fudge = {{left: -1, top: 0.25, height: 1, width: 1}}/> : null,

			<Overlay
				{...this.props}
				columns = {view.data._visibleCols}
				className = {" new-row-adder " + (hideCursor ? " no-transition " : "")}
				ref = "rowadder"
				key="rowadder"
				dragOffset = {dragOffset}
				fudge = {{left: -1 * geo.labelWidth - 2, width: geo.labelWidth + 2}}
				position = {{left: 0, right: view.data._visibleCols.length, top: rowCount, bottom: rowCount}}>
				<div className="flush" onClick={this.props._addRecord}>add new row</div>
			</Overlay>,

			focused && !hideCursor && !this.props.isMouseDown && showJaggedEdge ? <Overlay
				{...this.props}
				className = {" jagged-edge" + (jaggedEdgeIsLight ? "":"")}
				ref = "jaggedEdge"
				key="jaggedEdge"
				dragOffset = {dragOffset}
				showHiddenHack = {true}
				position = {{
					left: view.data._fixedCols.length,
					width: '10px',
					top: sel.top,
					bottom: sel.bottom
				}}
				fudge = {{
					left: (sel.right < numFixed + columnOffset) ? -6 :
						 (sel.left < numFixed + columnOffset) ? -7 : 64, 
					width: 10, top: 0, height: 1}} />
			: null
		]).concat(!focused || hideCursor ? [] : view.data.sorting.map(s => {
			const column = view.data.columns[s.attribute]
			const left = view.data._visibleCols.indexOf(column)
			return <Overlay
				{...this.props}
				key={"sort-" + (s.column_id)}
				className = {`sort-${s.descending ? 'desc': 'asc'}-overlay`}
				fudge = {{left: -1, width: 1, height: 1}}
				dragOffset = {dragOffset}
				position = {{
					left: left,
					right: left,
					top: 0,
					bottom: rowCount - 1
				}}/>
		})).concat(resizeColumn ? this.getColumnOverlays() : [])
	}

	getColumnOverlays = () => {
		const {view, model, store, _getRangeStyle, rowOffset} = this.props
		const rowCount = store.getRecordCount()
		const columns = view.data._visibleCols
		const {dragOffset} = this.state

		return columns.map((column, idx) =>
			<ColumnOverlay
				model = {model}
				store = {store}
				rowOffset = {rowOffset}
				view={view}
				dragOffset = {dragOffset}
				column={column}
				key={column.cid || column.column_id}
				index={idx}
				rowCount={rowCount}
				_getRangeStyle={_getRangeStyle}/>
		)
	}

	getOuterWrapperStyle = () => {
		const view = this.props.view
		const geo = view.data.geometry
		const fixedWidth = view.data._fixedWidth
		const floatWidth = view.data._floatWidth
		const adjustedWidth = fixedWidth + floatWidth + geo.labelWidth
			- this.props.hiddenColWidth

		return {
			top: geo.headerHeight - 3,
			bottom: geo.footerHeight + 1,
			left: 0,
			width: (fixedWidth + floatWidth + geo.labelWidth + RIGHT_FRINGE) + 'px',
			overflow: 'hidden',
			zIndex: 6,
			pointerEvents: 'auto',
		}
	}

	getInnerWrapperStyle = () => {
		const geo = this.props.view.data.geometry
		const marginTop = (-1 * this.props.rowOffset * geo.rowHeight)
		const store = this.props.store
		const rowCount = store.getRecordCount()

		return {
			top: 1,
			left: 0,
			right: 0,
			height: (rowCount + 1)  * geo.rowHeight + 1,
			transition: IS_CHROME ? 'transform 100ms linear' : null,
			transform: HAS_3D ? `translate(0,${marginTop + 2}px)` : null,
			marginTop: HAS_3D ? null : (marginTop + 2 + 'px'),
			cursor: "cell",
			overflow: "visible"
		}
	}

	render = () => {
		const view = this.props.view
		const model = this.props.model

		return <div className = "wrapper overlay"
				style = {this.getOuterWrapperStyle()}
				onMouseDown = {this.props._handleClick}
				onDoubleClick = {this.props._handleEdit}
				onContextMenu = {this.props._handleContextMenu}
				onWheel = {this.props._handleWheel}>

				<div className = "wrapper force-layer"
					ref = "overlayInner"
					style = {this.getInnerWrapperStyle()}>

					{this.renderOverlays()}

				</div>
			</div>
	}
}
