import React from "react"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import PopDownMenu from '../../../../components/PopDownMenu'

import displayStyles from './displayStyles'
import configCommitMixin from '../configCommitMixin'
import blurOnClickMixin from '../../../../blurOnClickMixin'

var NumberFormatChoice = React.createClass({

  partName: 'NumberFormatChoice',

  mixins: [blurOnClickMixin, configCommitMixin],

  _timer: null,

  getInitialState: function () {
    var config = this.props.config
    var custom = !_.any(displayStyles, ds => ds.formatString === config.formatString)
    return {
      formatString: config.formatString,
      open: false,
      custom: custom
    }
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({align: this.props.config.align})
  },

  updateFormatString: function (e) {
    var val = e.target.value
    this.setState({formatString: val})
  },

  chooseDisplayStyle: function (value, e) {
    console.log('chooseDisplayStyle: ' + JSON.stringify(value))
		this.commitChanges({
      displayStyle: value.displayStyle,
      formatString: value.formatString,
      custom: false
    });
	},

  onBlur: function (event) {
    var config = this.props.config
    var view = this.props.view
    var column_id = config.column_id
    var data = view.data
    var col = data.columns[column_id]

    col.formatString = this.state.formatString
    modelActionCreators.createView(view, false, true)
  },

  handleFormatChange: function (e) {
    var value = e.target.value
    this.setState({formatString: value})
  },

  handleChooseCustom: function () {
    this.setState({custom: true})
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
          <li className="bottom-divider">Number Format</li>
          {
          _.map(displayStyles, function (ds, k) {
            return <li 
              key = {ds.displayStyle} 
              className = {"selectable " + 
              (config.displayStyle === k ? 'menu-selected' : '')}
              onClick = {_this.chooseDisplayStyle.bind(_this, ds)}>
              <span className = {"icon " + ds.icon}/>
              {ds.description}
            </li>
          })
          }
          <li key="format-header" className = {"top-divider " +
            (this.state.custom ? ' menu-selected' : '')}
            onClick = {this.handleChooseCustom}>
            <span className="icon icon-code"/>
            Custom
          </li>
          {
            this.state.custom ?
            <li>
                <input
                  style = {{textAlign: 'center'}}
                  className = "menu-input text-input" 
                  
                  value = {this.state.formatString}
                  onChange = {_this.handleFormatChange}/> 
            </li>
            : null
          }
        </PopDownMenu> : null
        }
    </span>
    
    </span>;
  }
})

export default NumberFormatChoice
