// LIBS AND SUCH
import React, {Component} from "react"
import {pure} from "recompose"
import { Link } from "react-router"
import _ from "underscore"

// CONSTANTS
import viewTypes from '../../Views/viewTypes'

// COMPONENTS
import ViewLink from "./ViewLink"
import ModelContext from "./ModelContext"
import ViewAddContext from "./ViewAddContext"
import Dropdown from "../../components/Dropdown"
import Renameable from "../../components/Renameable"

// UTILS
import util from "../../util/util"

class ModelSection extends Component {

	constructor (props) {
		super(props)
		this.state = {
			editing: false,
			expanding: false,
			expanded: false,
		}
	}

	componentWillMount = () => {
		this._debounceSetMouseOver = _.debounce(this.setMouseOver, 150)
	}

	componentWillReceiveProps = (nextProps) => {
		const isCollapsed = this.props.model.collapsed
		const wasCollapsed = nextProps.model.collapsed
		if (isCollapsed && !wasCollapsed) {
			this.setState({expanding: true})
			if (this._timer) clearTimeout(this._timer)
			this._timer = setTimeout(this.setExpansionComplete, 200)
		} else if (!isCollapsed && wasCollapsed) {
			this.setState({expanding: true})
			if (this._timer) clearTimeout(this._timer)
			this._timer = setTimeout(this.setExpansionComplete, 200)
		}
	}

	setExpansionComplete = () => {
		this.setState({expanding: false})
	}

	componentDidUpdate = (oldProps, oldState) => {
		if (oldState.expanded !== this.state.expanded)
			this.props.calibrate()
	}

	// HANDLERS ===============================================================

	handleRename = () => {
		var model = this.props.model;
		if (this.state.renaming) return
		this.setState({
			editing: true,
			name: model.model
		})
	}

	handleClickExpand = (e) => {
		const _this = this
		if (this.state.expanded) return;
		this.setState({
			expanded: true,
			expanding: true
		})
		clearTimeout(this._overflowTimer)
		this._overflowTimer = setTimeout(f=>_this.setState({expanding: false}),200)
	}

	handleFocus = () => this.setState({focused: true})

	handleBlur = () => this.setState({focused: false})

	setMouseOver = (toggle) => this.setState({mouseover: toggle})

	handleMouseOver = () =>	this._debounceSetMouseOver(true)

	handleMouseOut = () => this._debounceSetMouseOver(false)

	// RENDER =================================================================


	render = () => {
		const _this = this
		const {onExpandClick, history, renameModel, renameView,
				model: {
					model_id: modelId,
					model: name,
					views: views,
					collapsed
			}} = this.props
		const {focused} = this.state

		return <div className="mdlbar-section"
			onFocus = {this.handleFocus}
			onBlur = {this.handleBlur}
			onMouseOver = {this.handleMouseOver}
			onMouseOut = {this.handleMouseOut}
			tabIndex={this.props.idx * 100}>

			<div className="model-link" onClick={this.handleClickExpand}>
				<span onClick={() => onExpandClick(modelId)}
					className={"section-expander " + (collapsed ? "" : "section-expander--open")}/>
				<span className="link-label ellipsis">
					<Renameable value={name} commit={renameModel.bind(null, modelId)}/>
				</span>

				<span className="spacer"/>
				{this.state.focused || this.state.mouseover ? <span>
					<Dropdown {...this.props}
						title="configure this model"
						onClick = {this.enterConfigMode}
						icon="icon-cog"/>
					<ViewAddContext {...this.props} idx={this.props.idx * 100}/>
					<ModelContext {...this.props}
						_parent = {this} direction = "left"/>
				</span> : null}
			</div>
			<div style={{
					maxHeight: collapsed ? 0 : (views.length * 40),
					overflow: (this.state.expanding || collapsed) ? "hidden" : "visible"
				}}
				className="model-view-list">
			<div>
			{views.map(v => <ViewLink
				renameView={renameView}
				key={v.view_id}
				view={v}
				history={history}/>)}
			</div>
			</div>
		</div>
	}
}

export default pure(ModelSection)
