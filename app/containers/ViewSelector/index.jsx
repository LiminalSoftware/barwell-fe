import React from "react"
import ViewStore from "../../stores/ViewStore"
import styles from "./style.less"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import PureRenderMixin from 'react-addons-pure-render-mixin';
import blurOnClickMixin from '../../blurOnClickMixin'

import ViewItem from './ViewItem'
import ViewList from './ViewList'

var ViewSelector = React.createClass({

	mixins: [PureRenderMixin, blurOnClickMixin],

	getInitialState: function () {
		return {open: false}
	},

	render: function() {
    var model = this.props.model
    var view = this.props.view
		if (!model) return null

		return <div className = "header-section ">
			<div className="header-label">View Selector</div>
			<div className="model-views-menu" onClick = {this.clickTrap}>
				<div className="model-views-menu-inner" onClick = {this.handleOpen}>
					<ViewItem {...this.props} singleton = {true} className="inline"/>
				</div>
				{this.state.open ? <ViewList {...this.props}/> : null}
				<div className="dropdown small grayed icon icon-chevron-down"
					onClick = {this.handleOpen}></div>
			</div>

		</div>
	}
});


export default ViewSelector
