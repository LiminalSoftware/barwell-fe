import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

import styles from "./styles/wrappers.less"

import modelActionCreators from "../../../actions/modelActionCreators"
import constant from "../../../constants/MetasheetConstants"
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
	},

	componentDidMount: function () {
		var _this = this;
		// HACK.  delay the fetch until the current dispatch is complete
		// (only relevant if the view is loaded directly from url)
		setTimeout(() => _this.fetch(true), 0)
	},

	componentWillUpdate: function (nextProps, nextState) {
		var renderSide = this.state.renderSide === 'lhs' ? 'rhs' : 'lhs';
		// if (this.__timer) clearTimeout(this.__timer);
		this.debounceFetch(false, nextProps, nextState);
		this.setState({
			renderSide: renderSide,
			frameNum: this.state.frameNum + 1
		});
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
				notificationTime: 0
			});
			
			modelActionCreators.fetchRecords(
				view,
				boundedTarget,
				boundedTarget + MAX_ROWS,
				view.data.sorting
			).then(function () {
				console.log('done with fetch')
				_this.setState({
					fetchOffset: boundedTarget,
					fetching: false,
					initialFetchComplete: true
				});
				modelActionCreators.clearNotification({
					notification_key: 'loadingRecords'
				})
			})
		}
	},

	shouldComponentUpdate: function (nextProps, nextState) {
		var oldProps = this.props
		
		return oldProps.view !== nextProps.view || 
		(!this.state.initialFetchComplete && nextState.initialFetchComplete)
	},

	render: function () {
		console.log('render tabular-body-wrapper')
		var view = this.props.view
		var model = this.props.model
		var store = this.props.store
		var rowCount = store.getRecordCount()
		var geo = view.data.geometry

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


		if (!this.state.initialFetchComplete) 
			return null

		return <div
			className = {`tabular-body-wrapper force-layer`}
			ref="tbodyWrapper"
			style = {{
				left: 0,
				width: (adjustedWidth + 3) + 'px',
				transformStyle: 'preserve-3d',
				zIndex: 5,
        		// transform: 'translateZ(5)'
			}}>
			
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
				ref = "lhsTableBody"
				style = {{
					top: geo.headerHeight + 'px',
					borderRight: "3px solid " + constant.colors.RED_BRIGHT_TRANS,
					// transform: 'translateZ(1px)',
					overflow: 'hidden',
				}}>
				<div className = "wrapper force-layer"
					ref = "lhsOffsetter"
					style = {{
						top: '1px',
						height: (rowCount * geo.rowHeight) + 'px',
						marginTop: HAS_3D ? 0 : (marginTop + 2 + 'px'),
						transform: 'translate3d(0, ' + marginTop + 'px, 1px)',
						transition: IS_CHROME ? 'transform 75ms linear' : null
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
						height: (rowCount * geo.rowHeight) + 'px'
					}}
					columns = {view.data.fixedCols}/>
				</div>
			</div>
			{/*END LHS TABLE BODY*/}

			{/*LHS HEADER*/}
			<TableHeader {...this.props}
				ref = "lhsHead"
				totalWidth = {fixedWidth +  geo.labelWidth + 1}
				leftOffset = {0}
				side = {'lhs'}
				hasRowLabel = {true}
				columns = {view.data.fixedCols} />
			{/*END LHS HEADER*/}
			</div>
			{/*LHS OUTER*/}
			


			{/*RHS OUTER*/}
			<div className = "wrapper rhs-h-scroll-outer--focused"
				ref = "rhsTableBody"
				style = {{
					top: 0,
					bottom: 0,
					left: (view.data.fixedWidth + geo.labelWidth) + 'px',
					width:  view.data.floatWidth + geo.colAddWidth + 'px',
					// transform: 'translateZ(1px)',
					overflow: 'hidden'
				}}>
				<div className = "rhs-h-scroll wrapper force-layer"
					ref = "rhsHorizontalOffsetter"
					style = {{
						marginLeft: (-1 * this.props.hiddenColWidth - 1) + 'px',
						transition: 'margin-left 75ms linear'
						// use marginLeft instead of translate here because translate will clobber the other offset
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
					<div className = "wrapper"
						ref = "rhsOffsetter"
						style = {{
							top: '1px',
							left: 0,
							right: 0,
							marginTop: HAS_3D ? 0 : (marginTop + 2 + 'px'),
							transform: 'translateY(' + marginTop + 'px)',
							transition: IS_CHROME ? 'transform 75ms linear' : null,
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
								width:  view.data.floatWidth + 1  + 'px',
								height: (rowCount * geo.rowHeight) + 'px',
							}} />
					</div>

					</div>
					<TableHeader {...this.props}
						ref = "rhsHead"
						totalWidth = {floatWidth + 2}
						leftOffset = {0}
						side = "rhs"
						columns = {view.data.floatCols} />
				</div>

			</div>
			
			
		</div>;
	}
});


export default TabularBodyWrapper
