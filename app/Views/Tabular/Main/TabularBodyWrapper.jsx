import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

import styles from "./styles/wrappers.less"

import modelActionCreators from "../../../actions/modelActionCreators"
import constants from "../../../constants/MetasheetConstants"
import ViewStore from "../../../stores/ViewStore"

import storeFactory from 'flux-store-factory';
import dispatcher from "../../../dispatcher/MetasheetDispatcher"
import createTabularStore from '../TabularStore'
import Overlay from './Overlay'

import util from "../../../util/util"

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

const nav = window.navigator
const userAgent = nav.userAgent

const IS_CHROME = userAgent.indexOf("Chrome") > -1
const HAS_3D = util.has3d()
const OFFSET_TOLERANCE = 100
const WINDOW_ROWS = 50
const FETCH_DEBOUNCE = 500
const MAX_ROWS = 300
const RHS_PADDING = 100
const CYCLE = 60


import TabularTBody from "./TabularTBody"
import TableHeader from "./TableHeader"
import RowResizer from "./RowResizer"

var TabularBodyWrapper = React.createClass ({

	_lastFetch: 0,
	_lastPaint: 0,

	getInitialState: function () {
		var view = this.props.view
		var geo = view.data.geometry
		return {
			initialFetchComplete: false,
			fetchOffset: 0,
			requestedOffset: 0,
			columnOffset: 0,
      		hiddenColWidth: 0,
			rowOffset: 0,
			colOffset: 0,
			detailOpen: false,
			contextOpen: false,
		}
	},
	
	componentWillMount: function () {
		this.debounceFetch = _.debounce(this.fetch, FETCH_DEBOUNCE)
	},

	componentDidMount: function () {
		var _this = this;
		/* 
		 * Delay the fetch until the current dispatch is complete
		 * (only relevant if the view is loaded directly from url)
		 */
		setTimeout(() => _this.fetch(true), 0)
	},

	componentWillUpdate: function (nextProps, nextState) {
		// if (this.__timer) clearTimeout(this.__timer);
		this.debounceFetch(false, nextProps, nextState);
	},

	componentWillReceiveProps: function (nextProps) {
		this.debounceFetch(false, nextProps);
	},

	fetch: function (force, nextProps, nextState) {
		var _this = this
		var view = this.props.view
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

			modelActionCreators.createNotification({
				narrative: 'Loading view data',
				type: 'loading',
				icon: ' icon-loading spin ',
				notification_key: 'loadingRecords',
				notificationTime: 0,
			});
			
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
	},

	shouldComponentUpdate: function (newProps, nextState) {
		var oldProps = this.props
		return oldProps.view !== newProps.view 
	},


	render: function () {
		var view = this.props.view
		var model = this.props.model
		var store = this.props.store
		var rowCount = store.getRecordCount()
		var geo = view.data.geometry

		var rowOffset = this.props.rowOffset
		var colOffset = this.props.hiddenColWidth

		const rowHeight = Math.floor(geo.rowHeight)

		var marginTop = -1 * rowOffset * rowHeight
		var fixedWidth = view.data._fixedWidth
		var floatWidth = view.data._floatWidth
		var adjustedWidth = fixedWidth + floatWidth + geo.labelWidth
			- this.state.hiddenColWidth

		var fetchStart = this.state.fetchOffset
		var fetchEnd = Math.min(this.state.fetchOffset + MAX_ROWS, rowCount)

		var tableProps = _.extend(_.clone(this.props), {

		})
		
		if (!this.state.initialFetchComplete) 
			return <div><div className="loader"/></div>

		return <div
			className = "wrapper overlay"
			ref="tbodyWrapper"
			style = {{
				left: 0,
				width: (adjustedWidth + geo.colAddWidth + 2) + 'px',
				top: 0,
				bottom: 0,
				overflow: 'hidden'
			}}>
			
			<RowResizer {...this.props} adjustedWidth = {adjustedWidth} />

			<div className = " wrapper"
				style = {{
					left: 0,
					top: 0,
					bottom: 0,
					height: (rowCount + 2)  * geo.rowHeight + geo.headerHeight,
					width: (fixedWidth + geo.labelWidth + 1) + 'px'
				}}>


			{/*LHS TABLE BODY*/}
			<div className = "wrapper outer-table-wrapper lhs-pane"
				ref = "lhsTableBody"
				style = {{
					top: geo.headerHeight + 'px',
					overflow: 'hidden',
					background: constants.colors.GRAY_4
				}}>
				<div className = "wrapper lhs-offset-wrapper"
					ref = "lhsOffsetter"
					style = {{
						top: '0',
						height: (rowCount * rowHeight + 1),
						borderRight: "2px solid " + constants.colors.RED_BRIGHT_TRANS,
						
						marginTop: HAS_3D ? 0 : (marginTop + 2 + 'px'),
						transform: HAS_3D ? `translate(0, ${marginTop}px)` : null,
						transition: IS_CHROME && HAS_3D ? 'transform 75ms linear' : null,
						background: 'white'
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
					width = {view.data._fixedWidth + geo.labelWidth -1 }
					columns = {view.data._fixedCols}/>
				</div>
			</div>
			{/*END LHS TABLE BODY*/}

			{/*LHS HEADER*/}
			<TableHeader {...this.props}
				ref = "lhsHead"
				totalWidth = {fixedWidth +  geo.labelWidth + 2}
				leftOffset = {0}
				side = {'lhs'}
				hasRowLabel = {true}
				columns = {view.data._fixedCols} />
			{/*END LHS HEADER*/}
			</div>
			{/*LHS OUTER*/}
			


			{/*RHS OUTER*/}
			<div className = "wrapper rhs-h-scroll-outer"
				ref = "rhsTableBody"
				style = {{
					top: 0,
					left: (view.data._fixedWidth + geo.labelWidth + 1) + 'px',
					height: (rowCount * rowHeight + geo.headerHeight + 1),
					width:  view.data._floatWidth + geo.colAddWidth + 'px',
					// transform: IS_CHROME && HAS_3D ? 'translateZ(10px)' : null,
					background: constants.colors.GRAY_4,
					overflow: 'hidden'
				}}>
				<div className = "rhs-h-scroll wrapper"
					ref = "rhsHorizontalOffsetter"
					style = {{
						marginLeft: (-1 * this.props.hiddenColWidth ) + 'px',
						transition: 'margin-left 75ms linear'
						// use marginLeft instead of translate here because translate will clobber the other offset
					}}>

					{/*RHS TABLE BODY WRAPPER*/}
					{/*<div className = "wrapper"
						style = {{
							left: 0,
							top: geo.headerHeight,
							width: (floatWidth + 1),
							height: (rowCount * rowHeight - marginTop),
							transform: HAS_3D ? 'translateZ(10px)' : null,
							background: 'white',
							overflow: 'hidden'
						}}>*/}
					<div className = "wrapper"
						ref = "rhsOffsetter"
						style = {{
							top: geo.headerHeight,
							left: 0,
							right: 0,
							marginTop: HAS_3D ? 0 : (marginTop + 2 + 'px'),
							transform: HAS_3D ? `translate(0, ${marginTop}px)` : null,
							// transformStyle: "preserve-3d",
							transition: IS_CHROME && HAS_3D ? 'transform 75ms linear' : null,
							height: (rowCount * rowHeight),
							width: (floatWidth + 1),
							background: 'white',
							borderRight: "1px solid steelblue"
						}}>
						<TabularTBody
							{...this.props}
							_handleDetail = {this.handleDetail}
							rowOffset = {rowOffset}
							ref = "rhs"
							prefix = "rhs"
							columns = {view.data._floatCols}
							offsetCols = {view.data._fixedCols.length}
							fetchStart = {fetchStart}
							fetchEnd = {fetchEnd}
							width={view.data._floatWidth + 1} />
					

					</div>
					<TableHeader {...this.props}
						ref = "rhsHead"
						totalWidth = {floatWidth + 2}
						leftOffset = {0}
						side = "rhs"
						columns = {view.data._floatCols} />
				</div>

			</div>
			
			
		</div>;
	}
});


export default TabularBodyWrapper
