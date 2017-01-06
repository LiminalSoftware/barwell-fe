import { connect } from 'react-redux'
import ModelBar from './ModelBar'
import {
	sidebarToggleCollapseModel,
	renameView,
	deleteView,
	renameModel
} from "../../actions/modelActionCreators"
import _ from 'underscore'

const mapStateToProps = (state, ownProps) => {
	const {workspaceId, activeViewIds = []} = ownProps
	const {
		session: {
			sidebar: {modelOrder, collapsedModels, viewsByModel},
			focus
		},
		data: {models, views}
	} = state
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
						active: activeViewIds.includes("" + v.view_id),
						focused: v.view_id === focusedViewId,
						link: `/workspace/${workspaceId}/view/${v.view_id}`
					})))
			]
			}
		)
	)
	return {modelList, focus}
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
