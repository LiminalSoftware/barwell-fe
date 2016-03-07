import React from "react"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import PopDownMenu from '../../../../components/PopDownMenu'

import displayStyles from './displayStyles'

var blurOnClickMixin = require('../../../../blurOnClickMixin')

var NumberFormatChoice = React.createClass({

  mixins: [blurOnClickMixin],

  _timer: null,

  getInitialState: function () {
    var config = this.props.config
    return {
      formatString: config.formatString,
      open: false
    }
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({align: this.props.config.align})
  },

  updateFormatString: function (e) {
    var val = e.target.value
    this.setState({formatString: val})
  },

  blurInput: function () {
    this.commitChanges(this.state)
  },

  commitChanges: function (colProps) {
		var view = this.props.view
		var column_id = this.props.config.column_id
		var col = view.data.columns[column_id]

		col = _.extend(col, colProps)
		view.data.columns[column_id] = col;
    this.setState(colProps)
		modelActionCreators.createView(view, true, true)
	},

  chooseDisplayStyle: function (value, e) {
		this.commitChanges(_.pick(displayStyles[value], 'displayStyle', 'formatString'))
	},

  render: function () {
    var _this = this
    var config = this.props.config
    var style = config.displayStyle
    var displayObj = displayStyles[style]
    
    return <span><span
        className={"pop-down clickable icon " + displayObj.icon}
        onMouseDown = {this.handleOpen}>
        {
        this.state.open ? <PopDownMenu>
          <li className="bottom-divider">Display Styles</li>
          {
          _.map(displayStyles, function (ds, k) {
            return <li 
              key = {ds.displayStyle} className = "selectable"
              onClick = {_this.chooseDisplayStyle.bind(_this, ds.displayStyle)}>
              <span className = {'small icon icon-chevron-right ' +
                (config.displayStyle === k ? 'green' : 'hovershow')}/>
              <span className = {"icon " + ds.icon}/>
              {ds.description}
            </li>
          })
          }
          <li key="format-header" className = "top-divider">Format</li>
          <li key="format-string-input">
            <input 
            className = "menu-input text-input" 
            value={this.state.formatString}
            onChange = {this.updateFormatString}
            onBlur = {this.blurInput}/>
          </li>
        </PopDownMenu> : null
        }
    </span>
    
    </span>;
  }
})

export default NumberFormatChoice
