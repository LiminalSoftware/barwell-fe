import React from "react"
import $ from "jquery"
 
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
import AttributeStore from "../../../../stores/AttributeStore"

import util from '../../../../util/util'

var CubeTHead = React.createClass ({

	shouldComponentUpdate: function (newProps) {
		return newProps.view !== this.props.view;
		// return false;
	},

	getInitialState: function () {
		return {
			fetched: false,
			rowOffset: 0,
			colOffset: 0,
		};
	},

	_onChange: function () {
		this.forceUpdate();
	},

	componentWillMount: function () {
		var store = this.props.store;
		if (store) store.addChangeListener(this._onChange);
	},

	componentWillUnmount: function () {
		var store = this.props.store;
		if (store) store.removeChangeListener(this._onChange);
	},

	// shouldComponentUpdate: function (newProps, newState) {
	// 	var oldProps = this.props
	// 	return !(
	// 		_.isEqual(newProps.view, oldProps.view) &&
	// 		newProps.scrollTop === oldProps.scrollTop &&
	// 		newProps.scrollLeft === oldProps.scrollLeft
	// 	)
	// },

	render: function () {
		var _this = this;
		var view = this.props.view;
		var dimension = this.props.dimension;
		var geo = view.data.geometry;
		var store = this.props.store;
		var getColumns = (c => view.data.columns['a' + c]);
		var groups = store.getDimensions(dimension).map(getColumns);
		var levels = store.getLevels(dimension, 0, 100) || [];
		var spans = groups.map(g => 0);
		var isBroken;

		return <div
			id = {'cube-' + dimension + '-header'}
			ref = {dimension + 'Header'}
			style = {this.props.style}
			onMouseDown = {this.props._handleClick}
			onDoubleClick = {this.props._handleEdit}
			className = {"cube-" + dimension + "-header tabular-body force-layer wrapper "}>
			{
			levels.map (function (level, r) {
				var selector = {};
				var offset = 0;
				isBroken = false;
				
				return groups.map(function (group, c) {
					var column_id = group.column_id
					var transverse = dimension === 'row' ? group.width : geo.rowHeight
					
					selector[column_id] = level[column_id];
					spans[c] ++;
					
					if (r === levels.length - 1 || level[column_id] !== levels[r + 1][column_id] || isBroken) {
						var fieldType = fieldTypes[group.type].element
						var cellLength = dimension === 'row' ? geo.rowHeight : geo.columnWidth
						var length = spans[c] * cellLength
						var cellKey = dimension + '-head-' + _.values(selector).join('%&');
						var thStyle = {
							[dimension === 'row' ? 'width' : 'height']: transverse + 'px',
							[dimension === 'row' ? 'height' : 'width']: length + 'px',
							lineHeight: (length - 1) + 'px',
							[dimension === 'row' ? 'left' : 'top']: offset + 'px',
							[dimension === 'row' ? 'top' : 'left']: ((r - spans[c] + 1) * cellLength) + 'px'
						};
						if (dimension === 'column' && c === groups.length - 1) thStyle.borderBottom = 'none';
						offset += transverse
						isBroken = true
						spans[c] = 0
						

						return React.createElement(fieldType, {
							config: group,
							model: _this.props.model,
							view: _this.props.view,
							selector: _.clone(selector),
							value: level[column_id],
							column_id: group.column_id,
							key: cellKey,
							cellKey: cellKey,
							ref: cellKey,
							style: thStyle,
							className: 'table-cell ',
							rowHeight: dimension === 'row' ? length : transverse
						})
					
					} else {
						offset += transverse
					}
				})
				
			})
			}
		</div>;
	}
})

export default CubeTHead
