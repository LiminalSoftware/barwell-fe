import React from "react"
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"

var blurOnClickMixin = require('../../../../blurOnClickMixin')

var TextChoice = React.createClass({

  mixins: [blurOnClickMixin],

  getInitialState: function () {
    var config = this.props.config
    return {
      conditionAttr: config.conditionAttr,
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

  chooseConditionAttr: function (attributeId) {
    this.commitChanges({conditionAttr: attributeId, bold: false})
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
          + (this.state.boldAttr ? " icon-tl-bold " : " icon-tl-text ")
          + (this.state.open ? " open " : (this.state.italic || this.state.bold ? " active" : ""))}
        onClick = {this.handleOpen}>
        {
          this.state.open ? <ul className = "pop-down-menu" style = {{
            top: "100%"
          }}>

          <span className = "pop-down-pointer-outer"/>
          <span className = "pop-down-pointer-inner"/>

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
              onClick = {_this.chooseConditionAttr.bind(_this, attr.attribute_id)}>
              <span className = {'small icon icon-geo-circle ' +
                (_this.state.boldAttr === attr.attribute_id ? 'green' : 'hovershow')}/>
              <span className = "icon icon-checkbox-full"/>
              {attr.attribute}
            </li>
          })
          }

          {
          boolAttrs.length > 0 ?
            <li className = "bottom-divider selectable"
              onClick = {_this.chooseConditionAttr.bind(_this, null)}>
              <span className = {'small icon icon-geo-circle ' +
                (!_this.state.conditionAttr ? 'green' : 'hovershow')}/>
              <span className = "icon icon-checkbox-empty"/>
              No Condition
            </li>
            :
            null
          }


          <li className = "bottom-divider" >
            Font style
          </li>

          <li className = "selectable" onClick = {_this.chooseBoldStyle}>
            <span className = {'small icon icon-geo-circle ' +
              (_this.state.bold ? 'green' : 'hovershow')}/>
            <span className = "icon icon-tl-bold"/>
            Bold text
          </li>

          <li className = "selectable" onClick = {_this.chooseNoStyle.bind(_this, null)}>
            <span className = {'small icon icon-geo-circle ' +
              (!_this.state.bold ? 'green' : 'hovershow')}/>
            <span className = "icon icon-tl-text"/>
            No font style
          </li>

        </ul> : null
        }
    </span>;
  }
})

export default TextChoice
