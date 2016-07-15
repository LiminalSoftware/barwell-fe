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
  
  	mixins: [blurOnClickMixin, popdownClickmodMixin, configCommitMixin],

  	getInitialState: function () {
  		return {}
  	},

	// RENDER ===================================================================

	getIcon: function () {
		return ' icon icon-cog'
	},

	renderMenu: function() {
		return <div className = "popdown-section">
			<div className = "popdown-section">
		      <div className = "popdown-item bottom-divider title">Alter Attribute</div>
		      <div className = "popdown-item"><span className = "icon icon-stamp"/>Default value: <input value = ""/></div>
		      <div className = "popdown-item selectable"><span className = "icon icon-share2"/>Make this format default for this attribute</div>
		      <div className = "popdown-item selectable"><span className = "icon icon-label"/>Use this attribute as label</div>
		      <div className = "popdown-item selectable"><span className = "icon icon-cross-circle"/>Delete this attribute</div>
		    </div>
	    </div>;
	}
});

export default AttributeConfig;
