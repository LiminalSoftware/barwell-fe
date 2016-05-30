import React from "react"
import _ from "underscore"

import AttributeStore from "../../../../stores/AttributeStore"
import fieldTypes from "../../fields"

import PopDownMenu from '../../../../components/PopDownMenu'
import configCommitMixin from '../configCommitMixin'
import blurOnClickMixin from '../../../../blurOnClickMixin'
import popdownClickmodMixin from '../popdownClickmodMixin';

var LabelChoice = React.createClass({

  partName: 'LabelChoice',

  mixins: [blurOnClickMixin, configCommitMixin, popdownClickmodMixin],

  getInitialState: function () {
    return {
      open: false
    }
  },

  handleLabelChange: function (label, e) {
    var config = this.props.config
    this.commitChanges({label: label})
  },

  renderMenu: function () {
    var _this = this;
    var view = this.props.view;
    var config = this.props.config;
    return <div className = "popdown-section">
      <div className = "popdown-item title bottom-divider">Item Label</div>
      {
      AttributeStore.query({model_id: config.related_model_id}).map(function (attr) {
        var fieldType = fieldTypes[attr.type]
        if (fieldType.canBeLabel) return <div 
          key = {attr.attribute_id}
          className = {"popdown-item selectable " + (config.label ===  ('a' + attr.attribute_id) ? ' menu-selected ' : '')}
          onClick = {_this.handleLabelChange.bind(_this, 'a' + attr.attribute_id)}>
          <span className = "icon icon-bookmark2"/>
          {attr.attribute}
        </div>
      })
      }
    </div>
  },
  
  getIcon: function () {
    return "icon icon-bookmark2";
  },

})

export default LabelChoice
