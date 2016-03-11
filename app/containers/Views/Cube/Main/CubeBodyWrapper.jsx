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

import util from '../../../../util/util'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

var OFFSET_TOLERANCE = 100
var WINDOW_ROWS = 50
var FETCH_DEBOUNCE = 500
var MAX_LEVELS = 5000
var RHS_PADDING = 100
var CYCLE = 60

var HAS_3D = util.has3d()


var CubeBodyWrapper = React.createClass ({

	_lastFetch: 0,
	_lastPaint: 0,

	getInitialState: function () {
		var view = this.props.view
		var geo = view.data.geometry
		return {
			
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
		this.debounceFetch = _.debounce(this.fetch, FETCH_DEBOUNCE)
		this.fetchRows()
	},

	componentWillUpdate: function (nextProps, nextState) {
		// var renderSide = this.state.renderSide === 'lhs' ? 'rhs' : 'lhs';
		// // if (this.__timer) clearTimeout(this.__timer);
		// this.debounceFetch(false, nextProps, nextState);
		// this.setState({
		// 	renderSide: renderSide,
		// 	frameNum: this.state.frameNum + 1
		// });
	},

	componentWillReceiveProps: function (nextProps) {
		this.debounceFetch(false, nextProps);
	},

	finishFetch: function () {
		this.setState({
			fetchingRows: false
		})
	},

	fetchColumns: function () {

	},

	fetchRows: function () {
		var view = this.props.view
		this.setState({fetchingRows: true})
		modelActionCreators.fetchLevels(
			view,
			'rows',
			MAX_LEVELS
		).then(function () {
			_this.setState({
				fetchingRows: false
			})
		})
	},

	fetch: function (force, nextProps, nextState) {
		var _this = this
		var view = this.props.view
		
	},

	render: function () {
		var view = this.props.view
		var model = this.props.model
		var store = this.props.store
		var geo = view.data.geometry
		var focused = this.props.focused

		// console.log('render wrapper')
		
		return <div className = {"tabular-body-wrapper force-layer " + (focused ? "focused" : "blurred")}
			ref="tbodyWrapper">
		</div>;
	}
});


export default CubeBodyWrapper
