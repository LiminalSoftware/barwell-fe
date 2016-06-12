import React from "react"
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"
import PopDownMenu from '../../../../components/PopDownMenu'

import configCommitMixin from '../configCommitMixin'
import blurOnClickMixin from '../../../../blurOnClickMixin'
import popdownClickmodMixin from '../popdownClickmodMixin';
import makeColorPickerRows from '../ColorField/makeColorPickerRows'

import util from '../../../../util/util';

var palette = [
  'rgb(77,179,113)',
  'rgb(179,77,77)',
  'rgb(240,233,117)', 
  'rgb(186,224,133)', 
  'rgb(230,122,25)',
  'rgb(256,187,201)'
];

var ColorChoice = React.createClass({

  partName: 'ColorChoice',

  mixins: [blurOnClickMixin, popdownClickmodMixin, configCommitMixin],

  // LIFECYCLE ==============================================================

  getInitialState: function () {
    return {
      colorAttr: this.props.config.colorAttr || null,
      colorConditionAttr: this.props.config.colorConditionAttr || null,
      color: this.props.config.color,
      palette: !!this.props.config.color,
      custom: this.props.config.customColor,
      adjustColor: !(this.props.config.adjustColor === false),
      open: false
    }
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({colorAttr: this.props.config.colorAttr})
  },

  // HANDLERS ================================================================

  chooseColor: function (attributeId) {
    this.commitChanges({colorAttr: attributeId, color: null, adjustColor: this.state.adjustColor})
    // this.setState({open: false})
  },

  chooseCondition: function (attributeId) {
    this.commitChanges({colorConditionAttr: attributeId, adjustColor: this.state.adjustColor})
    // this.setState({open: false})
  },

  chooseFixedColor: function (e) {
    var color = e.target.style.background;
    this.setState({custom: false})
    this.commitChanges({
      colorAttr: null, 
      color: color, 
      adjustColor: this.state.adjustColor
    })
    // this.setState({open: false})
  },

  chooseCustom: function () {
    this.setState({custom: true})
  },

  chooseNone: function () {
    this.setState({custom: false})
    this.commitChanges({colorAttr: null, color: null, custom: false})
  },

  handleAdjustCheck: function () {
    this.commitChanges({adjustColor: !this.state.adjustColor})
  },

  // RENDER ===================================================================

  renderConditionSection: function () {
    var _this = this
    var view = this.props.view
    var boolAttrs = AttributeStore.query({type: 'BOOLEAN', model_id: view.model_id})

    return <div className="popdown-section" key="condition">
      {
        boolAttrs.length > 0 ?
        <div className="popdown-item bottom-divider title">
          Conditional
        </div>
        :
        null
      }

      {
      boolAttrs.map(function (attr) {
        return <div key = {attr.attribute_id} className = {"popdown-item selectable " + 
          (_this.state.colorConditionAttr === attr.attribute_id ? ' menu-selected' : '')}
            onClick = {_this.chooseCondition.bind(_this, attr.attribute_id)}>
            <span className = "icon icon-check-square  ">
            </span>
            {attr.attribute}
          </div>
        })
      }

      {
        boolAttrs.length > 0 ?
        <div key = "no-condition" className = {"popdown-item selectable" + 
          (_this.state.colorConditionAttr === null  ? ' menu-selected' : '')}
          onClick = {_this.chooseCondition.bind(_this, null)}>
          <span className = "icon icon-square"/>
          No condition
        </div>
        :
        null
      }
    </div>
  },

  renderColorSection: function () {
    var _this = this
    var view = this.props.view
    var colorAttrs = AttributeStore.query({type: 'COLOR', model_id: view.model_id})

    return <div className = "popdown-section" key="color">

      <div key = "color-divider " 
        className = 'popdown-item title bottom-divider'>
        Background Color
      </div>

      {
      colorAttrs.map(function (attr) {
        return <div key = {attr.attribute_id} className = {"popdown-item selectable "
          + (_this.state.colorAttr === attr.attribute_id ? ' menu-selected' : '')}
          onClick = {_this.chooseColor.bind(_this, attr.attribute_id)}>
          <span className = "icon icon-eye-dropper  "/>
          {attr.attribute}
        </div>
      })
      }
      
      <div className = {"popdown-item selectable " +
        ((_this.state.colorAttr === null && _this.state.color === null) ? ' menu-selected' : '')}
        onClick = {_this.chooseNone}>
        <span className = "icon icon-square"/>
        No cell color
      </div>

      <div className = {"popdown-item selectable " + 
        (this.state.custom ? " menu-selected bottom-divider " : " ")}
        onClick = {_this.chooseCustom}>
        <span className = "icon icon-code"/>
        Custom color
      </div>
      
      <div style={{maxHeight: '60px', overflowY: 'scroll'}}>
      {
        this.state.custom ?
        makeColorPickerRows(_this.state.color, _this.chooseFixedColor)
        : null
      }
      </div>

      <div className = "popdown-item top-divider">
      Auto-lighten colors: <input type="checkbox"
        onChange = {_this.handleAdjustCheck}
        checked = {_this.state.adjustColor} />
      </div>
    </div>
  },

  renderMenu: function () {
    return [
      this.renderColorSection(),
      this.renderConditionSection()
    ]
  },

  getIcon: function () {
    return " icon icon-paint-roller " + (this.state.active && !this.state.context ? " active " : "");
  },

  isActive: function () {
    return this.state.colorAttr || this.state.custom;
  }
  
})

export default ColorChoice
