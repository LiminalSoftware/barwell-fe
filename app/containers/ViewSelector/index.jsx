import React from "react"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ViewStore from "../../stores/ViewStore"
import styles from "./style.less"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"

import ModelConfigStore from "../../stores/ModelConfigStore";

import PureRenderMixin from 'react-addons-pure-render-mixin';
import blurOnClickMixin from '../../blurOnClickMixin'

import ViewItemSingleton from './ViewItemSingleton'
import ViewMenu from './ViewMenu'

var ViewSelector = React.createClass({

	mixins: [PureRenderMixin, blurOnClickMixin],
	
	getInitialState: function () {
		return {open: false}
	},

	render: function() {
	    var model = this.props.model;
	    var view = (this.props.view || {});
		if (!model) return null

		return <div className = "header-section ">
		<div className="header-label">Metaphors</div>
		<div className="model-views-menu" onClick = {this.clickTrap}>
			<ReactCSSTransitionGroup 
				component = "div"
				onClick={this.handleOpen}
				className="model-views-menu-inner"
				transitionName="fade-in" 
				transitionAppear={true}
				transitionEnterTimeout={500}
				transitionLeaveTimeout={500}
				transitionAppearTimeout={500}>
				
				{
					this.state.open ? 
					<ViewMenu {...this.props}  _blurMenu = {this.handleBlur} key = "menu" /> 
					: 
					<ViewItemSingleton {...this.props} suppressHilite = {true} key = "singleton" />
				}
			</ReactCSSTransitionGroup>
			
			<div className="dropdown icon icon--small icon-chevron-down"
				onClick = {this.handleOpen}></div>
		</div>
		</div>
	}
});


export default ViewSelector
