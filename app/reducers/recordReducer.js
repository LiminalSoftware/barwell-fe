import _ from "underscore"
import update from 'react/lib/update'

const DELIMITER = '\u2661'

const initialState = {}

const modelInitialState = {
  _pk: null,
  deleted: {},
  byKey: {},
}

const create = (state = modelInitialState, action) => {
  const updates = action.data instanceof Array ? action.data : [action.data]
  const key = state._pk
  const patch = _.indexBy(updates, key)

  return Object.assign({}, state, {
    deleted: state.deleted,
    byKey: Object.assign({}, state.byKey, patch)
  })
}

const destroy = (state = modelInitialState, action) => {
  const updates = action.data instanceof Array ? action.data : [action.data]
  const key = state._pk
  const patch = _.indexBy(updates, key)

  return Object.assign({}, state, {
    deleted: Object.assign({}, state.deleted, patch),
    byKey: _.omit(state.byKey, updates.map(obj => obj[key]))
  })
}


export default (state = initialState, action) => {
  const {modelId, type,} = action
  switch (type) {
    case 'RECORD_CREATE':
      return Object.assign({}, state, {
        [modelId]: create (state[modelId], action)
      })
      break;
    case 'WORKSPACE_RECEIVE': {
      const models = action.data.models
      return _.indexBy(
        models.map( m=>({modelId: m.model_id, _pk: m._pk, byKey:{} }) ),
        modelId
      )
      }
      break;
    case 'MODEL_CREATE': {
      const models = action.data.models
      return _.indexBy(
        models.map(m=> ({modelId: m.model_id, _pk: m._pk, byKey:{} }) ),
        modelId
      )
      }
      break;
    case 'RECORD_DESTROY':
      return state
      return Object.assign({}, state, {
        [modelId]: destroy (state[modelId], action)
      })
      break;
    default:
      return state
  }
}
