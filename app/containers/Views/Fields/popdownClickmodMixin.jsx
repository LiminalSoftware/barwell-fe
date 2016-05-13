var popdownClickmodMixin = {
	handleClick: function (e) {
		if (this.props._blurSiblings) this.props._blurSiblings();
		if (this.props._handleConfigClick) {
			this.props._handleConfigClick(e);
			this.setState({context: true})
		} else this.handleOpen(e);
	}
}

export default popdownClickmodMixin;