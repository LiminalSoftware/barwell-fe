import React from "react"
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"
import PopDownMenu from '../../../../components/PopDownMenu'

import configCommitMixin from '../configCommitMixin'
import blurOnClickMixin from '../../../../blurOnClickMixin'

var ColorChoice = React.createClass({

  mixins: [blurOnClickMixin, configCommitMixin],

  getInitialState: function () {
    return {
      colorAttr: this.props.config.colorAttr || null,
      colorConditionAttr: this.props.config.colorConditionAttr || null,
      color: this.props.config.color,
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

  chooseFixedColor: function (color) {
    this.commitChanges({colorAttr: null, color: color, adjustColor: this.state.adjustColor})
    // this.setState({open: false})
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
            <li className="bottom-divider">
              Condition
            </li>
            :
            null
          }


          {
          boolAttrs.map(function (attr) {
            return <li key = {attr.attribute_id} className = "selectable"
              onClick = {_this.chooseCondition.bind(_this, attr.attribute_id)}>
              <span className = {'icon icon-chevron-right ' +
                (_this.state.colorConditionAttr === attr.attribute_id ? 'green' : 'hovershow')}/>
              <span className = "icon icon-check-square  ">
              </span>
              {attr.attribute}
            </li>
          })
          }

           {
            boolAttrs.length > 0 ?
            <li key = "no-condition" className="selectable"
              onClick = {_this.chooseCondition.bind(_this, null)}>
              <span className = {'icon  icon-chevron-right ' +
                (_this.state.colorConditionAttr === null ? 'green' : 'hovershow')}/>
              <span className = "icon icon-square"/>
              No condition
            </li>
            :
            null
          }

          <li key = "color-divider" className = {boolAttrs.length > 0 ? "top-divider bottom-divider" : "bottom-divider"}>
            Background Color
          </li>

          {
          colorAttrs.map(function (attr) {
            return <li key = {attr.attribute_id} className = "selectable"
              onClick = {_this.chooseColor.bind(_this, attr.attribute_id)}
              >
              <span className = {'icon icon-chevron-right ' +
                (_this.state.colorAttr === attr.attribute_id ? 'green' : 'hovershow')}/>
              <span className = "icon icon-color-sampler  "/>
              {attr.attribute}
            </li>
          })
          }

          
          {
            ['red','orange','yellow','green','blue','violet'].map(function (fcolor) {
              return <li className = "selectable" key={fcolor}
                onClick = {_this.chooseFixedColor.bind(_this, fcolor)}>
                <span className = {'icon icon-chevron-right ' +
                  (_this.state.color === fcolor ? 'green' : 'hovershow')}/>
                <span className = "icon icon-color-sampler" style={{color: fcolor}}/>{fcolor}
              </li>
            })
          }

          <li className = "selectable"
            onClick = {_this.chooseColor.bind(_this, null)}>
            <span className = {'small icon icon-chevron-right ' +
              ((_this.state.colorAttr === null && _this.state.color === null) ? 'green' : 'hovershow')}/>
            <span className = "icon icon-color-sampler"/>
            No cell color
          </li>

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
