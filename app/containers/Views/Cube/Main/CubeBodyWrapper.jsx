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

import TabularTHead from "../../Tabular/Main/TabularTHead"
import CubeTHead from './CubeTHead'
import CubeTBody from './CubeTBody'

import util from '../../../../util/util'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

const FETCH_DEBOUNCE = 500

const MAX_LEVELS = 5000
const WINDOW_ROWS = 50
const WINDOW_COLS = 20

const RHS_PADDING = 100
const CYCLE = 60

const HAS_3D = util.has3d()


var CubeBodyWrapper = React.createClass ({

	_lastFetch: 0,
	_lastPaint: 0,

	getInitialState: function () {
		var view = this.props.view
		var geo = view.data.geometry
		return {
			verticalOffset: 0,
			horizontalOffset: 0
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
		this.debounceFetch = _.debounce(this.fetchBody, FETCH_DEBOUNCE)
		this.fetch()
	},

	componentWillReceiveProps: function (nextProps) {
		// this.debounceFetch(false, nextProps);
	},

	fetch: function () {
		var _this = this
		return Promise.all([
			this.fetchLevels('row'),
			this.fetchLevels('column')
		]).then(function () {
			return _this.fetchBody()
		});
	},

	fetchLevels: function (dimension) {
		var view = this.props.view
		var _this = this
		this.setState({['fetching' + dimension]: true})
		return modelActionCreators.fetchLevels(
			view,
			dimension,
			0, MAX_LEVELS
		).then(function () {
			_this.setState({
				['fetching' + dimension]: false
			})
		})
	},

	fetchBody: function () {
		var view = this.props.view
		var geo = view.data.geometry
		var store = this.props.store
		var vOffset = this.state.verticalOffset
		var hOffset = this.state.horizontalOffset
		var filter = []

		// var curVStart = store.getStart('row')
		// var curHStart = store.getStart('column')

		// if (Math.abs(curVStart - vStart) < geo.bfrTol &&
		// 	Math.abs(curHStart - hStart) < geo.bfrTol &&
		// 	curVStart !== null && curHStart  !== null) {
		// 	return; // if scroll is within tolerances, do nothing
		// }
		

		return modelActionCreators.fetchCubeValues(view, store, hOffset, WINDOW_ROWS, vOffset, WINDOW_COLS).then(function () {
			store.setStart('row', vOffset)
			store.setStart('column', hOffset)
		})
	},

	render: function () {
		var view = this.props.view
		var getColumns = (c => view.data.columns['a' + c])
		var model = this.props.model
		var store = this.props.store
		var geo = view.data.geometry
		var focused = this.props.focused

		var rowHeaders = view.row_aggregates.map(getColumns)
		var rowHeaderWidth = util.sum(rowHeaders, 'width')

		var columnHeaders = view.column_aggregates.map(getColumns)
		var columnHeaderHeight = columnHeaders.length * geo.rowHeight

		var numColumns = store.getCount('column')
		var numRows = store.getCount('row')
		
		var bodyWidth = numColumns * geo.columnWidth
		var adjustedWidth = rowHeaderWidth + bodyWidth

		var marginTop = 0
		
		return <div
			className = {"wrapper force-layer " + (focused ? "focused" : "blurred")}
			ref="tbodyWrapper"
			style = {{
				left: 0,
				width: (adjustedWidth + 3) + 'px',
				transformStyle: 'preserve-3d'
			}}>

			{/* LHS TABLE BODY */}
			<div className = "wrapper outer-table-wrapper "
				style = {{
					top: columnHeaderHeight + 'px',
					transform: 'translateZ(1px)',
					overflow: 'hidden',
					position: 'absolute'
				}}>
				<div className = "wrapper force-layer"
					ref = "lhsOffsetter"
					style = {{
						top: 0,
						height: (numRows * geo.rowHeight) + 'px',
						marginTop: HAS_3D ? 0 : (marginTop + 2 + 'px'),
						transform: 'translateZ(0) translateY(' + marginTop + 'px)'
					}}>
					<CubeTHead {...this.props}
						dimension = {'row'}
						store = {store}
						groups = {rowHeaders} />
				</div>
			</div>
			{/*END LHS TABLE BODY*/}

			{/*LHS HEADER*/}
			<TabularTHead
				ref = "lhsHead"
				totalWidth = {rowHeaderWidth}
				leftOffset = {0}
				side = {'lhs'}
				hasRowLabel = {false}
				columns = {rowHeaders}
				focused = {focused}
				height = {columnHeaderHeight}
				view = {view} />
			{/*LHS OUTER*/}
			
			{/*RHS OUTER*/}
			<div className = {"wrapper " + " rhs-h-scroll-outer--" + (focused ? "focused" : "blurred")}
				style = {{
					top: 0,
					bottom: 0,
					left: rowHeaderWidth + 'px',
					width:  bodyWidth + 'px',
					transform: 'translateZ(1px)',
					overflow: 'hidden',
				}}>
				<div className = "rhs-h-scroll wrapper force-layer"
					ref = "rhsHorizontalOffsetter"
					style = {{
						marginLeft: (-1) + 'px'
					}}>
					<div className = "wrapper"
						style = {{
							top: 0,
							height: columnHeaderHeight + 'px',
							left: 0,
							right: 0,
							transform: 'translateZ(2px)',
							background: 'white'
						}}>
						<CubeTHead {...this.props}
							dimension = {'column'}
							store = {store}
							groups = {columnHeaders} />
					</div>
					<div className = "wrapper"
						style = {{
							left: 0,
							top: columnHeaderHeight + 'px',
							width: (bodyWidth) + 'px',
							bottom: 0,
							overflow: 'hidden'
						}}>
						<CubeTBody
							{...this.props}
							verticalOffset = {0}
							horizontalOffset = {0}/>
					</div>
					
				</div>
			</div>
		</div>;
	}
});


export default CubeBodyWrapper
