import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import subHeader from "./subHeader.less"

import _ from "underscore"

import modelActionCreators from '../../actions/modelActionCreators'
import MetasheetDispatcher from '../../dispatcher/MetasheetDispatcher'

import ModelStore from "../../stores/ModelStore"
import ViewStore from "../../stores/ViewStore"
import MetasheetConst from '../../constants/MetasheetConstants'

import viewTypes from '../Views/viewTypes'
import Notifier from '../Notifier'

var ModelContext = React.createClass ({


	render: function() {
		
		var model = this.props.model

		return <ul className = "context-menu">
			<li>Rename model</li>
			<li>Delete model</li>
		</ul>
	}
})

export default ModelContext
