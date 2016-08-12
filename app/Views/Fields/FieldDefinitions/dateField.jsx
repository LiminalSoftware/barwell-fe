
const format = function (value, _config) {
	var config = _config || this.props.config || {}
	var format = config.formatString || "DD MMMM YYYY";
	var dateObj = moment(value);
	var prettyDate = dateObj.isValid() ? dateObj.format(format) : '';
	return prettyDate
}

const validator = function (input) {
	var config = this.props.config || {}
	var format = config.formatString || "YYYY-MM-DD";
	var date = moment(input, format)
	if (!date.isValid()) date = moment(input, "YYYY-MM-DD")
		return date.isValid() ? date : null
}

parser = function (input) {
	return input
}

var dateField = {

	detail: DatePicker,

	sortable: true,

	defaultDefault: null,

	defaultWidth: 100,
	
	defaultAlign: 'center',

	sortIcon: 'sort-time-',

	category: 'Dates and Times',

	description: 'Date',

	icon: 'calendar-31',

	stringify: function (value) {
		var val = moment(value)
		if (val.isValid()) return val.toISOString()
		else return null
	},

	configCleanser: function (config) {
		config.formatString = config.formatString || "MM/DD/YYYY"
		return config
	},

	configParts: [
		AlignChoice, 
		ColorChoice, 
		TextChoice, 
		DateConfig
	],

	element: React.createClass({

		mixins: [editableInputMixin, bgColorMixin, commitMixin, selectableMixin, keyPressMixin],

		format: function (value, _config) {
			var config = _config || this.props.config || {}
			var format = config.formatString || "DD MMMM YYYY";
			var dateObj = moment(value);
			var prettyDate = dateObj.isValid() ? dateObj.format(format) : '';
			return prettyDate
		},

		validator: function (input) {
			console.log('date validator')
			var config = this.props.config || {}
			var format = config.formatString || "YYYY-MM-DD";
			var date = moment(input, format)
			if (!date.isValid()) date = moment(input, "YYYY-MM-DD")
				return date.isValid() ? date : null
		},

		parser: function (input) {
			return input
		},

		detailIcon: 'icon-calendar-31',

	})

}

export default dateField;
