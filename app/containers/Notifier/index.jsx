import React from "react";
import { RouteHandler } from "react-router";
import moment from "moment";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"
import NotificationStore from "../../stores/NotificationStore"
import TransactionStore from "../../stores/TransactionStore"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import util from '../../util/util'
import PopDownMenu from '../../components/PopDownMenu'

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

		if (this.state.mouseOver) transactions.slice(transactions.length - 10)
		else transactions = transactions.filter(txn => moment(txn.timestamp).isAfter(cutoff))

		events = util.merge({attribute: 'timestamp', descending: true}, null, notifications, transactions)

		return <span className = "model-bar-extra--right height-transition"
			style = {{cursor: 'pointer'}}
			onMouseOver = {this.handleMouseOver}
			onMouseOut = {this.handleMouseOut}>
			<a onClick = {this.handleShowHistory} className = "icon icon-history2" />
			{
			events.length === 0 && !this.state.mouseOver ? null :
			<div className = "pop-up-menu" 
				style = {{
					left: 'auto', 
					right: 0,
					cursor: 'pointer',
					minWidth: '300px'
				}}>
				<span className = "pop-up-pointer-outer " style = {{left: 'auto',right: '20px'}}/>
	          	<span className = "pop-up-pointer-inner " style = {{left: 'auto',right: '20px'}}/>
			{
			events.map(function (note, idx) {
				return <Note 
					_handleMouseOver = {_this.handleMouseOver} 
					key = {note.cid || note.notification_key} 
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
		</span>;
	}
})

export default Notifier
