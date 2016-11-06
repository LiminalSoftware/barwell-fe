import React from "react";
import { RouteHandler } from "react-router";
import moment from "moment";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"
import NotificationStore from "../../stores/NotificationStore"
import ModelStore from '../../stores/ModelStore'
import TransactionStore from "../../stores/TransactionStore"
import util from '../../util/util'
import PopDownMenu from '../../components/PopDownMenu'
import constants from "../../constants/MetasheetConstants"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import Note from './Note'

var HIDE_TIMEOUT = 250;
var PREVIEW_TIMEOUT = 4000;

var Notifier = React.createClass({

	// LIFECYCLE ==============================================================
	
	getInitialState: function () {
		return {
			mouseOver: false,
			showPreview: true
		}
	},

	componentWillMount: function () {
		NotificationStore.addChangeListener(this._onChange);
		TransactionStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function () {
		clearTimeout(this._previewTimer)
		clearTimeout(this._mouseOutTimer)
		NotificationStore.removeChangeListener(this._onChange);
		TransactionStore.removeChangeListener(this._onChange);
	},

	componentDidUpdate: function () {
		this._previewTimer = setTimeout(this._onChange, PREVIEW_TIMEOUT)
	},

	_onChange: function () {
		this.forceUpdate();
	},

	// HANDLERS ================================================================

	handleMouseOver: function () {
		if (this._mouseOutTimer) {
			window.clearTimeout(this._mouseOutTimer);
			this._mouseOutTimer = null;
		}
		this.setState({mouseOver: true});
	},

	handleMouseOut: function () {
		if(!this._mouseOutTimer) this._mouseOutTimer = window.setTimeout(this.handleHide, HIDE_TIMEOUT)
	},

	handleHide: function () {
		this.setState({mouseOver: false});
	},

	handleTogglePreview: function () {
		this.setState({showPreview: !this.state.showPreview})
	},

	// RENDER =================================================================

	render: function() {
		var _this = this;
		var cutoff = moment(Date.now()).subtract(3, 'seconds')
		var notifications = (this.state.mouseOver || this.state.showPreview) ? NotificationStore.query({}) : []; 
		var transactions = TransactionStore.query({});
		var events
		const style = {cursor: 'pointer', position: "absolute", bottom: 0, left: 0, right: 0, height: 0}

		if (this.state.mouseOver) transactions
		else transactions = transactions.filter(txn => moment(txn.timestamp).isAfter(cutoff))

		transactions = transactions.slice(transactions.length - (this.state.mouseOver ? 10 : 1))
		events = util.merge({attribute: 'timestamp', descending: true}, null, notifications, transactions)

		return <ReactCSSTransitionGroup 
			className = "notification-bar"
			style = {style}
			{...constants.transitions.fadein}
			component = "span"
			onMouseOver = {this.handleMouseOver}
			onMouseOut = {this.handleMouseOut}>
			{
			events.length === 0 && !this.state.mouseOver ? null :
			<div className = "pop-up-menu" 
				style = {{
					left: 'auto', 
					right: 0,
					cursor: 'pointer',
					minWidth: '300px'
				}}>
			{
			events.map(function (note, idx) {
				return <Note 
					_handleMouseOver = {_this.handleMouseOver} 
					key = {note.cid || note.notification_key} 
					model = {ModelStore.get(note.model_id)}
					note = {note} 
					index = {idx} />;
			})
			}
			{
			(events.length === 0 && this.state.mouseOver)  ? 
				<div className="note-item note-info" key = "no-notifications">
					<span className = "note-left-column" style = {{lineHeight: '25px'}}>
						<span className = "icon icon-notification"/>
					</span>
					<span className = "note-middle-column" style = {{lineHeight: '25px'}}>
						No notifications to show
					</span>
					<span className = "note-right-column"/>
				</div> : null
			}
			{
			this.state.mouseOver ?
			<div className = "note-item" onClick={this.handleTogglePreview} key = "preview-toggle">
				<span className = "note-left-column" style = {{lineHeight: '25px'}}>
				<input type="checkbox"
					checked={this.state.showPreview}
					onChange={this.handleTogglePreview}/>
				</span>
				<span className = "note-middle-column" style = {{lineHeight: '25px'}}>
					Show preview of latest item
				</span>
				<span className = "note-right-column"/>
			</div>
			:
			null
			}
		</div>
		}
		</ReactCSSTransitionGroup>;
	}
})

export default Notifier
