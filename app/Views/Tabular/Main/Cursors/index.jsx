import React from "react"
import fieldTypes from "../../../fields"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import constants from "../../../../constants/MetasheetConstants"

import Overlay from '../Overlay'

import util from "../../../../util/util"

import Pointer from "./Pointer"


const nav = window.navigator
const userAgent = nav.userAgent

const IS_CHROME = userAgent.indexOf("Chrome") > -1
const HAS_3D = util.has3d()
const RIGHT_FRINGE = 200

var Cursors = React.createClass ({

	componentWillMount: function () {
		const _this = this
		this._debounceSetPointer = _.debounce(ptr => _this.setState({pointer: ptr}), 75)
	},

	componentWillReceiveProps: function (props) {
		const pointerChanged = props.pointer !== this.state.pointer
		const selectionChanged = props.selection !== this.state.selection

		if (selectionChanged && pointerChanged) {
			this.setState({pointer: null, selection: props.selection})
			this._debounceSetPointer(props.pointer)	
		} else if (pointerChanged) {
			this.setState({pointer: props.pointer})
		}
	},

	getInitialState: function () {
		return {pointer: this.props.pointer}
	},

	showContextMenu: function (e) {
		var cursors = ReactDOM.findDOMNode(this.overlayInner)
		var view = this.props.view
		var geo = view.data.geometry
		var offset = $(cursors).offset()
		var y = e.pageY - offset.top
		var x = e.pageX - offset.left

		this.setState({contextPos: {x: x, y: y}})
	},

	renderCursor: function () {
		const {view, model, columnOffset} = this.props
		const focused = true

		
		const ptr = this.props.pointer
		const sel = this.props.selection
		const cpy = this.props.copyarea
		const showJaggedEdge = ((sel.right >= view.data._fixedCols.length)
			&& (sel.left < view.data._fixedCols.length + columnOffset) && (columnOffset > 0));

		const singleton = (sel.top === sel.bottom && sel.left === sel.right)
		
		const rowsSelected = Object.keys(this.props.store.getSelection()).length > 0;
		const rowOffset = this.props.rowOffset

		const store = this.props.store
		const rowCount = store.getRecordCount()
		const geo = view.data.geometry
		
		const hideCursor = (rowsSelected || rowCount === 0);

		if (hideCursor) return null
		return [

			<Pointer {...this.props} position={this.state.pointer} key="pointer"/>,
			
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
				fudge = {{
					left: (sel.right < view.data._fixedCols.length + columnOffset) ? -3 : -4, 
					width: 10, top: 0, height: 1}} />
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
		console.log('render cursors')
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
