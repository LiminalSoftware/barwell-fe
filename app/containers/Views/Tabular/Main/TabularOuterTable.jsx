

var TabularOuterTable = React.createClass ({
	render: function () {
		return <div className = "wrapper"
			style = {{
				left: 0,
				right: 0,
				top: 0,
				height: (rowCount * geo.rowHeight) + 'px',
				marginTop: marginTop + 'px'
			}}>

			<TabularTBody
				{...this.props}
				_handleDetail = {this.handleDetail}
				rowOffset = {rowOffset}
				ref="lhs"
				prefix = "lhs"
				hasRowLabel = {true}
				offsetCols = {0}
				fetchStart = {fetchStart}
				fetchEnd = {fetchEnd}
				focused = {focused}
				style = {{
					left: 0,
					top: 0,
					right: 0,
					bottom: 0
				}}
				columns = {view.data.fixedCols}/>
			</div>
		</div>
	}
})

export default TabularOuterTable