import React from "react"
import _ from "underscore"
import moment from "moment"

var DateValidatorMixin = {
  validator: function (input) {
    var config = this.props.config || {}
    var format = config.formatString || "YYYY-MM-DD";
    var date = moment(input, format)
    if (!date.isValid()) date = moment(input, "YYYY-MM-DD")
    return date.isValid() ? date : null
  },

  parser: function (input) {
		return input
	}
}

export default DateValidatorMixin
