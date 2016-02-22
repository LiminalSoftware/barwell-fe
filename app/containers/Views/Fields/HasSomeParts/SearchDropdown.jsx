import React from "react"
import _ from "underscore"

import AttributeStore from "../../../../stores/AttributeStore"
import RelationStore from "../../../../stores/RelationStore"
import ModelStore from "../../../../stores/ModelStore"

import constant from "../../../../constants/MetasheetConstants"

import modelActionCreators from "../../../../actions/modelActionCreators"

var SEARCH_DEBOUNCE = 200;
var SEARCH_RECORD_COUNT = 50;
var SEARCH_RECORDS_VISIBLE = 10

var SearchDropdown = React.createClass({

	handleKeyPress: function (e) {
		if (e.keyCode === constant.keycodes.ESC) this.props._revert()
		if (e.keyCode === constant.keycodes.ENTER) {
			this.chooseSelection(e)
		}
		if (e.keyCode === constant.keycodes.TAB) {
			this.commitChanges(e)
		}
		if (e.keyCode === constant.keycodes.ARROW_UP) {
			this.setState({selection: Math.max(this.state.selection - 1, -1)})
			e.preventDefault()
		}
		if (e.keyCode === constant.keycodes.ARROW_DOWN) {
			this.setState({selection: Math.min(this.state.selection + 1, SEARCH_RECORDS_VISIBLE - 1)})
			e.preventDefault()
		}
	},

	componentWillMount: function () {
		this._debounceSearch = _.debounce(this.search, SEARCH_DEBOUNCE)
		addEventListener('keyup', this.handleKeyPress)
	},

	componentWillUnmount: function () {
		removeEventListener('keyup', this.handleKeyPress)
	},

	componentDidMount: function () {
		this.setState({expanded: true})
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
		if (term.length < 3 || this.state.searching) return;

		// also bail out if its a subset of the old term (filter client-side)
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

	chooseSelection: function (e) {
		var selection = this.state.selection
		var index = this.state.page * SEARCH_RECORDS_VISIBLE + selection
		var obj

		if (selection < 0 && e.ctrlKey) return // create new record
		else if (selection < 0) return
		
		obj = this.state.searchRecords[index]
		this.chooseItem(obj)
	},

	chooseItem: function (hasManyObj) {
		console.log('abc')
		var model = this.props.model
		var config = this.props.config
		var hasOneObj = this.props.object
		var hasManyKeyId = config.related_key_id
		var hasOneKeyId = config.key_id
		modelActionCreators.moveHasMany(config.relation_id, hasOneObj, hasManyObj)
	},

	render: function () {
		var _this = this
		var model = this.props.model;
		var config = this.props.config;
		var style = {
			position: 'absolute',
			minWidth: '160px',
			left: 0,
			right: 0,
			margin: '-1px',
			marginRight: '0',
			overflow: 'hidden',
			transform: 'translateZ(5px)',
			maxHeight: this.state.expanded ? (40 * (this.state.searchRecords.length + 3) + 'px') : 0
		};
		var relation = RelationStore.get(config.relation_id);
		var oppModel = ModelStore.get(relation.related_model_id);
		var searchTerm = this.state.searchTerm.toLowerCase();
		var filteredRecords = this.state.searchRecords.filter(
			rec => (rec[config.label] || '').toLowerCase().indexOf(searchTerm) >= 0
		).slice(this.state.page * SEARCH_RECORDS_VISIBLE, SEARCH_RECORDS_VISIBLE);
		var count = filteredRecords.length;

		return <ul className = "pop-down-menu green"
			onClick = {function(e){console.log('clickkkkkk')}}
			style = {style}>
			<li className = {this.state.count > 0 ? "bottom-divider" : ""}
				style = {{height: '30px', position: 'relative'}}>
				<input className = "input-editor" autoFocus
					onChange = {this.updateSearchValue}
					value = {this.searchTerm}/>
			</li>
				{
					filteredRecords.map(function (rec, idx) {
						var pk = rec[oppModel._pk]
						return <li key = {pk} onClick = {_this.chooseItem}
							className = {"selectable " + ((idx === _this.state.selection) ? ' hilite' : '')}
							>
							<span className = "has-many-bubble">{rec[config.label]}</span>
						</li>
					})
				}
				
				{
					this.state.searching ? 
					<li>
						<div className="three-quarters-loader three-quarters-loader--green"/>
						Searching...
					</li>
					:
					(this.state.count > SEARCH_RECORDS_VISIBLE) ? 
					<li className="top-divider">Show more</li>
					:
					this.state.count === 0 ? 
					<li>No records found</li> 
					: null
				}

				{
					this.state.searchTerm.length > 0 ?
					<li className="selectable" style={{}}>
						<span className="small icon green icon-plus"/>Create new {oppModel.model}
					</li>
					: null
				}
				
			</ul>
	}

})

export default SearchDropdown


