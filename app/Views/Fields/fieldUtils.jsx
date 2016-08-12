import modelActionCreators from "../../actions/modelActionCreators"
import tinycolor from "tinycolor2"
import _ from "underscore"

const MIN_LIGHTNESS = 0.85

/*
 * executes each styler function and merges the results into a single object
 */

export function getStyles (stylers, config, object) {
	config = config || {}
	object = object || {}

	if (!(stylers instanceof Array) || stylers.length === 0) return {}
	
	let styles = Object.assign(...(stylers.map(s=>s(config, object))) )

	return styles
}

export  function getBgColor (config, object, isNull, isSelected) {
	let bg = null;
	let cellStyle = {};
	const conditional = (!config.colorConditionAttr || object['a' + config.colorConditionAttr])

	if (isNull) bg = null;
	else if (isSelected) bg = "white";
	else if (config.color && conditional) bg = config.color;
	else if (config.colorAttr && conditional) bg = object['a' + config.colorAttr];

	if (bg) {
		let c = tinycolor(bg);
		let hsl = c.toHsl();
		if (config.adjustColor) hsl.l = 
			Math.max(hsl.l, MIN_LIGHTNESS);
		else if (c.isDark()) cellStyle.color = 'white';
		cellStyle.background = tinycolor(hsl).toRgbString();
	}
	return cellStyle;
}

export function setListenersOnUpdate (nextProps, nextState) {
	var state = this.state
	if (!state.editing && nextState.editing) {
		addEventListener('keyup', this.handleKeyPress)
	}
	else if (state.editing && !nextState.editing) {
		removeEventListener('keyup', this.handleKeyPress)
	}
}

export function removeListenersOnUnmount () {
	removeEventListener('keyup', this.handleKeyPress)
}

/*
 * simple get initial state method to populate the value
 */

export function getInitialValueState () {
	return {
		value: this.format ? 
			this.format(this.props.value) : 
			this.props.value
	}
}

/*
 * updates the value stored in state with one passed down in props, but only
 * if the cell is not currently being edited
 */
export function updateValueWithProps (nextProps) {
	if (!this.state.editing)
		this.setState({value: this.format ? this.format(nextProps.value) : nextProps.value})
}


/*
 * takes parameter @value and commits it (appending @extras to the action)
 */
export function commitValue (value, extras) {
	var config = this.props.config;
	var column_id = config.column_id;
	var model = this.props.model;
	var selector = this.props.selector;
	var patch = {};

	extras = extras || {};

	extras._previous = {[column_id]: this.props.value};

	if (this.parser) value = this.parser(value)
	value = this.validator(value)
	this.setState({value: value})
	patch[column_id] = value
	
	// I don't think we want this behavior yet...
	// if (this.props.isNull) modelActionCreators.insertRecord(model, _.extend(patch, selector, 0))
	// else 
	if (this.props._recordCommit) _recordCommit(patch)
	else if (this.props.recordPatch) modelActionCreators.multiPatchRecords(model, _.extend(patch, selector), extras)
	else if (selector) modelActionCreators.patchRecords(model, patch, selector, extras)
	
	if (this.revert) this.revert();
}

/*
 * takes the values from the input element and commits it
 */
export function commitChanges () {
	var value = this.validator(this.parser(this.props.value))
	this.setState({open: false});
	if (!this.state.editing) return;
	this.commitValue(this.state.value)
}

export default {
	getStyles,
	getBgColor, 
	setListenersOnUpdate,
	removeListenersOnUnmount,
	getInitialValueState, 
	updateValueWithProps, 
	commitValue, 
	commitChanges
}