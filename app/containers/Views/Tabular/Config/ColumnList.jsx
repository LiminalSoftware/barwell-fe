import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../fields"

import ViewStore from "../../../../stores/ViewStore"
import ModelStore from "../../../../stores/ModelStore"
import AttributeStore from "../../../../stores/AttributeStore"
import KeyStore from "../../../../stores/KeyStore"
import KeycompStore from "../../../../stores/KeycompStore"

import ColumnDetail from './ColumnDetail'
import modelActionCreators from "../../../../actions/modelActionCreators.jsx"
import groomView from '../../groomView'

import PureRenderMixin from 'react-addons-pure-render-mixin';

var ColumnList = React.createClass({

	mixins: [PureRenderMixin],

	render: function() {
		var _this = this
		var view = this.props.view
		var data = this.props.data
		var columns = data.columns

		return <ul className="detail-table">
			{
        (data.columnList || []).map(function (col) {
    			return <ColumnDetail
            key = {"detail-" + col.attribute_id}
            config = {col} view= {view}
            {..._this.movableProps} />
    		})
      }
		</ul>

	}
});

export default ColumnList;
