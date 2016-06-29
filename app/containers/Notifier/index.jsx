import React from "react";
import { RouteHandler } from "react-router";
import moment from "moment";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"
import NotificationStore from "../../stores/NotificationStore"
import TransactionStore from "../../stores/TransactionStore"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import util from '../../util/util'

import Note from './Note'

var HIDE_TIMER = 250;

var Notifier = React.createClass({

	getInitialState: function () {
		return {
			mouseOver: false,
		}
	},

	// LIFECYCLE ==============================================================

	componentWillMount: function () {
		NotificationStore.addChangeListener(this._onChange);
		TransactionStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function () {
		NotificationStore.removeChangeListener(this._onChange);
		TransactionStore.removeChangeListener(this._onChange);
	},

	componentDidUpdate: function () {

	},

	_onChange: function () {
		this.forceUpdate();
	},

	// HANDLERS ================================================================

	handleMouseOver: function () {
		if (this._timer) {
			window.clearTimeout(this._timer);
			this._timer = null;
		}
		this.setState({mouseOver: true});
	},

	handleMouseOut: function () {
		if(!this._timer) this._timer = window.setTimeout(this.handleHide, HIDE_TIMER)
	},

	handleHide: function () {
		this.setState({mouseOver: false});
	},

	// RENDER =================================================================

	render: function() {
		var _this = this;
		var notifications = NotificationStore.query({}); 
		var transactions = TransactionStore.query(this.state.mouseOver ? null : {status: 'active'});
		transactions = transactions.slice(transactions.length - (this.state.mouseOver ? 7 : 1))
		var events = util.merge({attribute: 'timestamp', descending: true}, null, notifications, transactions)

		return <div style = {{cursorEvents: 'none'}} >
		<span className = "	 icon icon-wifi"/>
		<span className = {(this.state.mouseOver ? "notifier-icon-active" : "notifier-icon") + " icon icon-book2"} style = {{cursorEvents: 'auto'}} 
			onMouseOver = {this.handleMouseOver}
			onMouseOut = {this.handleMouseOut} />
		<ReactCSSTransitionGroup
			transitionEnterTimeout = {500} transitionLeaveTimeout = {300}
			component="ul" className="notifier" transitionName="fade-in">
			{
			events.map(function (note, idx) {
				return <Note 
					_handleMouseOver = {_this.handleMouseOver} 
					key = {note.actionCid || note.notification_key} 
					note = {note} 
					index = {idx} />;
			})
			}
			{
			(events.length === 0 && this.state.mouseOver)  ? 
				<li className="info"
					key= "no-notifications"
					style={{zIndex: 1, cursorEvents: 'auto', top: '-70px'}}
					onMouseOver = {_this.handleMouseOver}
					onMouseOut = {_this.handleMouseOut}>
					<p><span className = "icon icon-notification"/> No notifications to show</p>
				</li> : null
			}
		</ReactCSSTransitionGroup></div>;
	}
})

export default Notifier
