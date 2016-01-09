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

var TabularBodyWrapper = React.createClass ({

	_lastFetch: 0,
	_lastPaint: 0,

	getInitialState: function () {
		var view = this.props.view
		var geo = view.data.geometry
		return {
			offset: 0,
			hiddenCols: 0,
      hiddenColWidth: 0,
			rowOffset: 0,
			colOffset: 0
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

	fetch: function (force) {
		var view = this.props.view
		var offset = this.state.rowOffset
		var target = (offset - (MAX_ROWS - WINDOW_ROWS) / 2)
		var boundedOffset = util.limit(0, this.props.nRows - MAX_ROWS, target)
		var delta = Math.abs(offset - target)

		if (force || (delta > OFFSET_TOLERANCE && offset !== boundedOffset)
			// or sort order has changed
			) {
			modelActionCreators.fetchRecords(
				view,
				boundedOffset,
				boundedOffset + MAX_ROWS,
				null //view.data.sorting
			)
			this.setState({
				fetching: true,
			})
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
			this.props.children !== nextProps.children
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

		return <div
			className = {"tabular-body-wrapper " + (focused ? "focused" : "blurred")}
			ref="tbodyWrapper"
			style = {{
				left: 0,
				top: 0,
				bottom: 0,
				width: (view.data.fixedWidth + view.data.floatWidth + 2) + 'px'
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

			<FakeLines
				width = {fixedWidth + floatWidth + geo.labelWidth
					- this.state.hiddenColWidth}
				rowCount = {rowCount}
				ref = "FakeLines"
				{...this.props}/>

			{/*LHS TABLE BODY*/}
			<div className = "inner-wrapper "
				style = {{
					left: geo.leftGutter + 'px',
					top: geo.headerHeight + 1 + 'px',
					marginTop: marginTop + 'px',
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
					width:  view.data.floatWidth  + 'px'
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
