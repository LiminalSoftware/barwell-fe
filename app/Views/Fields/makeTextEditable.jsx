import React, { Component } from 'react';

export default function makeTextEditable() {
	return function (DecoratedComponent) {
		return class EditableText extends Component
	}
}