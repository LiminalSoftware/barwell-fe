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

const HIDE_TIMEOUT = 50;
const CUTOFF = 3
const PREVIEW_TIMEOUT = 5000;


const Notifier = React.createClass({

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
		if (this._previewTimer) clearTimeout(this._onChange)
		this._previewTimer = setTimeout(this._onChange, PREVIEW_TIMEOUT)
	},

	_onChange: function () {
		this.forceUpdate()
	},

	// HANDLERS ================================================================

	handleMouseOver: function () {
		// if (this._mouseOutTimer) {
		// 	window.clearTimeout(this._mouseOutTimer);
		// 	this._mouseOutTimer = null;
		// }
		// this.setState({mouseOver: true});
	},

	handleMouseOut: function () {
		// if(!this._mouseOutTimer) this._mouseOutTimer = window.setTimeout(this.handleHide, HIDE_TIMEOUT)
	},

	handleHide: function () {
		this.setState({mouseOver: false});
	},

	handleTogglePreview: function () {
		this.setState({showPreview: !this.state.showPreview})
	},

	getEvents: function () {
		var cutoff = moment(Date.now()).subtract(CUTOFF, 'seconds')
		var notifications = (this.state.mouseOver || this.state.showPreview) ? NotificationStore.query({}) : []; 
		var transactions = TransactionStore.query({}).filter(txn => !txn.hiddenTxn);
		transactions = transactions.slice(transactions.length - 5)
		if (this.state.mouseOver) transactions
		else transactions = transactions.filter(txn => moment(txn.timestamp).isAfter(cutoff))

		let events = util.merge({attribute: 'timestamp', descending: true}, null, notifications, transactions)

		

		return events
	},

	// RENDER =================================================================

	render: function() {
		var _this = this;
		
		
		const events = this.getEvents()
		const style = {
			cursor: 'pointer', 
			position: "absolute", 
			bottom: 120, 
			right: 20,
			height: 0,
			width: 300,
		}

		

		return <ReactCSSTransitionGroup 
			className = "notification-bar"
			style = {style}
			{...constants.transitions.slideup}
			component = "span"
			onMouseOver = {this.handleMouseOver}
			onMouseOut = {this.handleMouseOut}>
			

			{
			events.map(function (note, idx) {
				return <Note 
					_handleMouseOver = {_this.handleMouseOver} 
					key = {note.cid || note.notification_key || note.transaction_id} 
					model = {ModelStore.get(note.model_id)}
					note = {note}
					index = {idx} />;
			})
			}
			
		
		</ReactCSSTransitionGroup>;
	}
})

export default Notifier
