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

var ColorChoice = React.createClass({

  partName: 'ColorChoice',

  mixins: [blurOnClickMixin, popdownClickmodMixin, configCommitMixin],

  // LIFECYCLE ==============================================================

  getInitialState: function () {
    return {
      colorAttr: this.props.config.colorAttr || null,
      colorConditionAttr: this.props.config.colorConditionAttr || null,
      color: this.props.config.color,
      custom: !!this.props.config.color,
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
        <li className="popdown-item bottom-divider title">
          Conditional
        </li>
        :
        null
      }

      {
      boolAttrs.map(function (attr) {
        return <li key = {attr.attribute_id} className = {"popdown-item selectable " + 
          (_this.state.colorConditionAttr === attr.attribute_id ? ' menu-selected' : '')}
            onClick = {_this.chooseCondition.bind(_this, attr.attribute_id)}>
            <span className = "icon icon-check-square  ">
            </span>
            {attr.attribute}
          </li>
        })
      }

      {
        boolAttrs.length > 0 ?
        <li key = "no-condition" className = {"popdown-item selectable" + 
          (_this.state.colorConditionAttr === null  ? ' menu-selected' : '')}
          onClick = {_this.chooseCondition.bind(_this, null)}>
          <span className = "icon icon-square"/>
          No condition
        </li>
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

          <li key = "color-divider " 
            className = 'popdown-item title bottom-divider'>
            Background Color
          </li>

          {
          colorAttrs.map(function (attr) {
            return <li key = {attr.attribute_id} className = {"popdown-item selectable "
              + (_this.state.colorAttr === attr.attribute_id ? ' menu-selected' : '')}
              onClick = {_this.chooseColor.bind(_this, attr.attribute_id)}>
              <span className = "icon icon-eye-dropper  "/>
              {attr.attribute}
            </li>
          })
          }
          
          <li className = {"popdown-item selectable " +
            ((_this.state.colorAttr === null && _this.state.color === null) ? ' menu-selected' : '')}
            onClick = {_this.chooseNone}>
            <span className = "icon icon-square"/>
            No cell color
          </li>

          <li className = {"popdown-item selectable " + (this.state.custom ? " bottom-divider " : " ")}
            onClick = {_this.chooseCustom}>
            <span className = "icon icon-code"/>
            Custom color
          </li>
          
          <div style={{maxHeight: '60px', overflowY: 'scroll'}}>
          {
            this.state.custom ?
            makeColorPickerRows(_this.state.color, _this.chooseFixedColor)
            : null
          }
          </div>

          <li className = "popdown-item top-divider">
          Auto-lighten colors: <input type="checkbox"
            onChange = {_this.handleAdjustCheck}
            checked = {_this.state.adjustColor} />
          </li>
    </div>
  },

  renderMenu: function () {
    return [
      this.renderColorSection(),
      this.renderConditionSection()
    ]
  },

  render: function () {
    if (!!this.props.menuInline) return <div className = "menu-sub-item-boxed"  onClick = {util.clickTrap}>
      {this.renderMenu()}
    </div>;
    else return <span
        className={"pop-down clickable icon icon-paint-roller "
          + (this.state.open ? " open" : (this.state.colorAttr || this.state.color ? " active" : ""))}
        onClick = {this.handleClick}>
        {
        this.state.open ? <PopDownMenu {...this.props}>
          {this.renderMenu()}
        </PopDownMenu> : null
        }
        {
          this.state.context ? 
            <span className = "pop-down-overlay icon icon-paint-roller"/> 
            : null
        }
    </span>;
  }
})

export default ColorChoice
