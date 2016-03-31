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

  // LIFECYCLE ==============================================================

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
    this.setState({align: this.props.config.align});
  },

  // HANDLERS ===============================================================

  handleFormatChange: function (e) {
    var value = e.target.value
    this.setState({formatString: value})
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

  handleChooseCustom: function () {
    this.setState({custom: true})
  },

  chooseFormat: function (format, e) {
    console.log('chooseFormat: ' + JSON.stringify(format))
    this.commitChanges({
      custom: false, 
      open: false, 
      formatString: format.formatString
    });
  },

  // RENDER =================================================================

  render: function () {
    var _this = this
    var config = this.props.config
    var style = config.displayStyle
    var displayObj = displayStyles[style]
    
    return <span><span
        className={"pop-down clickable icon " + displayObj.icon}
        onClick = {this.handleOpen}>
        {
        this.state.open ? <PopDownMenu {...this.props}>
          <li className="bottom-divider">
            Number Format
          </li>
          {
          _.map(displayStyles, function (ds, k) {
            return <li 
              key = {ds.displayStyle} 
              className = {"selectable " + 
              (config.displayStyle === k ? 'menu-selected' : '')}
              onClick = {_this.chooseFormat.bind(_this, ds)}>
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
                  type = "text"
                  style = {{textAlign: 'center'}}
                  className = "menu-input text-input" 
                  value = {this.state.formatString}
                  onBlur = {this.onBlur}
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
