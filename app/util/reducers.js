import ReactDOM from "react-dom"
import util from "./util"
import constants from '../constants/MetasheetConstants'

const reduceSum = function (prop, a, b) {
	return a[prop] + b[prop]
}

const reduceAverage = function (prop, a, b) {
	const aCount = a.count || 1
	const bCount = b.count || 1
	return (a[prop]aCount + b[prop]*bCount)/(aCount + bCount)
}

const reduceMaximum = function (prop, a, b) {
	return Math.max(a[prop], b[prop])
}

const reduceMinimum = function (prop, a, b) {
	return Math.min(a[prop], b[prop])
}

const reduceCount = function (prop, a, b) {
	const aCount = a.count || 1
	const bCount = b.count || 1
	return aCount + bCount
}

const reduceStdDev = function (prop, a, b) {
	const aCount = a.count || 1
	const bCount = b.count || 1
	return aCount + bCount
}


export {blurListeners, handleClick, addListeners, removeListeners, handleBlur, handleBlurKeyPress}