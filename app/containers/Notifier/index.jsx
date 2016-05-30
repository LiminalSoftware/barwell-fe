import React from "react";
import { RouteHandler } from "react-router";
import moment from "moment";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"
import NotificationStore from "../../stores/NotificationStore"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

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
	},

	componentWillUnmount: function () {
		NotificationStore.removeChangeListener(this._onChange);
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
		this._timer = window.setTimeout(this.handleHide, HIDE_TIMER)
	},

	handleHide: function () {
		this.setState({mouseOver: false});
	},

	// RENDER =================================================================

	render: function() {
		var _this = this;
		var notifications = this.state.mouseOver ? 
			NotificationStore.query({}) : 
			NotificationStore.query({status: 'active'});

		return <div style = {{cursorEvents: 'none'}} >
		<span className = {(this.state.mouseOver ? "notifier-icon-invert" : "notifier-icon") + " icon icon-book2"} style = {{cursorEvents: 'auto'}} 
			onMouseOver = {this.handleMouseOver}
			onMouseOut = {this.handleMouseOut}/>
		<ReactCSSTransitionGroup
			transitionEnterTimeout={500} transitionLeaveTimeout={300}
			component="ul" className="notifier" transitionName="fade-in">
			{
			notifications.map(function (note) {
				return <li className={note.type} 
					key={note.notification_key} 
					style={{zIndex: note.notificationId, cursorEvents: 'auto'}}
					onMouseOver = {_this.handleMouseOver}
					onMouseOut = {_this.handleMouseOut}>
					<span>
						<span className={'icon ' + note.icon}/>
					</span>
					<span>
						<p>{note.copy}</p>
						{note.status !== 'active' ? <p>{moment(note.timestamp).fromNow()}</p> : null}
					</span>
				</li>
			})
			}
			{
			(notifications.length === 0 && this.state.mouseOver)  ? 
				<li className="info"
					key= "no-notifications"
					style={{zIndex: 1, cursorEvents: 'auto'}}
					onMouseOver = {_this.handleMouseOver}
					onMouseOut = {_this.handleMouseOut}>
					<p><span className = "icon icon-notification"/> No notifications to show</p>
				</li> : null
			}
		</ReactCSSTransitionGroup></div>;
	}
})

export default Notifier
