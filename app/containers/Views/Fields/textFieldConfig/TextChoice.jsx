import React from "react"
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"

import configCommitMixin from '../configCommitMixin'
import blurOnClickMixin from '../../../../blurOnClickMixin'
import popdownClickmodMixin from '../popdownClickmodMixin';

import PopDownMenu from '../../../../components/PopDownMenu';

import util from '../../../../util/util'

var TextChoice = React.createClass({

  partName: 'TextChoice',

  mixins: [
    blurOnClickMixin, 
    configCommitMixin,
    popdownClickmodMixin
  ],

  getInitialState: function () {
    var config = this.props.config
    return {
      textConditionAttr: config.textConditionAttr,
      style: config.style,
      open: false
    }
  },

  choosetextConditionAttr: function (attributeId) {
    this.commitChanges({textConditionAttr: attributeId})
  },

  chooseStyle: function (style) {
    this.commitChanges({style: style})
    this.setState({open: false})
  },

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

  renderConditionMenu: function () {
    var _this = this
    var view = this.props.view
    var boolAttrs = AttributeStore.query({type: 'BOOLEAN', model_id: view.model_id})

    return <div className = "popdown-section" key="condition">
      {
        boolAttrs.length > 0 ?
          <li className = "popdown-item bottom-divider title " >
            Conditional
          </li>
          :
          null
        }

        {
        boolAttrs.map(function (attr) {
          return <li key = {attr.attribute_id} className = {"popdown-item  selectable "
            + (_this.state.textConditionAttr === attr.attribute_id ? ' menu-selected' : '')}
            onClick = {_this.choosetextConditionAttr.bind(_this, attr.attribute_id)}>
            <span className = "icon icon-check-square"/>
            {attr.attribute}
          </li>
        })
        }

        {
        boolAttrs.length > 0 ?
          <li className = {"popdown-item  selectable " + 
            (!_this.state.textConditionAttr ? ' menu-selected' : '')}
            onClick = {_this.choosetextConditionAttr.bind(_this, null)}>
            
            <span className = "icon icon-square"/>
            No Condition
          </li>
          :
          null
        }
    </div>
  },

  renderMenu: function () {
    return [
      this.renderFontStyleMenu(),
      this.renderConditionMenu()
    ]
  },

  isActive: function () {
    return this.state.style !== 'none';
  },

  getIcon: function () {
    return " icon " + (this.state.style === 'none' ? " icon-text-format " : ('icon-' + this.state.style))
  },

})

export default TextChoice
