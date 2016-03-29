import React from "react";
import { Link } from "react-router";

import ColumnDetailMixin from './ColumnDetailMixin';

var ColumnDetailSingleton = React.createClass({
	mixins: [ColumnDetailMixin]
});

export default ColumnDetailSingleton;
