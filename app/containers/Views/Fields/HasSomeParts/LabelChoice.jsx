import React from "react"
import _ from "underscore"

import AttributeStore from "../../../../stores/AttributeStore"
import fieldTypes from "../../fields"

import PopDownMenu from '../../../../components/PopDownMenu'
import configCommitMixin from '../configCommitMixin'
import blurOnClickMixin from '../../../../blurOnClickMixin'

var LabelChoice = React.createClass({

  partName: 'LabelChoice',

  mixins: [blurOnClickMixin, configCommitMixin],

  getInitialState: function () {
    return {
      open: false
    }
  },

  handleLabelChange: function (label, e) {
    var config = this.props.config
    this.commitChanges({label: label})
  },
  
  render: function () {
    var _this = this
    var view = this.props.view
    var config = this.props.config

    return <span
        className={"pop-down clickable icon icon-bookmark2"}
        onMouseDown = {this.handleOpen}>
        {
        this.state.open ? <PopDownMenu>
          <li className = "bottom-divider">
              Item Label
          </li>
          {
          AttributeStore.query({model_id: config.related_model_id}).map(function (attr) {
            var fieldType = fieldTypes[attr.type]
            if (fieldType.canBeLabel) return <li 
              key = {attr.attribute_id} 
              className = "selectable"
              onClick = {_this.handleLabelChange.bind(_this, 'a' + attr.attribute_id)}>
              <span className = {'icon  icon-chevron-right ' +
                (config.label ===  ('a' + attr.attribute_id ) ? 'green' : 'hovershow')}/>
              {attr.attribute}
            </li>
          })}
        </PopDownMenu> : null
        }
    </span>;
  }
})

export default LabelChoice
