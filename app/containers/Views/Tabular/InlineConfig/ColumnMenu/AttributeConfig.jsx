import React from "react";

import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../../fields";

import AttributeStore from "../../../../../stores/AttributeStore";
import constant from '../../../../../constants/MetasheetConstants'
import util from "../../../../../util/util"

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"

import PureRenderMixin from 'react-addons-pure-render-mixin';
import blurOnClickMixin from '../../../../../blurOnClickMixin';
import configCommitMixin from '../../../Fields/configCommitMixin';
import popdownClickmodMixin from '../../../Fields/popdownClickmodMixin';

var AttributeConfig = React.createClass({

	partName: 'AttributeConfig',

	classes: 'popdown-borderless',
  
  	mixins: [blurOnClickMixin, popdownClickmodMixin, configCommitMixin],

  	getInitialState: function () {
  		return {}
  	},

  	// HANDLERS =================================================================

  	handleMakeLabel: function () {
  		var model = _.clone(this.props.model)
  		var config = this.props.config
  		model.label_attribute_id = config.attribute_id
  		modelActionCreators.updateModel(model)
  	},

	// RENDER ===================================================================

	getIcon: function () {
		return ' icon icon-cog'
	},

	renderMenu: function() {
		return <div className = "popdown-section">
			
		    <div className = "popdown-item bottom-divider title">Alter Attribute</div>
		    <div className = "popdown-item">
		    	<span className = "icon icon-stamp"/>
		    	Default value: <input value = ""/>
		    </div>
		    <div className = "popdown-item selectable" onClick = {this.props._rename}>
		      	<span className = "icon icon-pencil"/>Rename attribute
		    </div>
		    <div className = "popdown-item selectable"><span className = "icon icon-tag"/>Use this attribute as label</div>
		    <div className = "popdown-item selectable" onClick = {this.props._handleDelete}>
		      	<span className = "icon icon-cross-circle"/>Delete this attribute
		    </div>
		    
	    </div>;
	}
});

export default AttributeConfig;
