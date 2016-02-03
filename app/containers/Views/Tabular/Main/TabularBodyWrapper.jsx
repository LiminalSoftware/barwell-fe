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
import AddNewRowBar from "./AddNewRowBar"
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
			sorting: view.data.sorting
		}
	},

	_onChange: function () {
		this.forceUpdate()
		this.refs.lhs.forceUpdate()
		this.refs.rhs.forceUpdate()
		this.refs.lhsHead.forceUpdate()
		this.refs.rhsHead.forceUpdate()
		this.refs.FakeLines.forceUpdate()
		this.refs.addNew.forceUpdate()
	},

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange)
		this.props.store.addChangeListener(this._onChange)
		this.debounceFetch = _.debounce(this.fetch, FETCH_DEBOUNCE)
		this.fetch(true)
	},

	componentWillUnmount: function () {
		ViewStore.removeChangeListener(this._onChange)
		this.props.store.removeChangeListener(this._onChange)
	},

	componentWillUpdate: function (nextProps) {
		this.debounceFetch(false, nextProps)
	},

	finishFetch: function () {
		this.setState({
			fetching: false
		})
	},

	fetch: function (force, nextProps) {
		var _this = this
		var view = this.props.view
		var offset = this.state.requestedOffset

		var target = (this.state.rowOffset - (MAX_ROWS - WINDOW_ROWS) / 2)
		var boundedTarget = util.limit(0, this.props.nRows - MAX_ROWS, target)

		var delta = Math.abs(offset - target)
		var sorting = nextProps ? nextProps.view.data.sorting : view.data.sorting

		// console.log('delta: ' + delta)
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
			this.state.rowOffset !== nextState.rowOffset ||
			this.props.children !== nextProps.children ||
			this.state.fetching !== nextState.fetching
	},

	render: function () {
		// console.log('render tbodywrapper: ')
		var view = this.props.view
		var model = this.props.model
		var store = this.props.store
		var rowCount = store.getRecordCount()
		var geo = view.data.geometry
		var focused = this.props.focused

		var rowOffset = this.state.rowOffset
		var colOffset = this.state.hiddenColWidth

		var marginTop = (-1* this.state.rowOffset * geo.rowHeight)
		var fixedWidth = view.data.fixedWidth
		var floatWidth = view.data.floatWidth
		var adjustedWidth = fixedWidth + floatWidth + geo.labelWidth
			- this.state.hiddenColWidth

		var fetchStart = this.state.fetchOffset
		var fetchEnd = Math.min(this.state.fetchOffset + MAX_ROWS, rowCount)

		return <div
			className = {"tabular-body-wrapper " + (focused ? "focused" : "blurred")}
			ref="tbodyWrapper"
			onPaste = {this.props._handlePaste}
			style = {{
				zIndex: 1,
				position: 'absolute',
				left: 0,
				top: 0,
				bottom: 0,
				width: (adjustedWidth) + 'px',
				transform: 'translateZ(0)',
				transformStyle: 'preserve-3D',
				WebkitUserDrag: 'none',
				WebkitUserSelect: 'none',
			    KhtmlUserSelect: 'none',
			    MozUserSelect: 'none',
			    MsUserSelect: 'none',
			    UserSelect: 'none',
			}}>

			{
				this.state.fetching ? 
					<div 
						className = "loader-overlay"
						style = {{width: 250 + 'px'}}>
						<div className="three-quarters-loader"></div>
						Loading...
					</div>
					: null
			}
			
			<FakeLines
				width = {adjustedWidth}
				rowCount = {rowCount}
				ref = "FakeLines"
				{...this.props}/>
			

			<RowResizer {...this.props} adjustedWidth = {adjustedWidth} />

			<div className = "lhs-outer"
				style = {{
					overflow: 'hidden',
					position: 'absolute',
					left: geo.leftGutter + 'px',
					top: 0,
					bottom: 0,
					width: (fixedWidth + geo.labelWidth) + 'px',
				}}>
			{/*LHS TABLE BODY*/}
			<div 
				style = {{
					position: 'absolute',
					left: 0,
					right: 0,
					top: geo.headerHeight + 2 + 'px',
					bottom: 0,
					// transform: 'translate3D(0,0,1em)',
					// transform: 'translate(0, ' + marginTop + 'px)',
					transform: 'translateZ(0)',
					overflow: 'hidden'
				}}>
				<div 
					style = {{
						position: 'absolute',
						left: 0,
						right: 0,
						top: 0,
						height: (rowCount * geo.rowHeight) + 'px',
						marginTop: marginTop + 'px',
						transform: 'translateZ(0)',
					}}>

				<TabularTBody
					{...this.props}
					rowOffset = {this.state.rowOffset}
					ref="lhs"
					prefix = "lhs"
					hasRowLabel = {true}
					offsetCols = {0}
					fetchStart = {fetchStart}
					fetchEnd = {fetchEnd}
					style = {{
						WebkitUserDrag: 'none',
						WebkitUserSelect: 'none',
					    KhtmlUserSelect: 'none',
					    MozUserSelect: 'none',
					    MsUserSelect: 'none',
					    UserSelect: 'none',
						position: 'absolute',
						left: 0,
						top: 0,
						width:  (view.data.fixedWidth + geo.labelWidth) + 'px',
						height: (rowCount * geo.rowHeight) + 'px',
					}}
					columns = {this.props.fixedColumns}/>
				</div>
			</div>
			{/*END LHS TABLE BODY*/}

			{/*LHS HEADER*/}
			<TabularTHead
				ref = "lhsHead"
				totalWidth = {fixedWidth +  geo.labelWidth}
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
			<div className = "rhs-h-scroll-outer"
				style = {{
					position: 'absolute',
					overflow: 'hidden',
					margin: 0,
					padding: 0,
					top: 0,
					bottom: 0,
					left: (view.data.fixedWidth + geo.labelWidth) + 'px',
					width:  view.data.floatWidth + geo.colAddWidth + 'px'
				}}>
				<div className = "rhs-h-scroll inner-wrapper"
					style = {{
						left: 0,
						bottom: 0,
						top: 0,
						right: 0,
						marginLeft: (-1 * this.props.hiddenColWidth - 1) + 'px',
						transform: 'translateZ(0)',
					}}>

					<TabularTHead
						ref = "rhsHead"
						totalWidth = {floatWidth}
						leftOffset = {0}
						side = "rhs"
						columns = {view.data.floatCols}
						focused = {focused}
						view = {view} />
					{/*RHS TABLE BODY WRAPPER*/}
					<div
						style = {{
							position: 'absolute',
							overflow: 'hidden',
							margin: 0,
							padding: 0,
							left: 0,
							top: geo.headerHeight + 2 + 'px',
							width: (fixedWidth + floatWidth) + 'px',
							bottom: 0
						}}>
					<div
						style = {{
							position: 'absolute',
							margin: 0,
							padding: 0,
							top: 0,
							left: 0,
							right: 0,
							transform: 'translateZ(0)',
							marginTop: marginTop + 'px',
							height: (rowCount * geo.rowHeight) + 'px',
							width: (fixedWidth + floatWidth) + 'px',
							// transform: 'translate(0, ' + marginTop + 'px)',
						}}>
						<TabularTBody
							{...this.props}
							rowOffset = {this.state.rowOffset}
							ref = "rhs"
							prefix = "rhs"
							columns = {this.props.visibleColumns}
							offsetCols = {view.data.fixedCols.length}
							fetchStart = {fetchStart}
							fetchEnd = {fetchEnd}
							style = {{
								WebkitUserDrag: 'none',
								WebkitUserSelect: 'none',
							    KhtmlUserSelect: 'none',
							    MozUserSelect: 'none',
							    MsUserSelect: 'none',
							    UserSelect: 'none',
								position: 'absolute',
								left: 0,
								top: 0,
								width:  view.data.floatWidth  + 'px',
								height: (rowCount * geo.rowHeight) + 'px',
							}} />
					</div>
					</div>
				</div>

			</div>
			{/*CURSORS*/}
			<div
				style = {{
					position: 'absolute',
					overflow: 'hidden',
					margin: 0,
					padding: 0,
					top: geo.headerHeight - 3 + 'px',
					bottom: 0,
					left: geo.leftGutter + 'px',
					width: (fixedWidth + floatWidth + geo.labelWidth + 6) + 'px',
					pointerEvents: 'none'
					// transformStyle: 'flat'
				}}>
			<div 
				style = {{
					position: 'absolute',
					margin: 0,
					padding: 0,
					top: 0,
					left: 0,
					right: 0,
					marginTop: marginTop + 4 + 'px',
					transform: 'translateZ(0)',
					height: ((rowCount + 1.5) * geo.rowHeight) + 'px',
					WebkitUserDrag: 'none',
					WebkitUserSelect: 'none',
				    KhtmlUserSelect: 'none',
				    MozUserSelect: 'none',
				    MsUserSelect: 'none',
				    UserSelect: 'none',
				    
				}}>
				{this.props.children}
			</div>
			</div>
			<AddNewRowBar {...this.props}
					width = {fixedWidth + floatWidth + geo.labelWidth
						- this.state.hiddenColWidth}
					ref = "addNew"
					offset = {this.state.rowOffset}
					rowCount = {rowCount}/>
		</div>;
	}
});


export default TabularBodyWrapper
