import React from "react";
import { RouteHandler } from "react-router";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"
import NotificationStore from "../../stores/NotificationStore"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

var Notifier = React.createClass({

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

	// RENDER =================================================================

	render: function() {
		var notifications = NotificationStore.query();

		return <ReactCSSTransitionGroup
			transitionEnterTimeout={500} transitionLeaveTimeout={300}
			component="ul" className="notifier" transitionName="fade-in">{
				notifications.map(function (note) {
					return <li className={note.type} key={note.notification_key} style={{zIndex: note.notificationId}}>
						<span className={'icon ' + note.icon}/>{note.copy}
					</li>
				})
		}</ReactCSSTransitionGroup>;
	}
})

export default Notifier
