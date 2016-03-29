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

  align: function (align) {
    this.commitChanges({align: align})
    this.handleBlur()
  },

  render: function () {
    var _this = this;
    var config = this.props.config;
    var currentAlignment = config.align;

    return <span
        className={"pop-down clickable icon icon-text-align-" + this.state.align}
        onMouseDown = {this.handleOpen}>
        {
        this.state.open ? <PopDownMenu {...this.props}>
          <li className = "bottom-divider">Text Alignment</li>
          {
            ['left', 'center', 'right'].map(function (alignment) {
              return <li key = {alignment} onClick = {_this.align.bind(_this, alignment)} 
                className = {"selectable " + (alignment === currentAlignment ? ' menu-selected' : '')}>
                <span className = {"icon icon-text-align-" + alignment}/>
                Align {alignment}
              </li>
            })
          }
        </PopDownMenu> : null
        }
    </span>;
  }
})

export default AlignChoice
