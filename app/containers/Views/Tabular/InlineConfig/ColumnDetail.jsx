import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../fields"
import $ from 'jquery'

import ViewStore from "../../../../stores/ViewStore"
import ModelStore from "../../../../stores/ModelStore"
import AttributeStore from "../../../../stores/AttributeStore"
import KeyStore from "../../../../stores/KeyStore"
import KeycompStore from "../../../../stores/KeycompStore"

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var ColumnDetail = React.createClass({

	getInitialState: function () {
		return {
			open: false,
			yOffset: 0,
			dragging: false,
			rel: null
		}
	},

	componentDidUpdate: function (props, state) {
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp)
    }
  },

	onDrag: function (e) {
    // only left mouse button
    if (e.button !== 0) return
    var pos = $(this.getDOMNode()).offset()
    this.setState({
      dragging: true,
			yOffset: 0,
      rel: e.pageY
    })
    e.stopPropagation()
    e.preventDefault()
  },

  onMouseUp: function (e) {
    this.setState({dragging: false})
    e.stopPropagation()
    e.preventDefault()
  },

	toggleOpenMenu: function () {
		this.setState({open: !this.state.open})
	},

	toggleVisibility: function (event) {
		var config = this.props.config
		this.commitChanges({visible: !config.visible})
	},

	toggleRightAlign: function (event) {
		var config = this.props.config
		this.commitChanges({align: 'right'})
	},

	toggleCenterAlign: function (event) {
		var config = this.props.config
		this.commitChanges({align: 'center'})
	},

	toggleLeftAlign: function (event) {
		var config = this.props.config
		this.commitChanges({align: 'left'})
	},

	commitChanges: function (colProps) {
		var view = this.props.view
		var column_id = this.props.config.column_id
		var col = view.data.columns[column_id]
		col = _.extend(col, colProps)
		view.data.columns[column_id] = col;
		modelActionCreators.createView(view, true, false)
	},

	render: function() {
    var view = this.props.view
    var config = this.props.config
		var fieldType = fieldTypes[config.type]
		var typeSpecificConfig

		if (!!fieldType && fieldType.configRows)
			typeSpecificConfig = React.createElement(fieldType.configRows, {
				view: view,
				config: config
			})
		else typeSpecificConfig = <span className="double-column-config"/>

    return <div
			style = {{marginTop: ((this.state.yOffset) + 'px'),
							marginBottom: (-1 * (this.state.yOffset) + 'px')}}
      className={"menu-item menu-sub-item column-item " +
			(this.state.dragging ? " dragging " : "")}>

				{this.props.open ? <span
						className="draggable icon grayed icon-Layer_2"
						onMouseDown = {this.onDrag}></span>
					: null}

	      <span className="double-column-config">
					{config.name}
				</span>

				<span className="column-config">
					<span className={" clickable icon icon-align-left "
						+ (config.align === 'left' ? ' ' : ' grayed')}
						onClick={this.toggleLeftAlign}>
					</span>
					<span className={"clickable icon icon-align-center "
						+ (config.align === 'center' ? ' ' : ' grayed')}
						onClick={this.toggleCenterAlign}>
					</span>
					<span className={" clickable icon icon-align-right "
						+ (config.align === 'right' ? '  ' : ' grayed')}
						onClick={this.toggleRightAlign}>
					</span>
				</span>

				{typeSpecificConfig}

		</div>
	}
});

export default ColumnDetail;
