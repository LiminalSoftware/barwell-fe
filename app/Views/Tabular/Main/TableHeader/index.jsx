import React from "react"
import $ from "jquery"
import styles from "./styles.less"

import _ from 'underscore'
import fieldTypes from "../../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
import PureRenderMixin from 'react-addons-pure-render-mixin';

import HeaderCell from "./HeaderCell"



var TableHeader = React.createClass ({

	shouldComponentUpdate: function (nextProps) {
		return (nextProps.leftOffset !== this.props.leftOffset ||
			nextProps.view !== this.props.view || this.props.focused !== nextProps.focused)
	},

	render: function () {
		const _this = this
		const view = this.props.view
		const geo = view.data.geometry
		var focused = this.props.focused
		var left = (this.props.hasRowLabel ? geo.labelWidth : 0) + this.props.leftOffset
		var sortAttrs = _.pluck(view.data.sorting, 'attribute_id').map(parseInt)

		const style = {
			marginLeft: this.props.leftOffset + 'px',
			height: (this.props.height || (geo.headerHeight + 1)) + 'px',
			width: (this.props.totalWidth ) -1 + 'px',
			transform: 'translateZ(1px)'
		}

		const classes = 'tabular-view-header wrapper '
			+ (focused ? '' : " gray-out ")
			+ this.props.side + '-header--' + (this.props.focused ? 'focused' : 'blurred') 
			+ ' tabular-view-header--' + (this.props.focused ? 'focused' : 'blurred')

		return <div
			className={classes} style={style}
			ref = {this.props.side + "-thead"}>
			{
			this.props.hasRowLabel ?
			<span style = {{left: 0, width: geo.labelWidth + 'px', top: 0, bottom: 0}}
				className = "table-header-cell" >
				<span className = "header-cell-inner table-cell-inner" style = {{background: 'white'}}>
				<span style = {{marginLeft: "2px"}} className = "checkbox-surround "></span>
				</span>
			</span>
			: null 
			}

			{
			_this.props.columns.map(function (col, idx) {
				var sortIndex = view.data.sortIndex || {};
				var sorting = (col.attribute_id in sortIndex) ? sortIndex[col.attribute_id] : null;

				var el = <HeaderCell key={"th-" + col.column_id}
					focused = {_this.props.focused}
					scrollTop = {_this.props.scrollTop}
					column = {col}
					sorting = {sorting}
					view = {view}
					idx = {idx}
					left = {left}/>;
				left += col.width
				return el
			})
			}

			{this.props.hasRowLabel ? null :
			<span onContextMenu = {this.onContextMenu}
				style = {{left: left + 10 + 'px'}}
				className = 'table-header-cell action-cell-topright'>
				<span className = "table-cell-inner header-cell-inner" style = {{textAlign: 'center'}}>
					<span className="icon icon-plus" style={{margin: 0}}/>
				</span>
			</span>
			}

			{this.props.hasRowLabel ? null :
			<span onContextMenu = {this.onContextMenu}
				style = {{left: left + 55 + 'px'}}
				className = 'table-header-cell action-cell-topright'>
				<span className = "table-cell-inner header-cell-inner" style = {{textAlign: 'center'}}>
					<span className="icon icon-eye-crossed" style={{margin: 0}}/>
				</span>
			</span>
			}
		</div>
	}
})

export default TableHeader
