import React from "react";
import _ from "underscore";
import modelActionCreators from "../../../../actions/modelActionCreators";
import PopDownMenu from '../../../../components/PopDownMenu';
import configCommitMixin from '../configCommitMixin';
import blurOnClickMixin from '../../../../blurOnClickMixin';
import popdownClickmodMixin from '../popdownClickmodMixin';

import util from '../../../../util/util'

var AlignChoice = React.createClass({

  partName: 'AlignChoice',

  mixins: [blurOnClickMixin, popdownClickmodMixin, configCommitMixin],

  // LIFECYCLE ==============================================================

  getInitialState: function () {
    return {
      align: this.props.config.align,
      open: false
    }
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({align: this.props.config.align})
  },

  // HANDLERS ================================================================

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

  // RENDER ===================================================================

  renderMenu: function () {
    var _this = this;
    var config = this.props.config;
    var currentAlignment = config.align;
    return <div className = "popdown-section">
        <li className = "popdown-item bottom-divider title">Text Alignment</li>
        {
          ['left', 'center', 'right'].map(function (alignment) {
            return <li key = {alignment} onClick = {_this.align.bind(_this, alignment)} 
              className = {"popdown-item  selectable " + (alignment === currentAlignment ? ' menu-selected' : '')}>
              <span className = {"icon icon-text-align-" + alignment}/>
              Align {alignment}
            </li>
          })
        }
      </div>
  },

  render: function () {
    if (!!this.props.menuInline) return <div className = "menu-sub-item-boxed" onClick = {util.clickTrap}>
      {this.renderMenu()}
    </div>;
    else return <span
        className={"pop-down clickable icon icon-text-align-" + this.props.config.align}
        onClick = {this.handleClick}>
        {
        this.state.open ? <PopDownMenu {...this.props}>
          {this.renderMenu()}
        </PopDownMenu> : null
        }
        {
          this.state.context ? 
            <span className = {"pop-down-overlay icon icon-text-align-" + this.props.config.align}/> 
            : null
        }
    </span>;
  }
})

export default AlignChoice
