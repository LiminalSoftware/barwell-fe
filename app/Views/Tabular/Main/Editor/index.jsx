import React, { Component, PropTypes } from 'react'
import Column from './Column'

export default class Editor extends Component {

	static propTypes = {
		model: PropTypes.object,
		view: PropTypes.object
	}

	constructor (props) {
		super(props)
		this.state = {stage: 'mounting'}
	}

	getColumns () {
		var view = this.props.view 
		return view.columnList || []
	}

	render () {
		return <div className="wrapper-overlay flush">
			{this.getColumns().map(col=> 
				<Column {...this.props} column={col} stage={this.state.stage}/>
			)}
		</div>
	}
}