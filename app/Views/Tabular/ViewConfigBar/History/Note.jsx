import React from "react";
import moment from "moment";

import modelActionCreators from "../../../../actions/modelActionCreators"

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import util from '../../../../util/util'

var HIDE_TIMER = 250;

var Note = React.createClass({

	render: function() {
		var note = this.props.note;
		var idx = this.props.index;
		var model = this.props.model
		var substitutions = model ? {
			'${model}': model.model
		} : {}
		var narrative = note.narrative

		return <div className = {'note-item note-' + note.type + " pop-down-item"}
			key = {note.cid || note.notification_key || note.action_id}
			style = {{zIndex: note.notificationId, cursorEvents: 'auto', top: (-70 * (idx + 1)) + 'px'}}>
			<span className = {note.notification_key ? "note-short-left-column" : "note-left-column"}>
				<span className={'icon ' + note.icon}/>
			</span>
			<span className = "note-middle-column">
				<p className = "">[{note.action_id || note.cid}] {narrative}</p>
				
				{note.notification_key ? null :
				<p className = "" style = {{fontStyle: 'italic'}}>
					{
					note.action_id ? 
					moment(note.timestamp).fromNow()
					: note.statusMessage ? note.statusMessage
					: 'Syncing to server...'
					}
				</p>
				}
			</span>
			{
			note.action_id ? 
			<span 
				className = {note.notification_key ? "note-short-right-column" : "note-right-column"}
				onClick = {util.clickTrap}>
				<span className = 'icon icon-undo'/> Undo
			</span>
			: 
			<span className = "note-right-column"/>
			}
		</div>
	}
})

export default Note


