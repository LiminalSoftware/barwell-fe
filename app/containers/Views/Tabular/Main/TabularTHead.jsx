import React from "react"
import $ from "jquery"
import styles from "./tabularTHStyle.less"
 
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
import PureRenderMixin from 'react-addons-pure-render-mixin';

import TabularTH from "./TabularTH"
var TabularTHead = React.createClass ({
	mixins: [PureRenderMixin],

	render: function () {
		var _this = this
		var view = this.props.view
		var geo = view.data.geometry
		var left = geo.leftGutter
		var focused = this.props.focused

		var style = {
			top: 0,
			left: this.props.leftOffset + 'px',
			height: (geo.headerHeight + 1) + 'px',
			width: (this.props.totalWidth + 6) + 'px'
		}

		return <div
			className = "tabular-view-header"
			style = {style}
			ref = {this.props.side + "-thead"}>
			{
			_this.props.columns.map(function (col, idx) {
				var el = <TabularTH key={"th-" + col.attribute_id}
					scrollTop = {_this.props.scrollTop}
					focused = {focused}
					column={col}
					view={view}
					idx={idx}
					left={left}/>;
				left += col.width
				return el
			})
			}
			<span style={{left: (left) + 'px',
				width: (geo.rowHeight * 2) + 'px',
				height: geo.headerHeight}}
				className= {"table-cell table-header-cell columnAdder " +
					(focused ? " focused " : " blurred ")}>
				<span className="table-cell-inner"> + </span>
			</span>
		</div>
	}
})

export default TabularTHead
