import React from "react"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
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
		<div className="header-label">Views</div>
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
				
				{this.state.open ? 
					<ViewList {...this.props}/> 
					: 
					<ViewItem {...this.props} key = {model.model_id + '-' + (view ? view.view_id : 'null')} 
						singleton = {true}/>
				}
			</ReactCSSTransitionGroup>
			
			<div className="dropdown small grayed icon icon-chevron-down"
				onClick = {this.handleOpen}></div>
		</div>

	</div>
	}
});


export default ViewSelector
