import _ from "underscore"
import React from "react"
import ViewStore from "../../stores/ViewStore"
import styles from "./style.less"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"
import util from "../../util/util"

import blurOnClickMixin from '../../blurOnClickMixin'

var ViewTypeMenu = React.createClass({

  mixins: [blurOnClickMixin],

  getInitialState: function () {
    return {
      open: false,
      type: this.props.type
    }
  },

  handleClickType: function (type) {
    this.setState({type: type, open: false})
  },

	render: function () {
    var _this = this
    if (!this.props.editing)
      return <span className = {"large icon view-icon " + (this.props.deleting ? ' red ' : '') + viewTypes[this.state.type].icon}/>
    return <span className = "wide icon view-icon">
        <span className = {"pop-down large icon " + viewTypes[this.state.type].icon
          + (this.state.open ? " open " : " ")}
          onClick = {this.handleOpen}>

        {
        this.state.open ?
        <ul className = "pop-down-menu">
    			{_.map(viewTypes, function (type, typeKey) {
            return <li className = "border-bottom"
              onClick = {_this.handleClickType.bind(_this, typeKey)}
              key ={typeKey}>
              <span className = {"small icon icon-geo-circle " +
                (typeKey === _this.state.type ? 'green' : 'hovershow')}/>
              <span className = {"icon view-icon " + type.icon}/>
              {type.type}
            </li>
          })
          }
    		</ul>
        : null
        }
      </span>
    </span>


	}
})

export default ViewTypeMenu
