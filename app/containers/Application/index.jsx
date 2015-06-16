import React from "react";
import { RouteHandler } from "react-router";
import SideBar from "containers/SideBar";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"

export default class Application extends React.Component {
	render() {
		var { loading } = this.props;
		return <div className="application">
			<SideBar {...this.props} />
			<RouteHandler {...this.props} />
		</div>;
	}

	componentWillMount() {
		modelActionCreators.fetchModels()
	}
}