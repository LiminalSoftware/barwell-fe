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
		return Math.min(this.state.count, SEARCH_RECORDS_VISIBLE) + 2 
	},

	getInitialState: function () {
		return {
			searchTerm: '',
			fetchedTerm: '',
			searchRecords: [],
			selection: -1,
			count: null,
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
			&& this.state.count < this.state.limit) return;

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
		});
	},

	selectItem: function (num) {
		this.setState({selection: num})
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
		console.log(hasManyObj)
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
		var style = {
			position: 'absolute',
			minWidth: '160px',
			left: '-3px !important',
			right: '-3px !important',
			pointerEvents: 'auto',
			maxHeight: this.state.expanded ? (50 * (this.state.searchRecords.length + 3) + 'px') : 0
		};
		var shouldOpenDown = this.shouldOpenDown()
		var relation = RelationStore.get(config.relation_id);
		var oppModel = ModelStore.get(relation.related_model_id);
		var searchTerm = this.state.searchTerm.toLowerCase();
		var filteredRecords = this.state.searchRecords.filter(
			rec => (rec[config.label] || '').toLowerCase().indexOf(searchTerm) >= 0
		).slice(this.state.page * SEARCH_RECORDS_VISIBLE, SEARCH_RECORDS_VISIBLE);
		var count = filteredRecords.length;

		return <PopDownMenu {...this.props}>
          	
			<li key = "search-li" className = {this.state.count > 0 ? "bottom-divider" : ""}
				style = {{height: '30px', position: 'relative'}}>
				<input className = "input-editor" autoFocus
					onChange = {this.updateSearchValue}
					value = {this.searchTerm}/>
			</li>
				{
					filteredRecords.map(function (rec, idx) {
						var pk = rec[oppModel._pk]
						return <li key = {pk} 
							onClick = {_this.chooseItem.bind(_this, idx)}
							onMouseOver = {_this.selectItem.bind(_this, idx)}
							className = {"selectable " + ((idx === _this.state.selection) ? ' hilite' : '')}>
							<span className = "has-many-bubble">{rec[config.label]}</span>
						</li>
					})
				}
				
				{
					this.state.searching ? 
					<li key="loader-li">
						<span className = " icon icon-sync spin" />
						Searching...
					</li>
					:
					(this.state.count > SEARCH_RECORDS_VISIBLE) ? 
					<li key="loader-li" >Show more</li>
					:
					filteredRecords.length === 0 && searchTerm.length > 0 ? 
					<li>
						<span className = "icon icon-notification-circle"/>
						No records found...
					</li>
					: null
				}

				{
					this.state.searchTerm.length > 0 ?
					<li key="create-li"
						onClick = {this.createNewItem}
						className={"selectable top-divider"}>
						<span className="small icon green icon-plus"/>Create new {oppModel.model}
					</li>
					: null
				}
				
			</PopDownMenu>
	}

})

export default SearchDropdown


