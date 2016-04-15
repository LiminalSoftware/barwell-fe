import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

import constants from '../../../../constants/MetasheetConstants'

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

const FETCH_DEBOUNCE = 1000

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

	shouldComponentUpdate: function (newProps) {
		return newProps.view !== this.props.view
		// return false;
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
		this.fetch()
	},

	componentWillReceiveProps: function (nextProps) {
		this.debounceFetch(false, nextProps);
	},

	fetch: function () {
		var _this = this
		var view = this.props.view

		if (view._dirty) return;

		return Promise.all([
			this.fetchLevels('row'),
			this.fetchLevels('column')
		]).then(function () {
			return _this.fetchBody()
		});
	},

	fetchLevels: function (dimension) {
		var store = this.props.store
		var view = this.props.view
		var _this = this
		var aggregates = view[dimension + '_aggregates']

		if (aggregates.length === 0 || _.isEqual(store.getDimensions(dimension), aggregates)){
			return Promise.resolve()
		}
		this.setState({
			[dimension + '_fetching']: true
		})
		
		return modelActionCreators.fetchLevels(
			view,
			dimension,
			0, MAX_LEVELS
		).then(function () {
			_this.setState({
				[dimension + '_fetching']: false
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
		var rowAggregates = store.getDimensions('row')
		var columnAggregates = store.getDimensions('row')

		
		if (!(rowAggregates.length + columnAggregates.length > 0)) return Promise.resolve();
		if (store.isCurrent('body')) return Promise.resolve();
		
		return modelActionCreators.fetchCubeValues(view, store, hOffset, WINDOW_ROWS, vOffset, WINDOW_COLS).then(function () {
			store.setStart('row', vOffset)
			store.setStart('column', hOffset)
		})
	},

	render: function () {
		var view = this.props.view
		var model = this.props.model
		var store = this.props.store
		var geo = view.data.geometry
		var focused = this.props.focused
		var marginTop = 0
		var numCols = store.getCount('column');
		var numRows = store.getCount('row');

		var rowOffset = this.props.rowOffset
		var colOffset = this.props.hiddenColWidth
		
		return <div
			className = {"wrapper force-layer " + (focused ? "focused" : "blurred")}
			ref="tbodyWrapper"
			style = {{
				left: 0,
				width: (this.props.adjustedWidth + 3) + 'px',
				transformStyle: 'preserve-3d'
			}}>

			{/* ROW HEADERS */}
			<div className = "wrapper outer-table-wrapper "
				style = {{
					top: this.props.columnHeaderHeight + 'px',
					transform: 'translateZ(1px)',
					overflow: 'hidden',
					position: 'absolute'
				}}>
				<div className = "wrapper force-layer"
					ref = "rowHeaderOffsetter"
					style = {{
						top: 0,
						height: (numRows * geo.rowHeight) + 'px',
						marginTop: HAS_3D ? 0 : (marginTop + 2 + 'px'),
						transform: 'translateZ(0) translateY(' + marginTop + 'px)'
					}}>
					<CubeTHead {...this.props}
						dimension = {'row'}
						store = {store}
						focused = {focused}
						groups = {this.props.rowHeaders} />
				</div>
			</div>
			{/*END ROW HEADERS*/}

			{/*ROW HEADER HEADERS :) */}
			<TabularTHead
				ref = "lhsHead"
				totalWidth = {this.props.rowHeaderWidth}
				leftOffset = {0}
				side = {'lhs'}
				hasRowLabel = {false}
				columns = {this.props.rowHeaders}
				focused = {focused}
				height = {this.props.columnHeaderHeight}
				view = {view} />
			{/*END ROW HEADER HEADERS*/}
			
			{/*RHS OUTER*/}
			<div className = {"wrapper " + " rhs-h-scroll-outer--" + (focused ? "focused" : "blurred")}
				style = {{
					top: 0,
					bottom: 0,
					left: this.props.rowHeaderWidth + 'px',
					marginLeft: '-1px',
					width:  this.props.bodyWidth + 'px',
					transform: 'translateZ(1px)',
					overflow: 'hidden',
				}}>

				<div className = "rhs-h-scroll wrapper force-layer"
					ref = "rhsHorizontalOffsetter"
					style = {{
						
					}}>

					{/*RHS TABLE BODY WRAPPER*/}
					
					<CubeTHead {...this.props}
						style = {{
							top: 0,
							height: this.props.columnHeaderHeight + 'px',
							left: 0,
							right: 0,
							transform: 'translateZ(2px)'
						}}
						dimension = 'column'
						store = {store}
						groups = {this.props.columnHeaders} />
					
					<div className = "wrapper body-container"
						ref = "bodyContainer"
						style = {{
							left: 0,
							top: this.props.columnHeaderHeight + 'px',
							right: 0,
							bottom: 0,
							overflow: 'hidden'
						}}>
						<div className = "wrapper body-offsetter"
							ref = "bodyOffsetter"
							style = {{
								left: 0,
								top: 0,
								width: (this.props.bodyWidth) + 'px',
								bottom: 0,
								marginTop: HAS_3D ? 0 : (this.props.vOffset + 2 + 'px'),
								transform: 'translate3d(0, ' + this.props.vOffset + 'px, 0)',
								marginLeft: HAS_3D ? 0 :(-1 * this.props.hOffset - 1) + 'px',
								transform: 'translate3d(' + (-1 * this.props.hOffset - 1) + 'px, 0, 0)',
							}}>
						{
						view.value ?
						<CubeTBody
							{...this.props}
							verticalOffset = {0}
							horizontalOffset = {0}/>
						: null
						}
					</div>
					</div>
					
				</div>
			</div>
		</div>;
	}
});


export default CubeBodyWrapper
