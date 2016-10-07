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
const MAX_ROWS = 500
const RHS_PADDING = 100
const CYCLE = 60


import TabularTBody from "./TabularTBody"
import TableHeader from "./TableHeader"
import TableFooter from "./TableFooter"
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

		const lhsWidth = Math.floor((fixedWidth +  geo.labelWidth) / 2) * 2

		var fetchStart = this.state.fetchOffset
		var fetchEnd = Math.min(this.state.fetchOffset + MAX_ROWS, rowCount)

		var tableProps = _.extend(_.clone(this.props), {

		})
		
		if (!this.state.initialFetchComplete) 
			return <div><div className="loader"/></div>

		return <div
			className = "wrapper"
			ref="tbodyWrapper"
			style = {{
				left: 0,
				right: 0,
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
					height: "100%",
					width: lhsWidth
				}}>


			{/*LHS TABLE BODY*/}
			<div className = "wrapper outer-table-wrapper lhs-pane"
				ref = "lhsTableBody"
				style = {{
					left: 0,
					top: geo.headerHeight,
					width: lhsWidth + 1,
					overflow: 'hidden',
					background: constants.colors.VIEW_BACKING,
					borderRight: `1px solid ${constants.colors.TABLE_EDGE}`,
					zIndex: 3,
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
						transition: IS_CHROME && HAS_3D ? 'transform 75ms linear' : null,
						background: constants.colors.TABLE_BACKING,
						overflow: "hidden",
						borderBottom: `1px solid ${constants.colors.TABLE_BORDER}`,
						zIndex: 0
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
					width = {lhsWidth}
					columns = {view.data._fixedCols}/>
				</div>
			</div>
			{/*END LHS TABLE BODY*/}

			{/*LHS HEADER*/}
			<TableHeader {...this.props}
				ref = "lhsHead"
				totalWidth = {lhsWidth + 1}
				leftOffset = {0}
				side = {'lhs'}
				hasRowLabel = {true}
				columns = {view.data._fixedCols} />

			<TableFooter {...this.props}
				ref = "lhsHead"
				totalWidth = {lhsWidth + 1}
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
					left: lhsWidth,
					bottom: 0,
					right: 0,
					background: constants.colors.VIEW_BACKING,
					overflow: 'hidden'
				}}>

				<div className = "rhs-h-scroll wrapper"
					ref = "rhsHorizontalOffsetter"
					style = {{
						marginLeft: (-1 * this.props.hiddenColWidth ) + 'px',
						transition: 'margin-left cubic-bezier(.16,.85,.5,1) 75ms',
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
							transition: IS_CHROME && HAS_3D ? 'transform 75ms linear' : null,
							height: (rowCount * rowHeight + 1),
							width: (floatWidth + 1),
							background: constants.colors.TABLE_BACKING,
							borderRight: `1px solid ${constants.colors.TABLE_BORDER}`,
							overflow: "hidden",
							borderBottom: `1px solid ${constants.colors.TABLE_BORDER}`,
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
							width={view.data._floatWidth} />
					

					</div>
					<TableHeader {...this.props}
						ref = "rhsHead"
						leftOffset = {0}
						side = "rhs"
						columns = {view.data._floatCols} />

					<TableFooter {...this.props}
						ref = "rhsFooter"
						leftOffset = {0}
						side = {'rhs'}
						columns = {view.data._floatCols} />

					
				</div>


				


			</div>


			
			
		</div>;
	}
});


export default TabularBodyWrapper
