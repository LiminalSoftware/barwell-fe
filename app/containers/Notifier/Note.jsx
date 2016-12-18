import React from "react";
import { RouteHandler } from "react-router";
import moment from "moment";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"
import NotificationStore from "../../stores/NotificationStore"
import TransactionStore from "../../stores/TransactionStore"
import util from '../../util/util'

var HIDE_TIMER = 250;

var Note = React.createClass({

	render: function() {
		var note = this.props.note;
		var index = this.props.index;
		var model = this.props.model || {}
		const modelName = model.model || ''
		const pluralName = model.plural || ''
		var narrative = (note.copy || note.narrative)
		// .replace('${model}', modelName).replace('${plural}', pluralName)



		return <div className = {'note-item note-' + note.type + " "}
			key = {note.cid || note.notification_key || note.action_id}
			style = {{zIndex: note.notificationId, cursorEvents: 'auto', top: (-55 * index)}}>
			<span className = {note.notification_key ? "note-short-left-column" : "note-left-column"}>
				<span className={'icon ' + note.icon}/>
			</span>
			<span className = "note-middle-column">
				<p className = "">{narrative}</p>
				
				{note.notification_key ? null :
				<p className = "" >
					{
					note.action_id ? 
					moment(note.timestamp).fromNow()
					: note.statusMessage ? note.statusMessage
					: 'Syncing to server...'
					}
					[{note.action_id || note.cid}]
					{
					note.action_id ? 
					<span className = "undo-button" onClick = {util.clickTrap}>
						UNDO
					</span>
					: 
					<span className = "note-right-column"/>
					}
				</p>
				}
			</span>
			
		</div>
	}
})

export default Note


