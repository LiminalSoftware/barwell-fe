import React from "react"
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"

var blurOnClickMixin = require('../../../../blurOnClickMixin')

import PopDownMenu from '../../../../components/PopDownMenu'

var TextChoice = React.createClass({

  mixins: [blurOnClickMixin],

  getInitialState: function () {
    var config = this.props.config
    return {
      textConditionAttr: config.textConditionAttr,
      bold: config.bold,
      italic: config.italic,
      open: false
    }
  },

  commitChanges: function (colProps) {
		var view = this.props.view
		var column_id = this.props.config.column_id
		var col = view.data.columns[column_id]

		col = _.extend(col, colProps)
		view.data.columns[column_id] = col;

    this.setState(colProps)
		modelActionCreators.createView(view, true, true)
	},

  choosetextConditionAttr: function (attributeId) {
    this.commitChanges({textConditionAttr: attributeId, bold: false})
  },

  chooseBoldStyle: function () {
    this.commitChanges({bold: true})
    this.setState({open: false})
  },

  chooseNoStyle: function () {
    this.commitChanges({bold: false})
    this.setState({open: false})
  },

  render: function () {
    var _this = this
    var view = this.props.view
    var boolAttrs = AttributeStore.query({type: 'BOOLEAN', model_id: view.model_id})

    return <span className={"pop-down clickable icon "
          + (this.state.boldAttr ? " icon-bold " : " icon-text-format ")
          + (this.state.open ? " open " : (this.state.italic || this.state.bold ? " active" : ""))}
        onClick = {this.handleOpen}>
        {
          this.state.open ? <PopDownMenu>
          {
          boolAttrs.length > 0 ?
            <li className = "bottom-divider" >
              Condition
            </li>
            :
            null
          }

          {
          boolAttrs.map(function (attr) {
            return <li key = {attr.attribute_id} className = "selectable"
              onClick = {_this.choosetextConditionAttr.bind(_this, attr.attribute_id)}>
              <span className = {'icon icon-chevron-right ' +
                (_this.state.boldAttr === attr.attribute_id ? 'green' : 'hovershow')}/>
              <span className = "icon icon-check-square"/>
              {attr.attribute}
            </li>
          })
          }

          {
          boolAttrs.length > 0 ?
            <li className = "bottom-divider selectable"
              onClick = {_this.choosetextConditionAttr.bind(_this, null)}>
              <span className = {'icon icon-chevron-right ' +
                (!_this.state.textConditionAttr ? 'green' : 'hovershow')}/>
              <span className = "icon icon-square"/>
              No Condition
            </li>
            :
            null
          }


          <li className = "bottom-divider" >
            Font style
          </li>

          <li className = "selectable" onClick = {_this.chooseBoldStyle}>
            <span className = {'icon icon-chevron-right ' +
              (_this.state.bold ? 'green' : 'hovershow')}/>
            <span className = "icon icon-bold"/>
            Bold text
          </li>

          <li className = "selectable" onClick = {_this.chooseNoStyle.bind(_this, null)}>
            <span className = {'icon icon-chevron-right ' +
              (!_this.state.bold ? 'green' : 'hovershow')}/>
            <span className = "icon icon-text-format"/>
            No font style
          </li>

        </PopDownMenu> : null
        }
    </span>;
  }
})

export default TextChoice
