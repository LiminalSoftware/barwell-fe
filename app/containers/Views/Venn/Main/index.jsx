import React from "react"
import ReactDOM from "react-dom"
import _ from 'underscore'
import $ from 'jquery'

import util from '../../../../util/util'

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"

import ModelStore from "../../../../stores/ModelStore"
import KeyStore from "../../../../stores/KeyStore"
import ViewStore from "../../../../stores/ViewStore"
import KeycompStore from "../../../../stores/KeycompStore"
import AttributeStore from "../../../../stores/AttributeStore"
import FocusStore from "../../../../stores/FocusStore"

import ViewConfigStore from "../../../../stores/ViewConfigStore"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

import fieldTypes from "../../fields"


var VennPane = React.createClass ({
	render: function () {
		
		return <div className = "model-panes">
			<div className="view-body-wrapper">
				the diagram goes here!
			</div>
		</div>
	}
})

export default VennPane
