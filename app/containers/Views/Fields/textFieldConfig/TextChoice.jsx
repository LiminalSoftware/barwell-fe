import React from "react"
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"

var blurOnClickMixin = require('../../../../blurOnClickMixin')

var TextChoice = React.createClass({

  mixins: [blurOnClickMixin],

  getInitialState: function () {
    return {
      boldAttr: this.props.config.boldAttr,
      bold: false,
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

  chooseBoldAttr: function (attributeId) {
    this.commitChanges({boldAttr: attributeId, bold: false})
    this.setState({open: false})
  },

  chooseAlwaysBold: function () {
    this.commitChanges({boldAttr: null, bold: true})
    this.setState({open: false})
  },

  render: function () {
    var _this = this
    var view = this.props.view
    var boolAttrs = AttributeStore.query({type: 'BOOLEAN', model_id: view.model_id})

    return <span className={"pop-down clickable icon "
          + (this.state.boldAttr ? " icon-tl-bold " : " icon-tl-text ")
          + (this.state.open ? " open" : (this.state.boldAttr ? " active" : ""))}
        onClick = {this.handleOpen}>
        {
          this.state.open ? <ul className = "pop-down-menu" style = {{
            top: "100%"
          }}>

          <span className = "pop-down-pointer-outer"/>
          <span className = "pop-down-pointer-inner"/>

          <li className = "bottom-divider" >
            Conditionally bold text
          </li>

          {
          boolAttrs.map(function (attr) {
            return <li key = {attr.attribute_id}
              onClick = {_this.chooseBoldAttr.bind(_this, attr.attribute_id)}
              >
              <span className = {'small icon icon-geo-circle ' +
                (_this.state.boldAttr === attr.attribute_id ? 'green' : 'hovershow')}/>
              <span className = "icon icon-checkbox-full"/>
              {attr.attribute}
            </li>
          })
          }

          <li className = "top-divider bottom-divider" >
            Fixed style
          </li>

          <li className = "" onClick = {_this.chooseAlwaysBold}>
            <span className = {'small icon icon-geo-circle ' +
              (_this.state.bold ? 'green' : 'hovershow')}/>
            <span className = "icon icon-tl-bold"/>
            Bold text
          </li>

          <li className = "" onClick = {_this.chooseBoldAttr.bind(_this, null)}>
            <span className = {'small icon icon-geo-circle ' +
              (_.isNull(_this.state.boldAttr) && !_this.state.bold ? 'green' : 'hovershow')}/>
            <span className = "icon icon-tl-text"/>
            No font style
          </li>

        </ul> : null
        }
    </span>;
  }
})

export default TextChoice
