import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import ViewStore from "../../../../stores/ViewStore"
import FocusStore from "../../../../stores/FocusStore"
import ViewDataStores from "../../../../stores/ViewDataStores"

import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'
import createCubeStore from './CubeStore.jsx'
import Overlay from '../../Tabular/Main/Overlay'
import DetailBar from '../../../DetailBar'

import CubeRowTHead from './CubeRowTHead'

import util from '../../../../util/util'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

var OFFSET_TOLERANCE = 100
var WINDOW_ROWS = 50
var FETCH_DEBOUNCE = 500
var MAX_LEVELS = 5000
var RHS_PADDING = 100
var CYCLE = 60

var HAS_3D = util.has3d()


var CubeBodyWrapper = React.createClass ({

	_lastFetch: 0,
	_lastPaint: 0,

	getInitialState: function () {
		var view = this.props.view
		var geo = view.data.geometry
		return {
			
		}
	},

	_onChange: function () {
		// this.setState({contextOpen: false, detailOpen: false})
		// this.forceUpdate()
		// this.refs.lhs.forceUpdate()
		// this.refs.rhs.forceUpdate()
		// this.refs.lhsHead.forceUpdate()
		// this.refs.rhsHead.forceUpdate()
	},

	componentWillMount: function () {
		this.debounceFetch = _.debounce(this.fetch, FETCH_DEBOUNCE)
		this.fetchRows()
	},

	componentWillUpdate: function (nextProps, nextState) {
		// var renderSide = this.state.renderSide === 'lhs' ? 'rhs' : 'lhs';
		// // if (this.__timer) clearTimeout(this.__timer);
		// this.debounceFetch(false, nextProps, nextState);
		// this.setState({
		// 	renderSide: renderSide,
		// 	frameNum: this.state.frameNum + 1
		// });
	},

	componentWillReceiveProps: function (nextProps) {
		this.debounceFetch(false, nextProps);
	},

	finishFetch: function () {
		this.setState({
			fetchingRows: false
		})
	},

	fetchColumns: function () {

	},

	fetchRows: function () {
		var view = this.props.view
		this.setState({fetchingRows: true})
		modelActionCreators.fetchLevels(
			view,
			'rows',
			MAX_LEVELS
		).then(function () {
			_this.setState({
				fetchingRows: false
			})
		})
	},

	fetch: function (force, nextProps, nextState) {
		var _this = this
		var view = this.props.view
		
	},

	render: function () {
		var view = this.props.view
		var getColumns = (c => view.data.columns['a' + c])
		var model = this.props.model
		var store = this.props.store
		var geo = view.data.geometry
		var focused = this.props.focused
		var rowHeaderCols = view.row_aggregates.map(getColumns)
		var rowHeaderWidth = util.sum(rowHeaderCols, 'width')
		var numColumns = store.getCount('columns')
		var adjustedWidth = rowHeaderWidth + numColumns * geo.colWidth
		var headerHeight = view.column_aggregates.length * geo.rowHeight
		var rowCount = store.getCount('rows')
		var marginTop = 0
		// console.log('render wrapper')
		
		return <div
			className = {"tabular-body-wrapper force-layer " + (focused ? "focused" : "blurred")}
			ref="tbodyWrapper"
			style = {{
				left: 0,
				width: (adjustedWidth + 3) + 'px',
				transformStyle: 'preserve-3d'
			}}>

			{/*LHS TABLE BODY
			<div className = "lhs-outer wrapper"
				style = {{
					left: geo.leftGutter + 'px',
					top: 0,
					bottom: 0,
					width: (fixedWidth + geo.labelWidth) + 'px',
					transformStyle: 'preserve-3d'
				}}>

			groups.map(function (group, idx) {
				if (idx === 0) left = 0
				else left += groups[idx - 1].width
				return <span className="table-cell table-header-cell"
					style = {{
						left: left + 'px', 
						width: groups[idx].width + 'px', 
						height: geo.rowHeight
					}}>
					<span className="table-cell-inner">{group.name}</span>
				</span>
			})
			LHS TABLE BODY*/}
			<div className = "wrapper outer-table-wrapper "
				style = {{
					top: headerHeight + 'px',
					transform: 'translateZ(1px)',
					overflow: 'hidden',
				}}>
				<div className = "wrapper force-layer"
					ref = "lhsOffsetter"
					style = {{
						top: 0,
						height: (rowCount * geo.rowHeight) + 'px',
						marginTop: HAS_3D ? 0 : (marginTop + 2 + 'px'),
						transform: 'translateZ(0) translateY(' + marginTop + 'px)'
					}}>
					<CubeRowTHead {...this.props}
						dimension = {'rows'}
						store = {store}
						groups = {rowHeaderCols} />
					
				</div>
			</div>
			{/*END LHS TABLE BODY*/}

			{/*LHS HEADER
			<TabularTHead
				ref = "lhsHead"
				totalWidth = {fixedWidth +  geo.labelWidth + 1}
				leftOffset = {0}
				side = {'lhs'}
				hasRowLabel = {true}
				columns = {view.data.fixedCols}
				focused = {focused}
				view = {view} />
			END LHS HEADER*/}
			{/*LHS OUTER*/}
			


			{/*RHS OUTER
			<div className = {"wrapper " + " rhs-h-scroll-outer--" + (focused ? "focused" : "blurred")}
				style = {{
					top: 0,
					bottom: 0,
					left: (view.data.fixedWidth + geo.labelWidth) + 'px',
					width:  view.data.floatWidth + geo.colAddWidth + 'px',
					transform: 'translateZ(1px)',
					overflow: 'hidden'
				}}>

			</div>
			*/}
			
		</div>;
	}
});


export default CubeBodyWrapper
