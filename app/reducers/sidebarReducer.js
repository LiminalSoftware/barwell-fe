import _ from "underscore"
import update from 'react/lib/update'

const initialState = {
  modelOrder: [],
  viewsByModel: {},
  collapsedModels: {}
}
/*
 *  note: we don't update the ordering in response to model/view creation
 *  only in response to actual reorderings--otherwise default to order by name
 */
export default (state = initialState, action) => {
  switch (action.type) {
    case 'SESSION_RECEIVE':
      return action.data.sidebar
      break;
    case 'SIDEBAR_TOGGLE_COLLAPSE_MODEL':
      return update(state, {collapsedModels:
        {[action.model_id]: {$apply: current => !current}}
      })
      break;
    case 'SIDEBAR_REORDER_MODEL':
      return update(state, {modelOrder: {$set: action.modelOrder}})
      break;
    case 'SIDEBAR_REORDER_VIEW':
      return update(state,
        {viewsByModel: {$merge: {[action.model_id]: action.viewOrder}}})
      break;
    default:
      return state
  }
}
