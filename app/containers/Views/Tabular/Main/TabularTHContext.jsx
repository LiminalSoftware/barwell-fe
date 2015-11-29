import React from "react"
import $ from "jquery"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
import constant from '../../../../constants/MetasheetConstants'

var TabularTHContext = React.createClass ({
	mixins: [PureRenderMixin],

  componentDidMount: function () {
    document.addEventListener('keyup', this.handleKeyPress)
    document.addEventListener('click', this.props.handleBlur)
  },

  componentwillUnmount: function () {
    document.removeEventListener('keyup', this.handleKeyPress)
    document.removeEventListener('click', this.props.handleBlur)
  },

  handleClick: function (e) {

  },

  handleKeyPress: function (event) {
    if (event.keyCode === constant.keycodes.ESC) this.props.handleBlur()
  },

	trapClick: function () {

	},

	onClick: function (event) {
   	var resizer = React.findDOMNode(this.refs.resizer)
		var view = this.props.view
		var col = this.props.column

		if(event.target == resizer) return

		var sortObj = {
			'attribute_id': col.attribute_id,
			'descending': !!(col.sorting && !col.sorting.descending)
		}

		if (!event.shiftKey || !view.data.sorting) view.data.sorting = []
		view.data.sorting.push(sortObj)

		modelActionCreators.createView(view, true, false)
	}

  render: function () {
    var config = this.props.config
    return <div className="th-context dropdown-menu" onClick = {this.trapClick}>
      <div className = "menu-item menu-sub-item">
      <input className="renamer" value={config.name}></input>
      </div>
      <div className = "menu-item">
        <div className = "menu-sub-item">Sort asc</div>
        <div className = "menu-sub-item">Sort desc</div>
      </div>
      <div className = "menu-item menu-sub-item">
        Hide column
      </div>
    </div>
  }
})

export default TabularTHContext