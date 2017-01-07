import _ from "underscore"
import update from 'react/lib/update'

const initialState = {
  selected: {},
  modelId: null,
  selectAll: false
}

export default (state = initialState, action) => {
  const {key, newModelId} = action
  const {selected, oldModelId} = state
  switch (action.type) {
    case 'RECORD_TOGGLESELECT':
      if (oldModelId !== newModelId) return ({
        modelId: newModelId,
        selected: {[key]: true},
        selectAll: false
      })
      else return update(state, {
        selected: {$set: {[key]: selected[key]} }
      })
      break;
    case 'RECORD_CLEARSELECTION':
      return {
        selected: {},
        modelId: null,
        selectAll: false
      }
      break;
    case 'RECORD_SELECTALL':
      return {
        selected: selected,
        modelId: newModelId,
        selectAll: true
      }
      break;
    default:
      return state
  }
}
