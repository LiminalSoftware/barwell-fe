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

var AttributeConfig = React.createClass({
	// RENDER ===================================================================

	render: function() {
		return <div className = "menu-sub-item-boxed"  onClick = {util.clickTrap}>
			<div className = "popdown-section">
		      <div className = "popdown-item bottom-divider title">Alter Attribute</div>
		      <div className = "popdown-item bottom-divider title">Alter Attribute</div>
		    </div>
	    </div>;
	}
});

export default AttributeConfig;
