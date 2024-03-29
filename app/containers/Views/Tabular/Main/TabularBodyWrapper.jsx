import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

import styles from "./styles/wrappers.less"

import modelActionCreators from "../../../../actions/modelActionCreators"
import ViewStore from "../../../../stores/ViewStore"
import FocusStore from "../../../../stores/FocusStore"
import ViewDataStores from "../../../../stores/ViewDataStores"

import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'
import createTabularStore from './TabularStore.jsx'
import Overlay from './Overlay'
import DetailBar from '../../../DetailBar'

import util from '../../../../util/util'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

var OFFSET_TOLERANCE = 100
var WINDOW_ROWS = 50
var FETCH_DEBOUNCE = 500
var MAX_ROWS = 300
var RHS_PADDING = 100

import TabularTBody from "./TabularTBody"
import TabularTHead from "./TabularTHead"
import FakeLines from "./FakeLines"
import RowResizer from "./RowResizer"

var TabularBodyWrapper = React.createClass ({

	_lastFetch: 0,
	_lastPaint: 0,

	getInitialState: function () {
		var view = this.props.view
		var geo = view.data.geometry
		return {
			fetchOffset: 0,
			requestedOffset: 0,
			hiddenCols: 0,
      		hiddenColWidth: 0,
			rowOffset: 0,
			colOffset: 0,
			detailOpen: false,
			contextOpen: false,
			renderSide: 'lhs',
			frameNum: 0
		}
	},

	_onChange: function () {
		// this.setState({contextOpen: false, detailOpen: false})
		this.forceUpdate()
		this.refs.lhs.forceUpdate()
		this.refs.rhs.forceUpdate()
		this.refs.lhsHead.forceUpdate()
		this.refs.rhsHead.forceUpdate()
	},

	componentWillMount: function () {
		this.debounceFetch = _.debounce(this.fetch, FETCH_DEBOUNCE)
		this.fetch(true)
	},

	componentWillUnmount: function () {
		
	},

	componentWillUpdate: function (nextProps, nextState) {
		this.setState({
			renderSide: this.state.renderSide === 'lhs' ? 'rhs' : 'lhs',
			frameNum: this.state.frameNum + 1
		})
		this.debounceFetch(false, nextProps, nextState)
	},

	componentWillReceiveProps: function (nextProps) {
		this.debounceFetch(false, nextProps)
	},

	finishFetch: function () {
		this.setState({
			fetching: false
		})
	},

	fetch: function (force, nextProps, nextState) {
		var _this = this
		var view = this.props.view
		var offset = this.state.requestedOffset

		var target = ((nextState ? nextState : this.state).rowOffset - (MAX_ROWS - WINDOW_ROWS) / 2)
		var boundedTarget = util.limit(0, this.props.nRows - MAX_ROWS, target)

		var delta = Math.abs(offset - target)
		var sorting = nextProps ? nextProps.view.data.sorting : view.data.sorting

		if ((force === true)
			|| (delta > OFFSET_TOLERANCE && offset !== boundedTarget)
			|| !_.isEqual(sorting, this.state.sorting) 
		) {
			console.log('FETCH RECORDS, start: ' + boundedTarget + ', end: ' + (boundedTarget + MAX_ROWS))
			this.setState({
				requestedOffset: boundedTarget,
				fetching: true,
				sorting: sorting
			})

			modelActionCreators.fetchRecords(
				view,
				boundedTarget,
				boundedTarget + MAX_ROWS,
				view.data.sorting
			).then(function () {
				_this.setState({
					fetchOffset: boundedTarget,
					fetching: false
				})
			})
		}
	},

	shouldComponentUpdate: function (nextProps, nextState) {
		var oldProps = this.props
		return this.props.view !== nextProps.view ||
			this.props.hiddenColWidth !== nextProps.hiddenColWidth ||
			this.props.rowOffset !== nextProps.rowOffset ||
			this.props.children !== nextProps.children ||
			this.state.fetching !== nextState.fetching
	},

	handleDetail: function (e) {
		var coords = this.props._getRCCoords(e)
		this.setState({
			detailOpen: true,
			detailX: coords.left,
			detailY: coords.top
		})
	},

	hideDetailBar: function () {
		this.setState({detailOpen: false})
	},

	render: function () {
		var view = this.props.view
		var model = this.props.model
		var store = this.props.store
		var rowCount = store.getRecordCount()
		var geo = view.data.geometry
		var focused = this.props.focused

		var rowOffset = this.props.rowOffset
		var colOffset = this.props.hiddenColWidth

		var marginTop = (-1 * rowOffset * geo.rowHeight)
		var fixedWidth = view.data.fixedWidth
		var floatWidth = view.data.floatWidth
		var adjustedWidth = fixedWidth + floatWidth + geo.labelWidth
			- this.state.hiddenColWidth

		var fetchStart = this.state.fetchOffset
		var fetchEnd = Math.min(this.state.fetchOffset + MAX_ROWS, rowCount)

		var tableProps = _.extend(_.clone(this.props), {

		})

		return <div
			className = {"tabular-body-wrapper force-layer " + (focused ? "focused" : "blurred")}
			ref="tbodyWrapper"
			style = {{
				left: 0,
				top: 0,
				bottom: 0,
				width: (adjustedWidth + 3) + 'px',
				transformStyle: 'preserve-3d'
			}}>

			{
				this.state.fetching ? 
					<div 
						className = "loader-overlay"
						style = {{width: 250 + 'px'}}>
						<div className="three-quarters-loader three-quarters-loader--green"></div>
						Loading...
					</div>
					: null
			}
			
			<RowResizer {...this.props} adjustedWidth = {adjustedWidth} />

			<div className = "lhs-outer wrapper"
				style = {{
					left: geo.leftGutter + 'px',
					top: 0,
					bottom: 0,
					width: (fixedWidth + geo.labelWidth) + 'px',
					transformStyle: 'preserve-3d'
				}}>
			{/*LHS TABLE BODY*/}
			<div className = "wrapper outer-table-wrapper "
				style = {{
					left: 0,
					bottom: 0,
					right: 0,
					top: geo.headerHeight + 'px',
					transform: 'translateZ(1px)',
					overflow: 'hidden',
				}}>
				<div className = "wrapper force-layer"
					style = {{
						left: 0,
						right: 0,
						top: 0,
						height: (rowCount * geo.rowHeight) + 'px',
						marginTop: marginTop + 'px'
					}}>

				<TabularTBody
					{...this.props}
					rowOffset = {rowOffset}
					ref="lhs"
					prefix = "lhs"
					hasRowLabel = {true}
					offsetCols = {0}
					fetchStart = {fetchStart}
					fetchEnd = {fetchEnd}
					shouldPaint = {this.state.renderSide === 'lhs'}
					frameNum = {this.state.frameNum}
					style = {{
						left: 0,
						top: 0,
						width:  (view.data.fixedWidth + geo.labelWidth) + 'px',
						height: (rowCount * geo.rowHeight) + 'px',
					}}
					columns = {view.data.fixedCols}/>
				</div>
			</div>
			{/*END LHS TABLE BODY*/}

			{/*LHS HEADER*/}
			<TabularTHead
				ref = "lhsHead"
				totalWidth = {fixedWidth +  geo.labelWidth + 1}
				leftOffset = {0}
				side = {'lhs'}
				hasRowLabel = {true}
				columns = {view.data.fixedCols}
				focused = {focused}
				view = {view} />
			{/*END LHS HEADER*/}
			</div>
			{/*LHS OUTER*/}
			


			{/*RHS OUTER*/}
			<div className = {"wrapper " + " rhs-h-scroll-outer--" + (focused ? "focused" : "blurred")}
				style = {{
					top: 0,
					bottom: 0,
					left: (view.data.fixedWidth + geo.labelWidth) + 'px',
					width:  view.data.floatWidth + geo.colAddWidth + 'px',
					transform: 'translateZ(1px)',
					overflow: 'hidden'
				}}>
				<div className = "rhs-h-scroll wrapper force-layer"
					style = {{
						left: 0,
						bottom: 0,
						top: 0,
						right: 0,
						marginLeft: (-1 * this.props.hiddenColWidth - 1) + 'px',
					}}>

					{/*RHS TABLE BODY WRAPPER*/}
					<div className = "wrapper"
						style = {{
							left: 0,
							top: geo.headerHeight + 'px',
							width: (fixedWidth + floatWidth) + 'px',
							bottom: 0,
							overflow: 'hidden'
						}}>
					<div className = "wrapper force-layer"
						style = {{
							top: 0,
							left: 0,
							right: 0,
							marginTop: marginTop + 'px',
							height: (rowCount * geo.rowHeight) + 'px',
							width: (fixedWidth + floatWidth) + 'px',
						}}>
						<TabularTBody
							{...this.props}
							_handleDetail = {this.handleDetail}
							rowOffset = {rowOffset}
							ref = "rhs"
							prefix = "rhs"
							columns = {view.data.floatCols}
							offsetCols = {view.data.fixedCols.length}
							fetchStart = {fetchStart}
							fetchEnd = {fetchEnd}
							shouldPaint = {this.state.renderSide === 'rhs'}
							frameNum = {this.state.frameNum}
							style = {{
								left: 0,
								top: 0,
								width:  view.data.floatWidth  + 'px',
								height: (rowCount * geo.rowHeight) + 'px',
							}} />
					</div>

					</div>
					<TabularTHead
						ref = "rhsHead"
						totalWidth = {floatWidth + 1}
						leftOffset = {0}
						side = "rhs"
						columns = {view.data.floatCols}
						focused = {focused}
						view = {view} />
				</div>

			</div>
			
			
		</div>;
	}
});


export default TabularBodyWrapper
