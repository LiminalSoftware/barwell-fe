import React from "react"
import _ from "underscore"

import AttributeStore from "../../../../stores/AttributeStore"
import RelationStore from "../../../../stores/RelationStore"
import ModelStore from "../../../../stores/ModelStore"

import PopDownMenu from "../../../../components/PopDownMenu"

import util from "../../../../util/util"
import constant from "../../../../constants/MetasheetConstants"

import MenuKeysMixin from '../MenuKeysMixin'
import modelActionCreators from "../../../../actions/modelActionCreators"



var SEARCH_DEBOUNCE = 200;
var SEARCH_RECORD_COUNT = 50;
var SEARCH_RECORDS_VISIBLE = 10

var SearchDropdown = React.createClass({
	
	mixins: [MenuKeysMixin],

	componentWillMount: function () {
		this._debounceSearch = _.debounce(this.search, SEARCH_DEBOUNCE)
	},

	componentDidMount: function () {
		this.setState({expanded: true})
	},

	getNumberOptions: function () {
		return Math.min(this.state.count, SEARCH_RECORDS_VISIBLE) + 
			(this.state.count > SEARCH_RECORDS_VISIBLE ? 2 : 1) + (this.state.searching ? 1 : 0);
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
		var filteredRecords = searchRecords.filter(
			rec => (rec[config.label] || '').toLowerCase().indexOf(this.state.searchTerm) >= 0
		).slice(this.state.page * SEARCH_RECORDS_VISIBLE, SEARCH_RECORDS_VISIBLE);
		this.setState({filteredRecords: filteredRecords})
	},

	selectItem: function (num) {
		this.setState({selection: num});
	},

	chooseItem: function (num) {
		var index = this.state.page * SEARCH_RECORDS_VISIBLE + num;
		var obj = this.state.searchRecords[num];
		this.commit(obj);
		this.props._revert();
	},

	chooseSelection: function (e) {
		var selection = this.state.selection;
		var index = this.state.page * SEARCH_RECORDS_VISIBLE + selection;
		var obj;

		// if (selection < 0 && e.ctrlKey) this.createNewItem(); 
		if (selection < 0) return;
		obj = this.state.searchRecords[index];
		this.commit(obj);
	},

	commit: function (hasManyObj) {
		var model = this.props.model;
		var config = this.props.config;
		var hasOneObj = this.props.object;
		var hasManyKeyId = config.related_key_id;
		var hasOneKeyId = config.key_id;
		modelActionCreators.moveHasMany(config.relation_id, hasOneObj, hasManyObj);
	},

	createNewItem: function () {
		console.log("create new item")
		var config = this.props.config
		var model = ModelStore.get(config.related_model_id);
		var label = config.label;
		var obj = {[label]: this.state.searchTerm};
		modelActionCreators.insertRecord(model, obj, 0).then(this.commit);
	},

	shouldOpenDown: function () {
		return this.props.spaceBottom > 5 
			&& (this.props.spaceBottom > this.props.spaceTop)
	},

	render: function () {
		var _this = this
		var model = this.props.model;
		var config = this.props.config;
		var shouldOpenDown = this.shouldOpenDown()
		var relation = RelationStore.get(config.relation_id);
		var oppModel = ModelStore.get(relation.related_model_id);
		var searchTerm = this.state.searchTerm.toLowerCase();
		var filteredRecords = this.state.filteredRecords;
		var showMoreIdx = this.getNumberOptions() - 2;
		var addOneIdx = this.getNumberOptions() - 1;

		return <PopDownMenu {...this.props} green = {true} maxHeight = {(40 * (this.getNumberOptions() + 2) + 'px')}>
          	
			<div key = "search-li" className = {"popdown-item " + (this.state.count > 0 ? "bottom-divider" : "")}
				style = {{height: '30px', position: 'relative'}}>
				<input className = "input-editor" autoFocus
					onChange = {this.updateSearchValue}
					value = {this.searchTerm}/>
				<span className = "icon icon-magnifier" style = {{right: 0, width: '18px', top: 0, bottom: 0, zIndex: 20}}/>
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
				this.state.searching ? 
				<div className = "popdown-item" key="loader-li">
					<span className = " icon icon-sync spin" />
					Searching...
				</div>
				:
				(this.state.count > SEARCH_RECORDS_VISIBLE) ? 
				<div
				className={"popdown-item selectable top-divider" + (_this.state.selection === showMoreIdx ? ' hilite' : '')}
				key="show-more"
				onMouseOver = {_this.selectItem.bind(_this, showMoreIdx)}>
				
					Show more
					<span className = "icon green icon-arrow-right" style = {{marginLeft: '5px'}}/>
				</div>
				:
				filteredRecords.length === 0 && searchTerm.length > 0 ? 
				<div className = "popdown-item">
					<span className = "icon icon-notification-circle"/>
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
				
			</PopDownMenu>
	}

})

export default SearchDropdown


