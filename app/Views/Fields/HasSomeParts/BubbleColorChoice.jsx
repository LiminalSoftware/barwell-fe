import React from "react"
import _ from "underscore"

import AttributeStore from "../../../stores/AttributeStore"
import fieldTypes from "../../fields"

import PopDownMenu from "../../../components/PopDownMenu"
import configCommitMixin from '../configCommitMixin'
import blurOnClickMixin from "../../../blurOnClickMixin"
import popdownClickmodMixin from '../popdownClickmodMixin';

var BubbleColorChoice = React.createClass({

  partName: 'BubbleColorChoice',

  mixins: [blurOnClickMixin, configCommitMixin, popdownClickmodMixin],

  getInitialState: function () {
    var config = this.props.config
    return {
      open: false,
      bubbleColor: config.bubbleColor,
      adjustBubbleColor: config.adjustBubbleColor
    }
  },

  handleColorChoice: function (bubbleColor, e) {
    var config = this.props.config
    this.commitChanges({bubbleColor: bubbleColor})
  },

  handleAdjustCheck: function () {
    this.commitChanges({adjustBubbleColor: !this.state.adjustBubbleColor})
  },

  renderMenu: function () {
    var _this = this;
    var view = this.props.view;
    var config = this.props.config;

    return <div className = "popdown-section">
      <div className = "popdown-item title bottom-divider">
          Item Color
      </div>
      {AttributeStore.query({model_id: config.related_model_id, type: 'COLOR'}).map(function (attr) {
        return <div 
          key = {attr.attribute_id}
          className = {"selectable popdown-item" + 
            (config.bubbleColor ===  ('a' + attr.attribute_id ) ? ' menu-selected' : '')}
          onClick = {_this.handleColorChoice.bind(_this, 'a' + attr.attribute_id)}>
            <span className = 'icon icon-eye-dropper'/>
            {attr.attribute}
        </div>
      })}

      <div className = {"selectable popdown-item " + 
              (config.bubbleColor === null ? ' menu-selected' : '')}
        onClick = {_this.handleColorChoice.bind(_this, null)}>
        <span className = 'icon icon-square'/>
          Default color
      </div>
      <div className = "popdown-item top-divider">
      Auto-lighten colors: <input type="checkbox"
        onChange = {_this.handleAdjustCheck}
        checked = {_this.state.adjustColor} />
      </div>
    </div>
  },

  getIcon: function () {
    return "icon icon-brush2"
  }
  
  // render: function () {
  //   var _this = this
  //   var view = this.props.view
  //   var config = this.props.config

  //   return <span
  //       className={"pop-down clickable icon icon-brush2"}
  //       onMouseDown = {this.handleOpen}>
  //       {
  //       this.state.open ?  : null
  //       }
  //   </span>;
  // }
})

export default BubbleColorChoice
