function calculateStyle(column) {
	return {
		
	}
}

export default class Column extends Component {
	static propTypes = {
		view: PropTypes.object,
		column: PropTypes.object
	}
	
	render () {
		const column = this.props.column
		return <div className="view-reference-box" style={calcStyle(column)}>
			{column.name}
		</div>
	}
	
}