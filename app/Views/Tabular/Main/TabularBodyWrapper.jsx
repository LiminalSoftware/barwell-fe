import React, { Component, PropTypes } from 'react';
import fieldTypes from "../../fields"
import _ from "underscore"

import styles from "./styles/wrappers.less"

import modelActionCreators from "../../../actions/modelActionCreators"
import cidLookup from "../../../actions/cidLookup"
import constants from "../../../constants/MetasheetConstants"
import ViewStore from "../../../stores/ViewStore"

import dispatcher from "../../../dispatcher/MetasheetDispatcher"
import createTabularStore from '../TabularStore'
import Overlay from './Overlay'

import util from "../../../util/util"

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const nav = window.navigator
const userAgent = nav.userAgent

const IS_CHROME = userAgent.indexOf("Chrome") > -1
const HAS_3D = util.has3d()
const OFFSET_TOLERANCE = 100
const WINDOW_ROWS = 50
const FETCH_DEBOUNCE = 500
const MAX_ROWS = 500
const RHS_PADDING = 100
const CYCLE = 60

import TabularTBody from "./TabularTBody"
import TableHeader from "./TableHeader"
import RowResizer from "./RowResizer"

export default class TabularBodyWrapper extends Component {

	constructor (props) {
		super(props)
		var view = this.props.view
		var geo = view.data.geometry

		this._lastFetch = 0
		this._lastPaint = 0

		this.state = {
			initialFetchComplete: false,
			fetchOffset: 0,
			requestedOffset: 0,
			columnOffset: 0,
      		hiddenColWidth: 0,
			rowOffset: 0,
			colOffset: 0,
			detailOpen: false,
			contextOpen: false,
			resizing: false,
			dragOffset: 0
		}
	}

	componentWillMount = () => {
		this.debounceFetch = _.debounce(this.fetch, FETCH_DEBOUNCE)
	}

	componentDidMount = () => {
		var _this = this;
		/*
		 * Delay the fetch until the current dispatch is complete
		 * (only relevant if the view is loaded directly from url)
		 */

		setTimeout(() => _this.fetch(true), 0)
	}

	componentWillReceiveProps = (nextProps) => {
		const {view} = this.props
		const fixedCols = view.data._fixedCols
		const numFixed = fixedCols.length

		if (nextProps.resizeColumn) this.setState({dragOffset: 0})

		this.debounceFetch((view.view_id !== nextProps.view.view_id), nextProps);
	}

	fetch = (force, nextProps, nextState) => {
		var _this = this
		var _view = this.props.view
		const view = ViewStore.get(_view.cid || _view.view_id)
		var offset = this.state.requestedOffset

		var target = ((nextState ? nextState : this.state).rowOffset - (MAX_ROWS - WINDOW_ROWS) / 2)
		var boundedTarget = util.limit(0, this.props.nRows - MAX_ROWS, target)

		var delta = Math.abs(offset - target)
		var sorting = nextProps ? nextProps.view.data.sorting : view.data.sorting


		if (view.view_id && ((force === true)
			|| (delta > OFFSET_TOLERANCE && offset !== boundedTarget)
			|| !_.isEqual(sorting, this.state.sorting)
		)) {
			console.log('FETCH RECORDS, start: ' + boundedTarget + ', end: ' + (boundedTarget + MAX_ROWS))

			this.setState({
				requestedOffset: boundedTarget,
				fetching: true,
				sorting: sorting
			})

			// modelActionCreators.createNotification({
			// 	narrative: 'Loading view data',
			// 	type: 'loading',
			// 	icon: ' icon-loading spin ',
			// 	notification_key: 'loadingRecords',
			// 	notificationTime: 0,
			// });

			modelActionCreators.fetchRecords(
				view,
				boundedTarget,
				boundedTarget + MAX_ROWS,
				view.data.sorting,
				this.props.store.storeId
			).then(function () {
				_this.setState({
					initialFetchComplete: true,
					fetchOffset: boundedTarget,
					fetching: false
				});
				_this.forceUpdate()

				modelActionCreators.clearNotification({
					notification_key: 'loadingRecords'
				})
			})
		}
	}

	shouldComponentUpdate = (newProps, nextState) => {
		var oldProps = this.props
		return oldProps.view !== newProps.view ||
		oldProps.resizeColumn !== newProps.resizeColumn ||
		this.state.fetching !== nextState.fetching ||
		this.state.dragOffset !== nextState.dragOffset
	}

	render = () => {
		const {view, model, store, resizeColumn, rowOffset, hiddenColWidth: colOffset} = this.props
		const {dragOffset, fetchOffset} = this.state
		const rowCount = store.getRecordCount()
		const geo = view.data.geometry

		const rowHeight = Math.floor(geo.rowHeight)

		var marginTop = -1 * rowOffset * rowHeight


		const resizeSide = view.data._fixedCols.some(col => col.column_id === resizeColumn) ? 'lhs' :
					view.data._floatCols.some(col => col.column_id === resizeColumn) ? 'rhs' : ''

		var fixedWidth = view.data._fixedWidth + (resizeSide === 'lhs' ? dragOffset : 0)
		var floatWidth = view.data._floatWidth + (resizeSide === 'rhs' ? dragOffset : 0)

		var adjustedWidth = fixedWidth + floatWidth + geo.labelWidth
			- this.state.hiddenColWidth

		const lhsWidth = Math.floor((fixedWidth +  geo.labelWidth) / 2) * 2

		var fetchStart = fetchOffset
		var fetchEnd = Math.min(fetchOffset + MAX_ROWS, rowCount)

		var tableProps = _.extend(_.clone(this.props), {

		})

		return <ReactCSSTransitionGroup {...constants.transitions.fadein} className="flush wrapper" ref="tbodyWrapper">
			{!this.state.initialFetchComplete ?
			<div className="flush loader-overlay" key="loader">
				<div className="wrapper flush loader-overlay" ref="loaderOverlay">
					<p className="loader-hero">
					<span className="loader" style={{display: "inline-block", marginRight: 20, marginBottom: -8}}/>
					<span>Loading data from the server...</span>
					</p>
				</div>
			</div>

			:
			<div className="flush wrapper" key="content">
			<RowResizer {...this.props} adjustedWidth = {adjustedWidth} />

			<div className = " wrapper"
				style = {{
					left: 0,
					top: 0,
					bottom: 0,
					height: "100%",
					width: (lhsWidth + 1)
				}}>


			{/*LHS TABLE BODY*/}
			<div className = "wrapper outer-table-wrapper lhs-pane"
				ref = "lhsTableBody"
				style = {{
					left: 0,
					top: geo.headerHeight,
					width: (lhsWidth + 1),
					overflow: 'hidden',
					background: constants.colors.VIEW_BACKING,
					borderRight: `1px solid ${constants.colors.TABLE_EDGE}`,
					zIndex: 3,
					transition: resizeColumn ? 'none' : 'linear 100ms',
					// boxShadow:`0 0 0 3px ${constants.colors.TABLE_SHADOW}`,
				}}>
				<div className = "wrapper lhs-offset-wrapper"
					ref = "lhsOffsetter"
					style = {{
						left: 0,
						top: 0,
						height: (rowCount * rowHeight + 1),

						marginTop: HAS_3D ? 0 : (marginTop + 2 + 'px'),
						transform: HAS_3D ? `translate3d(1, ${marginTop}px, 0)` : null,
						transition: IS_CHROME && !resizeColumn && HAS_3D ? 'transform 100ms linear' : 'none',
						background: constants.colors.TABLE_BACKING,
						overflow: "hidden",
						borderBottom: `1px solid ${constants.colors.TABLE_BORDER}`,
						zIndex: 0
					}}>

				{resizeColumn ? null :
				<TabularTBody
					{...this.props}
					rowOffset = {rowOffset}
					ref="lhs"
					prefix = "lhs"
					hasRowLabel = {true}
					offsetCols = {0}
					fetchStart = {fetchStart}
					fetchEnd = {fetchEnd}
					width = {lhsWidth}
					columns = {view.data._fixedCols}/>
				}
				</div>
			</div>
			{/*END LHS TABLE BODY*/}

			{/*LHS HEADER*/}
			<TableHeader {...this.props}
				ref = "lhsHead"
				totalWidth = {lhsWidth + 1}
				leftOffset = {0}
				resizeColumn = {resizeSide === 'lhs' ? resizeColumn : null}
				dragOffset = {resizeSide === 'lhs' ? dragOffset : 0}
				side='lhs'
				headerOrFooter="header"
				hasRowLabel={true}
				columns = {view.data._fixedCols} />

			{/*LHS FOOTER*/}
			<TableHeader {...this.props}
				ref = "lhsFooter"
				totalWidth = {lhsWidth + 1}
				leftOffset = {0}
				resizeColumn = {resizeSide === 'lhs' ? resizeColumn : null}
				dragOffset = {resizeSide === 'lhs' ? dragOffset : 0}
				side="lhs"
				headerOrFooter="footer"
				hasRowLabel={true}
				columns={view.data._fixedCols} />

			{/*END LHS HEADER*/}
			</div>
			{/*END LHS OUTER*/}



			{/*RHS OUTER*/}
			<div className = "wrapper rhs-h-scroll-outer"
				ref = "rhsTableBody"
				style = {{
					top: 0,
					left: lhsWidth,
					bottom: 0,
					right: 0,
					background: constants.colors.VIEW_BACKING,
					transition: resizeColumn ? 'none' : 'linear 100ms',
					overflow: 'hidden'
				}}>

				<div className = "rhs-h-scroll wrapper"
					ref = "rhsHorizontalOffsetter"
					style = {{
						marginLeft: (-1 * this.props.hiddenColWidth ),
						transition: resizeColumn ? 'none' : 'margin-left linear 100ms',
						position: 'absolute',
						top: 0,
						bottom: 0,
						// use marginLeft instead of translate here because translate will clobber the other offset
					}}>

					{/*RHS TABLE BODY WRAPPER*/}
					<div className = "wrapper"
						ref = "rhsOffsetter"
						style = {{
							top: geo.headerHeight,
							left: 0,
							right: 0,
							marginTop: HAS_3D ? 0 : (marginTop + 2 + 'px'),
							transform: HAS_3D ? `translate3d(1, ${marginTop}px, 0)` : null,
							transformStyle: "preserve-3d",
							transition: IS_CHROME && !resizeColumn && HAS_3D ? 'transform 100ms linear' : 'none',
							height: (rowCount * rowHeight + 1),
							width: (floatWidth + 1),
							background: constants.colors.TABLE_BACKING,
							borderRight: `1px solid ${constants.colors.TABLE_BORDER}`,
							overflow: "hidden",
							borderBottom: `1px solid ${constants.colors.TABLE_BORDER}`,
						}}>
						{resizeColumn ? null : <TabularTBody
							{...this.props}
							_handleDetail = {this.handleDetail}
							rowOffset = {rowOffset}
							ref = "rhs"
							prefix = "rhs"
							style={{marginLeft: 0}}
							columns = {view.data._floatCols}
							offsetCols = {view.data._fixedCols.length}
							fetchStart = {fetchStart}
							fetchEnd = {fetchEnd}
							width={view.data._floatWidth} />}


					</div>
					<TableHeader {...this.props}
						ref = "rhsHead"
						leftOffset = {0}
						side = "rhs"
						headerOrFooter="header"
						hasColumnAdder = {true}
						resizeColumn = {resizeSide === 'rhs' ? resizeColumn : null}
						dragOffset = {resizeSide === 'rhs' ? dragOffset : 0}
						columns = {view.data._floatCols} />

					<TableHeader {...this.props}
						ref = "rhsFooter"
						leftOffset = {0}
						side = "rhs"
						resizeColumn = {resizeSide === 'rhs' ? resizeColumn : null}
						dragOffset = {resizeSide === 'rhs' ? dragOffset : 0}
						headerOrFooter="footer"
						columns = {view.data._floatCols} />

				</div>

			</div>

		</div>
		}
		</ReactCSSTransitionGroup>
	}
}
