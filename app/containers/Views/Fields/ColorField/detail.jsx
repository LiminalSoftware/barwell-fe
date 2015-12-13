import React from "react"
// import styles from "./detailStyle.less"
import { Link } from "react-router"
// var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var ColorDetail = React.createClass({

	mixins: [PureRenderMixin],

	getInitialState: function () {
		return {}
	},

	render: function() {
    var model = this.props.model
    var view = this.props.view
		var hue = [0, .1, .2, .3, .4, .5, .6, .7, .8, .9]
		var sat = 0.5
		var lit = [.3, .5, .7, .8]

		return <div>
			<div className = "header-label">Color picker</div>
			{hue.map(function (h) {
				return <div className = "color-row">
					{lit.map(function (l) {
						return <span className = "color-choice"
							style = {{background: 'hsl(' + [h * 360,
							sat * 100 + '%', l * 100 + '%'].join(',') + ')'}}></span>
					})}
				</div>
			})}
		</div>
	}
});

export default ColorDetail
