import React from "react"
import _ from "underscore"

import modelActionCreators from "../../../actions/modelActionCreators"
import AttributeStore from "../../../stores/AttributeStore"

import configCommitMixin from '../configCommitMixin'
import blurOnClickMixin from "../../../blurOnClickMixin"
import popdownClickmodMixin from '../popdownClickmodMixin'
import conditionalMixin from './conditionalMixin'

import PopDownMenu from "../../../components/PopDownMenu";

import util from "../../../util/util"

var TextChoice = React.createClass({

  partName: 'TextChoice',

  partLabel: 'Font style',

  conditionProperty: 'textConditionAttr',

  mixins: [
    blurOnClickMixin, 
    configCommitMixin,
    popdownClickmodMixin,
    conditionalMixin
  ],

  getInitialState: function () {
    var config = this.props.config
    return {
      textConditionAttr: config.textConditionAttr,
      style: config.style,
      open: false,
      conditional: false
    }
  },

  // LIFECYCLE ==============================================================

  componentWillReceiveProps: function (nextProps) {
    var config = nextProps.config
    this.setState({
      textConditionAttr: config.textConditionAttr,
      style: config.style
    })
  },

  choosetextConditionAttr: function (attributeId) {
    this.commitChanges({
      textConditionAttr: attributeId
    })
  },

  chooseStyle: function (style) {
    this.commitChanges({style: style})
    this.setState({open: false})
  },

  blurChildren: function () {
    const conditionDropdown = this.refs.conditionDropdown;
    if (conditionDropdown) conditionDropdown.handleBlur()
  },

  // RENDER ==============================================================

  renderFontStyleMenu: function () {
    var _this = this
    var view = this.props.view

    return <div className = "popdown-section" key="fontstyle">
      <li className = "popdown-item bottom-divider title " >
        Font Style
      </li>

      <li className = {"popdown-item selectable " + (_this.state.style === 'bold' ? 'menu-selected' : '')}
      onClick = {_this.chooseStyle.bind(_this, 'bold')}>
        <span className = "icon icon-bold"/>
        Bold text
      </li>

      <li className = {"popdown-item selectable " + (_this.state.style === 'italic' ? 'menu-selected' : '')}
      onClick = {_this.chooseStyle.bind(_this, 'italic')}>
        <span className = "icon icon-italic"/>
        Italic text
      </li>

      <li className = {"popdown-item selectable " + (_this.state.style === 'none' ? ' menu-selected' : '')}
      onClick = {_this.chooseStyle.bind(_this, 'none')}>
        <span className = "icon icon-text-format"/>
        No font style
      </li>
    </div>
  },




  renderMenu: function () {
    return [
      this.renderFontStyleMenu(),
      this.renderConditionSection()
    ]
  },

  isActive: function () {
    return this.state.style !== 'none';
  },

  getIcon: function (config) {
    return " icon " + (config.style === 'none' ? " icon-text-format " : ('icon-' + config.style))
  },

})

export default TextChoice
