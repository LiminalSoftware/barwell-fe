import React, { Component, PropTypes } from 'react'
import Column from './Column'

export default class Editor extends Component {

	static propTypes = {
		model: PropTypes.object,
		view: PropTypes.object,
		_getRangeStyle: PropTypes.function
	}

	getInitialState () {
		return {
			state: 'mounting'
		}
	}

	getColumns () {
		return view.columnList
	}

	render () {
		return <div className="wrapper-overlay flush">
			{this.getColumns().map(col=> 
				<Column {...this.props} column={col}/>
			)}
		</div>
	}
}