import _ from "underscore"
import update from 'react/lib/update'

const DELIMITER = '\u2661'

/*
 *  This function returns a reducer for actions of type @name
 */

export default ({
  name,
  key=(name + '_id').toLowerCase(),
  nameField=name,
  indexes=[],
  addlReducers={}
}) => {
  name = name.toUpperCase()

  /*
   *  Define an initial state object
   */
  const initialState = {
    deleted: {},
    byKey: {},
    indexes: Object.assign.apply(null, [{}].concat(indexes.map(idx =>{
        return {[idx.components.sort().join(DELIMITER)]: {}};
    })))
  }

  /*
   *  Define reducers for each action type, store them in an object keyed by
   *  action type
   */
   const deleteReducer = (state, action) => {
     const deletes = action.data instanceof Array ? action.data : [action.data]
     const deleteKeys = deletes.map(el => el instanceof Object ? el[key] : el)

     return  Object.assign({}, state, {
       byKey: _.omit(state.byKey, deleteKeys)
     })
   }

   const receiveReducer = (state, action) => ({
     deleted: state.deleted,
     byKey: _.indexBy(action.data[(name + 's').toLowerCase()], key),
     indexes: Object.assign.apply(null, [ {},
       ...Object.keys(indexes).map(idx => {
         const options = indexes[idx]
         // the key should be sorted
         const indexKey = idx.split(',').sort()
         // a string version of the index will serve as object key
         const indexKeyStr = indexKey.join(DELIMITER)
         // return the index; indices will be consolidated by obj.assign
         return {[indexKeyStr]: _.indexBy(
           action.data,
           // extract the keys in order and join them with a special delimiter
           obj => indexKey.map(k => obj[k]).join(DELIMITER)
         )};
    })] )
  })
  const createReducer = (state, action) => {
    const updates = action.data instanceof Array ? action.data : [action.data]
    const patch = _.indexBy(updates, key)
    return Object.assign({}, state, {
      byKey: Object.assign({}, state.byKey, patch)
    })
  }

  const renameReducer = (state, action) => {
    const existing = state.byKey[action[key]]
    const patch = {
      [key]: action[key],
      [nameField]: action[nameField]
    }
    const renamed = Object.assign({}, existing, patch)
    return createReducer(state, {data: renamed})
  }

  const actionTypeReducers = Object.assign({
    ['WORKSPACE_RECEIVE']: receiveReducer,
    [name + '_CREATE']: createReducer,
    [name + '_RENAME']: renameReducer,
    [name + '_DESTROY']: deleteReducer,
  }, addlReducers)

  return (state = initialState, action) => {
    const reducer = actionTypeReducers[action.type]
    if (reducer) return reducer (state, action)
    else return state
  }
}
