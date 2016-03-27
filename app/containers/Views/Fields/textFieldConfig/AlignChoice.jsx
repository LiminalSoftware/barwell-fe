import React from "react";
import _ from "underscore";
import modelActionCreators from "../../../../actions/modelActionCreators";
import PopDownMenu from '../../../../components/PopDownMenu';
import configCommitMixin from '../configCommitMixin';
import blurOnClickMixin from '../../../../blurOnClickMixin';

var AlignChoice = React.createClass({

  partName: 'AlignChoice',

  mixins: [blurOnClickMixin, configCommitMixin],

  getInitialState: function () {
    return {
      align: this.props.config.align,
      open: false
    }
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({align: this.props.config.align})
  },

  toggleAlign: function (event) {
		var align = this.props.config.align
		if (align === 'left') align = 'center'
		else if (align === 'center') align = 'right'
		else align = 'left'
		this.commitChanges({align: align})
	},

  alignLeft: function () {
    this.commitChanges({align: "left"})
    this.handleBlur()
  },
  alignCenter: function () {
    this.commitChanges({align: "center"})
    this.handleBlur()
  },
  alignRight: function () {
    this.commitChanges({align: "right"})
    this.handleBlur()
  },

  render: function () {
    var align = this.state.align

    return <span
        className={"pop-down clickable icon icon-text-align-" + this.state.align}
        onMouseDown = {this.handleOpen}>
        {
        this.state.open ? <PopDownMenu {...this.props}>
          <li className = "bottom-divider">Text Alignment</li>
          <li onClick = {this.alignLeft} className = "selectable">
            <span className = "icon icon-text-align-left"/>
            Align left
          </li>
          <li onClick = {this.alignCenter} className = "selectable">
            <span className = "icon icon-text-align-center"/>
            Align center
          </li>
          <li onClick = {this.alignRight} className = "selectable">
            <span className = "icon icon-text-align-right"/>
            Align right
          </li>
        </PopDownMenu> : null
        }
    </span>;
  }
})

export default AlignChoice
