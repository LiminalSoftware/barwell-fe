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
var FETCH_DEBOUNCE = 800
var MAX_ROWS = 500
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

	componentWillReceiveProps: function (nextProps) {
		this.debounceFetch(false, nextProps)
	},

	finishFetch: function () {
		this.setState({fetching: false})
	},

	fetch: function (force, nextProps) {
		var view = this.props.view
		var offset = this.state.fetchOffset

		var target = (this.state.rowOffset - (MAX_ROWS - WINDOW_ROWS) / 2)
		var boundedTarget = util.limit(0, this.props.nRows - MAX_ROWS, target)

		var delta = Math.abs(offset - target)
		var sorting = nextProps ? nextProps.view.data.sorting : view.data.sorting

		if ((force === true)
			|| (delta > OFFSET_TOLERANCE && offset !== boundedTarget)
			|| !_.isEqual(sorting, this.state.sorting) 
		) {
			console.log('fetch..')
			modelActionCreators.fetchRecords(
				view,
				boundedTarget,
				boundedTarget + MAX_ROWS,
				view.data.sorting
			).then(this.finishFetch)

			this.setState({
				fetchOffset: boundedTarget,
				fetching: true,
				sorting: sorting
			})
		}
		else if (delta > OFFSET_TOLERANCE && offset !== boundedTarget) {
			console.log('target: ' + boundedTarget)
			console.log('offset: ' + offset)
			console.log('delta: ' + delta)
		}
	},

	handleAddRecord: function (event) {
		this.props._addRecord()
		event.nativeEvent.stopPropagation()
		event.stopPropagation()
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

		return <div
			className = {"tabular-body-wrapper " + (focused ? "focused" : "blurred")}
			ref="tbodyWrapper"
			style = {{
				left: 0,
				top: 0,
				bottom: 0,
				width: (adjustedWidth) + 'px'
			}}>

			<TabularTHead
				ref = "lhsHead"
				totalWidth = {fixedWidth +  geo.labelWidth}
				leftOffset = {0}
				side = {'lhs'}
				hasRowLabel = {true}
				columns = {view.data.fixedCols}
				focused = {focused}
				view = {view} />

			{
				this.state.fetching ? 
					<div 
						className = "loader-overlay"
						style = {{width: 100 + 'px'}}
						>Loading...</div>
					: null
			}

			<FakeLines
				width = {adjustedWidth}
				rowCount = {rowCount}
				ref = "FakeLines"
				{...this.props}/>

			<RowResizer {...this.props} adjustedWidth = {adjustedWidth} />

			{/*LHS TABLE BODY*/}
			<div className = "inner-wrapper "
				style = {{
					left: geo.leftGutter + 'px',
					top: geo.headerHeight + 1 + 'px',
					marginTop: marginTop + 'px',
					// WebkitTransition: 'margin-top cubic-bezier(.16,.85,.5, 1) 150ms',
					// MozTransition:    'margin-top cubic-bezier(.16,.85,.5, 1) 150ms',
					// MsTransition:     'margin-top cubic-bezier(.16,.85,.5, 1) 150ms',
					// OTransition:      'margin-top cubic-bezier(.16,.85,.5, 1) 150ms',
					// transform: 'translate3d(0,' + marginTop + 'px,0)',
					height: (rowCount * geo.rowHeight) + 'px',
					width: (fixedWidth + floatWidth) + 'px'
				}}>

				{this.props.children}

				<AddNewRowBar {...this.props}
					width = {fixedWidth + floatWidth + geo.labelWidth
						- this.state.hiddenColWidth}
					ref = "addNew"
					rowCount = {rowCount}/>

				<TabularTBody
					{...this.props}
					rowOffset = {this.state.rowOffset}
					ref="lhs"
					prefix = "lhs"
					hasRowLabel = {true}
					offsetCols = {0}
					style = {{
						left: 0,
						top: 0,
						width:  (view.data.fixedWidth + geo.labelWidth) + 'px',
						height: (rowCount * geo.rowHeight) + 'px',
					}}
					columns = {this.props.fixedColumns}/>
			</div>
			{/*END LHS TABLE BODY*/}



			{/*RHS OUTER*/}
			<div className = "rhs-h-scroll-outer inner-wrapper "
				style = {{
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
						marginLeft: (-1 * this.props.hiddenColWidth - 1) + 'px'
					}}>

					<TabularTHead
						ref = "rhsHead"
						totalWidth = {floatWidth + RHS_PADDING}
						leftOffset = {0}
						side = {'rhs'}
						columns = {view.data.floatCols}
						focused = {focused}
						view = {view} />
					{/*RHS TABLE BODY WRAPPER*/}
					<div className = "inner-wrapper "
						style = {{
							left: 0,
							top: geo.headerHeight + 1 + 'px',
							marginTop: marginTop + 'px',
							height: (rowCount * geo.rowHeight) + 'px',
							width: (fixedWidth + floatWidth) + 'px'
						}}>
						<TabularTBody
							{...this.props}
							rowOffset = {this.state.rowOffset}
							ref = "rhs"
							prefix = "rhs"
							columns = {this.props.visibleColumns}
							offsetCols = {view.data.fixedCols.length}
							style = {{
								left: 0,
								top: 0,
								width:  view.data.floatWidth  + 'px',
								height: (rowCount * geo.rowHeight) + 'px',
							}} />
					</div>
				</div>
			</div>
		</div>;
	}
});


export default TabularBodyWrapper
