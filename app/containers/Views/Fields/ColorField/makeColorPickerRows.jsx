import React from "react"
import _ from "underscore"
import tinycolor from "tinycolor2"
import util from '../../../../util/util'
import style from './style.less'

var makeColorPickerRows = function(current, handleChange) {
	var hue = util.sequence(0, 340, 12);
	var sat = [0.8, 0.6, 0.4, 0.3];
	var lit = [0.7, 0.5];
	
	var color = tinycolor.fromRatio({ }).toRgbString()
	
	return hue.map(function (h, idx) {
			var choices = []
			lit.forEach(function (l) {
				sat.forEach(function (s) {
					var color = tinycolor({h: h, s: s, l: l}).toRgbString();
					choices.push(<span key = {color} 
						className = "menu-choice menu-choice--color" style = {{background: color}}
						onClick = {handleChange}>
						{current === color ? <span className = "white icon color-check icon-check"/> : null}
					</span>)
				})
			})
			return <li key = {idx} className = "menu-row" >{choices}</li>
        });
	
	
}

export default makeColorPickerRows;