import React from "react"
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"
import PopDownMenu from '../../../../components/PopDownMenu'

import configCommitMixin from '../configCommitMixin'
import blurOnClickMixin from '../../../../blurOnClickMixin'
import popdownClickmodMixin from '../popdownClickmodMixin';
import ColorPickerWidget from '../ColorField/ColorPickerWidget'

import Dropdown from '../../../Dropdown/Dropdown'

import util from '../../../../util/util';

var palette = [
  'rgb(77,179,113)',
  'rgb(230,122,25)',
  'rgb(179,77,77)',
   
  'rgb(186,224,133)',
  'rgb(240,233,117)',
  'rgb(255, 192, 184)',

  'rgb(121,160,211)',
  'rgb(205,200,200)'
];

var ColorChoice = React.createClass({

  partName: 'ColorChoice',

  mixins: [blurOnClickMixin, popdownClickmodMixin, configCommitMixin],

  // LIFECYCLE ==============================================================

  getInitialState: function () {
    var config = this.props.config
    return {
      colorAttr: config.colorAttr,
      colorConditionAttr: config.colorConditionAttr,
      conditional: !!config.colorConditionAttr,
      chooser: !!config.colorAttr ? 'colorAttr' : !!config.color ? 
          (_.contains(palette, config.color) ? 'palette' : 'custom') 
          : 'nocolor',
      color: config.color,
      adjustColor: !(this.props.config.adjustColor === false),
      open: false
    }
  },

  componentWillReceiveProps: function (nextProps) {
    var config = nextProps.config
    this.setState({
      colorAttr: config.colorAttr,
      colorConditionAttr: config.colorConditionAttr,
      color: config.color
    })
  },

  // HANDLERS ================================================================

  chooseColor: function (attributeId) {
    this.commitChanges({colorAttr: attributeId, color: null, adjustColor: this.state.adjustColor})
    this.blurChildren(e)
    // this.setState({open: false})
  },

  chooseCondition: function (attributeId, e) {
    this.commitChanges({colorConditionAttr: attributeId})
    this.blurChildren(e)
    // this.setState({open: false})
  },

  toggleConditional: function (e) {
    this.setState({conditional: !this.state.conditional})
    this.blurChildren(e)
  },

  chooseFixedColor: function (color) {
    this.setState({color: color})
    this.commitChanges({color: color})
  },

  chooseCustom: function () {
    this.setState({chooser: 'custom'})
  },

  choosePalette: function () {
    this.setState({chooser: 'palette'})
  },

  chooseNone: function () {
    this.setState({chooser: 'nocolor', color: null, conditional: false, colorAttr: null,})
    this.commitChanges({colorAttr: null, color: null})
  },

  handleAdjustCheck: function () {
    this.commitChanges({adjustColor: !this.state.adjustColor})
  },

  blurChildren: function () {
    const condionDropdown = this.refs.condionDropdown;
    if (condionDropdown) condionDropdown.handleBlur()
  },

  // RENDER ===================================================================

  renderConditionDropdown: function () {
    const view = this.props.view
    const boolAttrs = AttributeStore
      .query({type: 'BOOLEAN', model_id: view.model_id})
      .map(function(a){
        return {
          "key": a.attribute_id, 
          "label": a.attribute, 
          "icon": 'icon-check-square'
        }})
    
    return <Dropdown choices = {boolAttrs} 
      _choose = {this.chooseCondition}
      ref = "conditionDropdown"
      selection = {this.state.colorConditionAttr}/>
  },

  renderConditionSection: function () {
    const _this = this
    const view = this.props.view
    const boolAttrs = AttributeStore
      .query({type: 'BOOLEAN', model_id: view.model_id})

    return <div className="popdown-section" key="condition">
      {
        boolAttrs.length > 0 ?
        <div className="popdown-item title top-divider">
          <input type="checkbox"
            onChange = {_this.toggleConditional}
            checked = {_this.state.conditional} />
          Conditional
        </div>
        :
        null
      }

      {
      this.state.conditional ? 
        this.renderConditionDropdown()
        :
        null
      }
    </div>
  },

  renderColorSection: function () {
    var _this = this
    var view = this.props.view
    var colorAttrs = AttributeStore.query({type: 'COLOR', model_id: view.model_id})
    var customHeight = (this.state.chooser === 'custom' ? '80px' : '0');

    return <div className = "popdown-section" key="color">

      <div key = "color-divider " 
        className = 'popdown-item title bottom-divider'>
        Configure Background Color:
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
        ((_this.state.chooser === 'nocolor') ? ' menu-selected' : '')}
        onClick = {_this.chooseNone}>
        <span className = "icon icon-square"/>
        No cell color
      </div>

      <div className = {"popdown-item selectable " + 
        (this.state.chooser === 'palette' ? " menu-selected bottom-divider " : " ")}
        onClick = {_this.choosePalette}>
        <span className = "icon icon-color-sampler"/>
        Quick colors
      </div>

      {
        this.state.chooser === 'palette' ? 
        <div className = "popdown-item menu-row"> {
          palette.map(function (color) {
            return <span className = "menu-choice" key = {color} style = {{background: color}}
            onMouseDown = {_this.chooseFixedColor.bind(_this, color)}>
              {
                (color === _this.state.color) ? 
                <span className = "icon icon-check icon--small" 
                style = {{color: 'white', textAlign: 'right', lineHeight: '25px'}} /> : null
              }
            </span>;
          })
        } </div>
        : null
      }

      <div className = {"popdown-item selectable " + 
        (this.state.chooser === 'custom' ? " menu-selected bottom-divider " : " ")}
        onClick = {_this.chooseCustom}>
        <span className = "icon icon-code"/>
        Custom color
      </div>
      
      
      {
      this.state.chooser === 'custom' ?
      <ColorPickerWidget  color = {this.state.color} height = {customHeight} 
        _chooseColor = {this.chooseFixedColor}/>
      : null
      }



      {
      this.state.colorConditionAttr ?
      <div className = "popdown-item top-divider">
      Auto-lighten colors: <input type="checkbox"
        onChange = {_this.handleAdjustCheck}
        checked = {_this.state.adjustColor} />
      </div>
      : null
      }
      

    </div>
  },

  renderMenu: function () {
    return [
      this.renderColorSection(),
      this.renderConditionSection()
    ]
  },

  getIcon: function () {
    return " icon icon-bucket " + (this.state.active && !this.state.context ? " active " : "");
  },

  isActive: function () {
    return this.state.colorAttr || this.state.color;
  }
  
})

export default ColorChoice
