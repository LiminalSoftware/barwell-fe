import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../../fields"
import $ from 'jquery'

import constants from '../../../../../constants/MetasheetConstants'

import TypePicker from './TypePicker'

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"
import util from '../../../../../util/util'
import PureRenderMixin from 'react-addons-pure-render-mixin';


import ColumnDetailMixin from './ColumnDetailMixin';
import sortable from 'react-sortable-mixin';

var ColumnDetailListable = React.createClass({

	mixins: [sortable.ItemMixin, ColumnDetailMixin],

	dragRef: "grabber",

	singleton: false,

	minWidth: '500px',
	
	handleConfigClick: function (part, e) {
		this.props._showPopUp(part)
		util.clickTrap(e)
	},

});

export default ColumnDetailListable;
