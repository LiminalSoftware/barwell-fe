import React from "react"
import _ from "underscore"
import modelActionCreators from "../../../actions/modelActionCreators"
import PopDownMenu from "../../../components/PopDownMenu"

import displayStyles from './displayStyles'
import configCommitMixin from '../configCommitMixin'
import blurOnClickMixin from "../../../blurOnClickMixin"

import popdownClickmodMixin from '../popdownClickmodMixin';

var NumberFormatChoice = React.createClass({

  partName: 'NumberFormatChoice',

  mixins: [blurOnClickMixin, configCommitMixin, popdownClickmodMixin],

  _timer: null,

  // LIFECYCLE ==============================================================

  getInitialState: function () {
    var config = this.props.config
    var format = config.displayStyle
    var formatAttr = this.parseFormatString(format)
    var custom = formatAttr.type === 'CUSTOM';

    return _.extend({
      formatString: config.formatString,
      open: false,
      custom: custom
    }, formatAttr);
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({align: this.props.config.align});
  },

  // HANDLERS ===============================================================

  handleFormatChange: function (e) {
    var value = e.target.value
    this.setState({formatString: value})
  },

  onBlur: function (event) {
    var config = this.props.config
    var view = this.props.view
    var column_id = config.column_id
    var data = view.data
    var col = data.columns[column_id]

    col.formatString = this.state.formatString
    modelActionCreators.createView(view, false, true)
  },

  handleChooseCustom: function () {
    this.setState({custom: true})
  },

  chooseFormat: function (format, e) {
    this.commitChanges({
      custom: false,
      open: false,
      formatString: format.formatString
    });
  },

  setDecimalPlaces: function (length) {
    var format = this.parseFormatString(this.state.formatString);
    var decimalDigits = format.decimalDigits.slice(0,1);
    for (var i = 0; i < length; i++) decimalDigits += '0';
    format.decimalDigits = decimalDigits;
  },

  // UTILITY =================================================================

  parseFormatString: function (string) {
    var regex = /^([$€¥£])?\d(,\d)?([.,]\d+)?(%)?$/;
    var str, prefix, commaClause, decimalDigits, suffix;
    var hits = regex.exec(string);
    var format = {};

    if (hits) {
      [str, prefix, commaClause, decimalDigits, suffix] = hits;
      format.numDigits = decimalDigits ? (decimalDigits.length - 1) : 0;
      format.hasCommas = (commaClause === undefined)
      if (prefix !== undefined && suffix === undefined) {
        format.type = 'CURRENCY';
        format.currencySymbol = prefix;
      } else if (suffix === '%' && prefix === undefined) {
        format.type = 'PERCENTAGE';
      } else if (suffix === undefined && prefix === undefined) {
        format.type = 'DECIMAL';
      } else {
        format.type = 'CUSTOM'; 
      }
    }
    else format.type = 'CUSTOM';

    return format;
  },

  makeFormatString: function ({prefix, commaClause, decimalDigits, suffix}) {
    var formatString = '';
    if (prefix) formatString += prefix;
    formatString += '0';
    if (commaClause) formatString += commaClause;
    if (decimalDigits) formatString += decimalDigits;
    if (suffix) formatString += suffix;
    return formatString;
  },

  // RENDER =================================================================

  getPresetsMenu: function () {
    var _this = this
    var config = this.props.config
    var format = config.displayStyle
    var formatAttr = this.parseFormatString(config.formatString)

    return <div className = "popdown-section" key = "presets">
      <li className="popdown-item title bottom-divider">
        Numeric Format
      </li>
      {
      _.map(displayStyles, function (ds, k) {
        return <li 
          key = {ds.displayStyle} 
          className = {"popdown-item selectable " + 
          (formatAttr.type === k ? 'menu-selected' : '')}
          onClick = {_this.chooseFormat.bind(_this, ds)}>
          <span className = {"icon " + ds.icon}/>
          {ds.description}
        </li>
      })
      }

      <li key="format-header" className = {"popdown-item  top-divider " +
        (this.state.custom ? ' menu-selected' : '')}
        onClick = {this.handleChooseCustom}>
        <span className="icon icon-code"/>
        Custom:
        {
          this.state.custom ?
            <input
              type = "text"
              style = {{textAlign: 'center', width: '120px'}}
              className = "popdown-item menu-input text-input" 
              value = {this.state.formatString}
              onBlur = {this.onBlur}
              onChange = {_this.handleFormatChange}/> 
            : null
          }
      </li>
    </div>
  },

  getCustomMenu: function () {
    var _this = this
    var config = this.props.config
    var format = config.displayStyle
    var formatAttr = this.parseFormatString(config.formatString)

    return null;
    return <div className = "popdown-section" key="custom">
      <li className="popdown-item title bottom-divider">
        Customize
      </li>
      <li className  = "popdown-item">
        <span className = "clicklabel">Decimal places:</span>
        <span className = "clickbox icon icon-arrow-left"/>
        <span className = "clickbox">{formatAttr.numDigits}</span>
        <span className = "clickbox icon icon-arrow-right"/>
      </li>
      <li className  = "popdown-item">
        <span className = "clicklabel">Thousands separator:</span> 
        <span className={"clickbox " + (formatAttr.commaClause === undefined ? " clickbox-active " : "")}>none</span>
        <span className={"clickbox bold"  + (/[,]\d/.test(formatAttr.commaClause) ? " clickbox-active " : "")}>,</span>
        <span className={"clickbox bold"  + (/[.]\d/.test(formatAttr.commaClause) ? " clickbox-active " : "")}>.</span>
      </li>
      <li className  = "popdown-item">
        <span className = "clicklabel">Decimal mark:</span>
        <span className = "clickbox icon icon-arrow-left"/>
        <span className = "clickbox"></span>
        <span className = "clickbox icon icon-arrow-right"/>
      </li>
    </div>
  },

  renderMenu: function () {
    return [
      this.getPresetsMenu(),
      this.getCustomMenu()
    ];
  },

  getIcon: function () {
    var config = this.props.config
    var format = config.displayStyle
    var formatAttr = this.parseFormatString(config.formatString)
    var displayObj = displayStyles[formatAttr.type]
    return ' icon ' + displayObj.icon;
  },

  // render() inherited from popdownClickmodMixin
})

export default NumberFormatChoice
