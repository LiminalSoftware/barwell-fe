import React from "react";
import { RouteHandler } from "react-router";
import moment from "moment";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"
import NotificationStore from "../../stores/NotificationStore"
import TransactionStore from "../../stores/TransactionStore"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import util from '../../util/util'

var HIDE_TIMER = 250;

var Note = React.createClass({

	render: function() {
		var note = this.props.note;
		var idx = this.props.index
		return <li className = {note.type}
			key = {note.cid || note.notification_key || note.transaction_id}
			style = {{zIndex: note.notificationId, cursorEvents: 'auto', top: (-70 * (idx + 1)) + 'px'}}>
			<span style = {{lineHeight: '30px', padding: '0 10px'}}>
				<span className={'icon ' + note.icon}/>
			</span>
			<span style = {{flexGrow: 2, textAlign: 'left'}}>
				<p className = "">{note.copy}</p>
				
				<p className = "" style = {{fontStyle: 'italic'}}>
					{
					note.action_id ? 
					moment(note.timestamp).fromNow()
					: note.statusMessage ? note.statusMessage
					: ''
					}
				</p>
			</span>
			{note.action_id ? <a style = {{flex: 1, flexGrow: 1, cursor: 'pointer'}} onClick = {util.clickTrap}>
				<p><span className = 'icon icon-undo'/> Undo</p>
			</a> 
			: null
			}
		</li>
	}
})

export default Note


