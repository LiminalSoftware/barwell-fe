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


	render: function () {
    if (!this.props.editing)
      return <span className = {"large icon view-icon " + viewTypes[this.state.type].icon}/>
    return <span className = "view-icon">
        <span className = "pop-down" onClick = {this.handleOpen}>
        <span className = {"large icon view-icon " + viewTypes[this.state.type].icon}/>
        <span className = "small icon icon-chevron-down"/>
        {
        this.state.open ?
        <ul className = "pop-down-menu">
    			{_.map(viewTypes, function (type) {
            return <li>
              <span className = {"large icon view-icon " + type.icon}/>
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
