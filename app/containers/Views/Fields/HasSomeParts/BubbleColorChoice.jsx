import React from "react"
import _ from "underscore"

import AttributeStore from "../../../../stores/AttributeStore"
import fieldTypes from "../../fields"

import PopDownMenu from '../../../../components/PopDownMenu'
import configCommitMixin from '../configCommitMixin'
import blurOnClickMixin from '../../../../blurOnClickMixin'

var BubbleColorChoice = React.createClass({

  partName: 'BubbleColorChoice',

  mixins: [blurOnClickMixin, configCommitMixin],

  getInitialState: function () {
    return {
      open: false
    }
  },

  handleColorChoice: function (bubbleColor, e) {
    var config = this.props.config
    this.commitChanges({bubbleColor: bubbleColor})
  },
  
  render: function () {
    var _this = this
    var view = this.props.view
    var config = this.props.config

    return <span
        className={"pop-down clickable icon icon-brush2"}
        onMouseDown = {this.handleOpen}>
        {
        this.state.open ? <PopDownMenu>
          <li className = "bottom-divider">
              Token Color
          </li>
          {AttributeStore.query({model_id: config.related_model_id}).map(function (attr) {
            if (attr.type === 'COLOR') return <li 
              key = {attr.attribute_id} 
              className = "selectable"
              onClick = {_this.handleColorChoice.bind(_this, 'a' + attr.attribute_id)}>
              <span className = {'icon  icon-chevron-right ' +
                (config.bubbleColor ===  ('a' + attr.attribute_id ) ? 'green' : 'hovershow')}/>
                <span className = 'icon icon-color-sampler'/>
                {attr.attribute}
            </li>
          })}
          <li className = "selectable"
            onClick = {_this.handleColorChoice.bind(_this, null)}>
            <span className = {'icon  icon-chevron-right ' +
              (config.bubbleColor ===  null ? 'green' : 'hovershow')}/>
            <span className = 'icon icon-color-sampler'/>
              Default color
          </li>
        </PopDownMenu> : null
        }
    </span>;
  }
})

export default BubbleColorChoice
