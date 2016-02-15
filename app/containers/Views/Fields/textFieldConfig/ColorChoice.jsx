import React from "react"
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import AttributeStore from "../../../../stores/AttributeStore"

var blurOnClickMixin = require('../../../../blurOnClickMixin')

var ColorChoice = React.createClass({

  mixins: [blurOnClickMixin],

  getInitialState: function () {
    return {
      colorAttr: this.props.config.colorAttr,
      color: this.props.config.color,
      adjustColor: !(this.props.config.adjustColor === false),
      open: false
    }
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({colorAttr: this.props.config.colorAttr})
  },

  commitChanges: function (colProps) {
		var view = this.props.view
		var column_id = this.props.config.column_id
		var col = view.data.columns[column_id]

		col = _.extend(col, colProps)
		view.data.columns[column_id] = col;

    colProps.open = false
    this.setState(colProps)
		modelActionCreators.createView(view, true, true)
	},

  chooseColor: function (attributeId) {
    this.commitChanges({colorAttr: attributeId, color: null})
    this.setState({open: false})
  },

  chooseFixedColor: function (color) {
    this.commitChanges({colorAttr: null, color: color})
    this.setState({open: false})
  },

  handleAdjustCheck: function () {
    this.commitChanges({adjustColor: !this.state.adjustColor})
  },

  render: function () {
    var _this = this
    var view = this.props.view
    var colorAttrs = AttributeStore.query({type: 'COLOR', model_id: view.model_id})

    return <span
        className={"pop-down clickable icon icon-tl-brush "
          + (this.state.open ? " open" : (this.state.colorAttr || this.state.color ? " active" : ""))}
        onClick = {this.handleOpen}>
        {
          this.state.open ? <ul className = "pop-down-menu" style = {{
            top: "100%"
          }}>

          <span className = "pop-down-pointer-outer"/>
          <span className = "pop-down-pointer-inner"/>

          {
            colorAttrs.length > 0 ?
            <li className="bottom-divider">
              Conditional
            </li>
            :
            null
          }



          {
          colorAttrs.map(function (attr) {
            return <li key = {attr.attribute_id}
              onClick = {_this.chooseColor.bind(_this, attr.attribute_id)}
              >
              <span className = {'small icon icon-geo-circle ' +
                (_this.state.colorAttr === attr.attribute_id ? 'green' : 'hovershow')}/>
              <span className = "icon icon-tl-tint  ">
              </span>
              {attr.attribute}
            </li>
          })
          }

          <li className = {colorAttrs.length > 0 ? "top-divider" : ""}>
            Fixed color
          </li>
          {
            ['red','orange','yellow','green','blue','violet'].map(function (fcolor) {
              return <li className = ""
                onClick = {_this.chooseFixedColor.bind(_this, fcolor)}>
                <span className = {'small icon icon-geo-circle ' +
                  (_this.state.color === fcolor ? 'green' : 'hovershow')}/>
                <span className = "icon icon-tl-tint" style={{color: fcolor}}/>{fcolor}
              </li>
            })
          }

          <li className = ""
            onClick = {_this.chooseColor.bind(_this, null)}>
            <span className = {'small icon icon-geo-circle ' +
              ((_this.state.colorAttr === null && _this.state.color === null) ? 'green' : 'hovershow')}/>
            <span className = "icon icon-tl-forecolour"/>
            No cell color
          </li>

          <li className = "top-divider">
          Auto-lighten colors: <input type="checkbox"
            onChange = {_this.handleAdjustCheck}
            checked = {_this.state.adjustColor} />
          </li>


        </ul> : null
        }
    </span>;
  }
})

export default ColorChoice
