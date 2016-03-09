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
var CYCLE = 60

var HAS_3D = util.has3d()

import RowResizer from "./RowResizer"

var TabularBodyWrapper = React.createClass ({

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
		this.fetch(true)
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

	},

	render: function () {
		var view = this.props.view
		var model = this.props.model
		var store = this.props.store
		var geo = view.data.geometry
		var focused = this.props.focused

		// console.log('render wrapper')
		
		return <div
			className = {"tabular-body-wrapper force-layer " + (focused ? "focused" : "blurred")}
			ref="tbodyWrapper"
			style = {{
				left: 0,
				width: (adjustedWidth + 3) + 'px',
				transformStyle: 'preserve-3d'
			}}>
			
			
		</div>;
	}
});


export default CubeBodyWrapper
