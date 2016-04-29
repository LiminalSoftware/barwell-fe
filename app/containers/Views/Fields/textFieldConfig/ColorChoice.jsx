import React from "react"
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"
import PopDownMenu from '../../../../components/PopDownMenu'

import configCommitMixin from '../configCommitMixin'
import blurOnClickMixin from '../../../../blurOnClickMixin'
import makeColorPickerRows from '../ColorField/makeColorPickerRows'

var ColorChoice = React.createClass({

  partName: 'ColorChoice',

  mixins: [blurOnClickMixin, configCommitMixin],

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

  render: function () {
    var _this = this
    var view = this.props.view
    var colorAttrs = AttributeStore.query({type: 'COLOR', model_id: view.model_id})
    var boolAttrs = AttributeStore.query({type: 'BOOLEAN', model_id: view.model_id})

    return <span
        className={"pop-down clickable icon icon-paint-roller "
          + (this.state.open ? " open" : (this.state.colorAttr || this.state.color ? " active" : ""))}
        onClick = {this.handleOpen}>
        {
          this.state.open ? <PopDownMenu {...this.props}>

          {
            boolAttrs.length > 0 ?
            <li className="bottom-divider title">
              Condition
            </li>
            :
            null
          }


          {
          boolAttrs.map(function (attr) {
            return <li key = {attr.attribute_id} className = {"selectable " + 
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
            <li key = "no-condition" className = {"selectable" + 
              (_this.state.colorConditionAttr === null  ? ' menu-selected' : '')}
              onClick = {_this.chooseCondition.bind(_this, null)}>
              <span className = "icon icon-square"/>
              No condition
            </li>
            :
            null
          }

          <li key = "color-divider " className = {'title ' + (boolAttrs.length > 0 ? "top-divider bottom-divider" : "bottom-divider")}>
            Background Color
          </li>

          {
          colorAttrs.map(function (attr) {
            return <li key = {attr.attribute_id} className = {"selectable "
              + (_this.state.colorAttr === attr.attribute_id ? ' menu-selected' : '')}
              onClick = {_this.chooseColor.bind(_this, attr.attribute_id)}>
              <span className = "icon icon-color-sampler  "/>
              {attr.attribute}
            </li>
          })
          }

          <li className = {"selectable " +
            ((_this.state.colorAttr === null && _this.state.color === null) ? ' menu-selected' : '')}
            onClick = {_this.chooseNone}>
            <span className = "icon icon-color-sampler"/>
            No cell color
          </li>

          <li className = "selectable"
            onClick = {_this.chooseCustom}>
            <span className = "icon icon-code"/>
            Custom color
          </li>
          
          {
            this.state.custom ?
            makeColorPickerRows(_this.state.color, _this.chooseFixedColor)
            : null
          }

          

          <li className = "top-divider">
          Auto-lighten colors: <input type="checkbox"
            onChange = {_this.handleAdjustCheck}
            checked = {_this.state.adjustColor} />
          </li>


        </PopDownMenu> : null
        }
    </span>;
  }
})

export default ColorChoice
