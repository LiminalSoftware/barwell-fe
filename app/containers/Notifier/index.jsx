import React from "react";
import { RouteHandler } from "react-router";
import SideBar from "containers/SideBar";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"
import NotificationStore from "../../stores/NotificationStore"
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Notifier = React.createClass({
	componentWillMount: function () {
		NotificationStore.addChangeListener(this._onChange)
	},

	componentWillUnmount: function () {
		NotificationStore.removeChangeListener(this._onChange)
	},

	_onChange: function () {
		this.forceUpdate()
	},

	render: function() {
		var notifications = NotificationStore.getNotifications();

		return <ReactCSSTransitionGroup component="ul" className="notifier" transitionName="flip">{
				notifications.map(function (note) {
					var iconName;
					switch(note.type) {
					case "error":
							iconName = 'icon-warning';
							break;
					}

					return <li className={note.type} key={note.notificationId} style={{zIndex: note.notificationId}}>
						<h3><span className={'icon ' + iconName}></span> {note.header}</h3>
						<p>{note.copy}</p>
					</li>
				})
		}</ReactCSSTransitionGroup>;
	}
})

export default Notifier