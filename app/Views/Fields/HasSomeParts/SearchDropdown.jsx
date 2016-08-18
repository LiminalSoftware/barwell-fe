import React from "react"
import _ from "underscore"

import styles from "./searchDropdown.less"

import AttributeStore from "../../../stores/AttributeStore"
import RelationStore from "../../../stores/RelationStore"
import ModelStore from "../../../stores/ModelStore"

import util from "../../../util/util"
import constants from "../../../constants/MetasheetConstants"

import modelActionCreators from "../../../actions/modelActionCreators"

var SEARCH_DEBOUNCE = 50;
var SEARCH_RECORD_COUNT = 50;
var SEARCH_RECORDS_VISIBLE = 10

const magnifierStyle = {
	position: "absolute", 
	right: 0, 
	width: '18px',
	top: 0, 
	bottom: 0, 
	zIndex: 20, 
	lineHeight: "30px",
	color: constants.colors.GREEN_1
}

var SearchDropdown = React.createClass({

	componentWillMount: function () {
		this._debounceSearch = _.debounce(this.search, SEARCH_DEBOUNCE)
		this.search()
	},

	componentDidMount: function () {
		const _this = this
		setTimeout(() => _this.setState({expanded: true}), 0)
	},

	getNumberOptions: function () {
		const {expanded, count, filteredRecords, searching, searchTerm} = this.state
		if (!expanded) return 0
		return Math.min(filteredRecords.length || 1, SEARCH_RECORDS_VISIBLE) + 
			(count > SEARCH_RECORDS_VISIBLE ? 2 : 1) + 
			(searchTerm.length > 0 ? 1 : 0)
	},

	getInitialState: function () {
		return {
			searchTerm: '',
			fetchedTerm: '',
			searchRecords: [],
			filteredRecords: [],
			selection: -1,
			count: 0,
			searching: false,
			expanded: false,
			offset: 0,
			page: 0,
			limit: SEARCH_RECORD_COUNT
		}
	},

	updateSearchValue: function (e) {
		var val = e.target.value
		this.setState({searchTerm: val})
		this._debounceSearch()
	},

	search: function () {
		var _this = this
		var config = this.props.config || {}
		var term = this.state.searchTerm.toLowerCase()
		var fetchedTerm = this.state.fetchedTerm

		// bailout if the search term is too short, or we already queried
		// if (term.length < 3 || this.state.searching) return;

		// also bail out if its a subset of the old term (we can filter client-side)
		if (fetchedTerm && term.indexOf(fetchedTerm) >= 0
			&& this.state.count < this.state.limit) {
			this.filterResults();
			return;
		}

		// set the state to indicate searching
		this.setState({searching: true, fetchedTerm: term});
		return modelActionCreators.fetchSearchRecords(
			this.props.config.relation_id, 
			config.label,
			term,
			this.state.offset,
			this.state.limit
		).then(function (results) {
			// update state with the results
			results.searching = false;
			_this.setState(results);
			_this.filterResults(results.searchRecords);
		});
	},

	filterResults: function (_searchRecords) {
		var config = this.props.config;
		var searchRecords = _searchRecords || this.state.searchRecords;
		var term = this.state.searchTerm.toLowerCase()
		var filteredRecords = searchRecords.filter(
			rec => (rec[config.label] || '').toLowerCase().indexOf(term) >= 0
		).slice(this.state.page * SEARCH_RECORDS_VISIBLE, SEARCH_RECORDS_VISIBLE);
		this.setState({filteredRecords: filteredRecords})
	},

	selectItem: function (num) {
		this.setState({selection: num});
	},

	chooseItem: function (num) {
		var index = this.state.page * SEARCH_RECORDS_VISIBLE + num;
		var obj = this.state.searchRecords[num];
		this.props.commit(obj);
		this.props.blurSelf();
	},

	chooseSelection: function (e) {
		var selection = this.state.selection;
		var index = this.state.page * SEARCH_RECORDS_VISIBLE + selection;
		var obj;

		// if (selection < 0 && e.ctrlKey) this.createNewItem(); 
		if (selection < 0) return;
		obj = this.state.searchRecords[index];
		this.props.commit(obj);
	},

	// createNewItem: function () {
	// 	console.log("create new item")
	// 	var config = this.props.config
	// 	var model = ModelStore.get(config.related_model_id);
	// 	var label = config.label;
	// 	var obj = {[label]: this.state.searchTerm};
	// 	modelActionCreators.insertRecord(model, obj, 0).then(this.commit);
	// },

	shouldOpenDown: function () {
		return this.props.spaceBottom > 5 
			&& (this.props.spaceBottom > this.props.spaceTop)
	},

	handleContext: function (e) {
		util.clickTrap(e)
	},

	render: function () {
		var _this = this
		var model = this.props.model;
		var config = this.props.config;
		var shouldOpenDown = this.shouldOpenDown()
		var relation = RelationStore.get(config.relation_id);
		var oppModel = ModelStore.get(relation.related_model_id);
		var searchTerm = this.state.searchTerm.toLowerCase();
		var filteredRecords = this.state.filteredRecords
		var showMoreIdx = this.getNumberOptions() - 2
		var addOneIdx = this.getNumberOptions() - 1
		var height = 35 * this.getNumberOptions()

		return <div className="pop-down-menu search-menu" 
			onContextMenu = {this.handleContext}
			style = {{
				opacity: this.state.expanded ? 1 : 0.01,
				maxHeight: height,
				minHeight: height,
				left: 1,
				right: 1,
				top: 1,
			}}>
          	
			<div key = "search-li" className = {"popdown-item "}
				style = {{height: '30px', position: 'relative'}}>
				<div style={{position: "absolute", left: 0, right: 20, top: 0, bottom: 0}}>
					<input className = "input-editor" autoFocus
						style={{borderRadius: "3px"}}
						onChange = {this.updateSearchValue}
						value = {this.searchTerm}/>
				</div>
				{
				this.state.loading ? 
				<span className = "icon icon-loading2 rotate" style = {magnifierStyle}/> :
				<span className = "icon icon-magnifier" style = {magnifierStyle}/>
				}

			</div>
			{
				filteredRecords.map(function (rec, idx) {
					var pk = rec[oppModel._pk]
					return <div key = {pk} 
						onClick = {_this.chooseItem.bind(_this, idx)}
						onMouseOver = {_this.selectItem.bind(_this, idx)}
						className = {"popdown-item selectable " + ((idx === _this.state.selection) ? ' hilite' : '')}>
						<span className = "has-many-bubble">{rec[config.label]}</span>
					</div>
				})
			}	
			
			{
				(this.state.count > SEARCH_RECORDS_VISIBLE) ? 
				<div
				className={"popdown-item selectable" + (_this.state.selection === showMoreIdx ? ' hilite' : '')}
				key="show-more"
				onMouseOver = {_this.selectItem.bind(_this, showMoreIdx)}>
				
					Show more
					<span className = "icon green icon-arrow-right" style = {{marginLeft: '5px'}}/>
				</div>
				:
				filteredRecords.length === 0 && searchTerm.length > 0 ? 
				<div className = "popdown-item popdown-item-grayed">
					No records found...
				</div>
				: null
			}

			{
				this.state.searchTerm.length > 0 ?
				<div key="create-li"
					onClick = {this.createNewItem}
					onMouseOver = {_this.selectItem.bind(_this, addOneIdx)}
					className={"popdown-item selectable top-divider" + (_this.state.selection === addOneIdx ? ' hilite' : '')}>
					<span className="small icon green icon-plus"/>Create new {oppModel.model}
				</div>
				: null
			}
				
			</div>
	}

})

export default SearchDropdown


