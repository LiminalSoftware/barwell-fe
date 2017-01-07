import { connect } from 'react-redux'
import ModelBar from './ModelBar'
import { createSelector } from 'reselect'
import {
	sidebarToggleCollapseModel,
	renameView,
	deleteView,
	renameModel
} from "../../actions/modelActionCreators"
import _ from 'underscore'

const sidebarSelector = state => state.session.sidebar
const focusSelector = state => state.session.focus
const modelSelector = state => state.data.models
const viewSelector = state => state.data.views
const activeSelector = (_, props={}) => props.activeViewIds || []


const getSidebarState = createSelector(
	sidebarSelector, focusSelector, modelSelector, viewSelector, activeSelector,
	({modelOrder, collapsedModels, viewsByModel}, focus, models, views, active) => {
		const focusedViewId = "" + ((focus.match(/^v(\d+)/) || [])[1])
		const modelList = [
			// first extract the models in order from our modelOrder array
			...modelOrder,
			// any models not in there get tacked onto the end
			..._.keys(_.omit(models.byKey, modelOrder))
		].map( modelId =>
			Object.assign({},
				models.byKey[modelId],
				{
				collapsed: !!(collapsedModels[modelId]),
				views: [
					// similarly, get the views that have an order defined
					// ...(viewsByModel[modelId] || []),
					// then fill in any remaining views
					...(_.values(views.byKey)
						.filter(v => v.model_id === parseInt(modelId))
						.map(v => Object.assign({}, v, {
							active: active.includes("" + v.view_id),
							focused: v.view_id === focusedViewId,
							link: `/workspace/${v.workspace_id}/view/${v.view_id}`
						})))
				]
				}
			)
		)
		return {modelList, focus}
	})

const mapStateToProps = (state, ownProps) => {
	return Object.assign({}, ownProps, getSidebarState(state))
}

const mapDispatchToProps = {
  onExpandClick: sidebarToggleCollapseModel,
	renameView: renameView,
	renameModel: renameModel,
	deleteView: deleteView,
}

const ConnectedModelBar = connect(
  mapStateToProps,
  mapDispatchToProps
)(ModelBar)

export default ConnectedModelBar
