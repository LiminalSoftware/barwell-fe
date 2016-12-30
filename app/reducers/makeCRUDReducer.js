import _ from "underscore"
import update from 'react/lib/update'

const DELIMITER = '\u2661'

/*
 *  This function returns a reducer for actions of type @name
 */

export default ({
  name,
  key=(name + '_id').toLowerCase(),
  indexes=[]
}) => {
  name = name.toUpperCase()

  /*
   *  Define an initial state object
   */
  const initialState = {
    deleted: {},
    byCid: {},
    byKey: {},
    indexes: Object.assign.apply(null, [{}].concat(indexes.map(idx =>{
        return {[idx.components.sort().join(DELIMITER)]: {}};
    })))
  }

  /*
   *  Define reducers for each action type, store them in an object keyed by
   *  action type
   */
  const actionTypeReducers = {
    [name + '_RECEIVE']: (state, action) => ({
      deleted: state.deleted,
      byCid: _.indexBy(action.data, 'cid'),
      byKey: _.indexBy(action.data, key),
      indexes: Object.assign.apply(null, [{}, ...indexes.map(idx => {
          // the key should be sorted
          const indexKey = idx.components.sort()
          // a string version of the index will serve as object key
          const indexKeyStr = indexKey.join(DELIMITER)
          // return the index; indices will be consolidated by obj.assign
          return {[indexKeyStr]: _.indexBy(
            action.data,
            // extract the keys in order and join them with a special delimiter
            obj => indexKey.map(k => obj[k]).join(DELIMITER)
          )};
        })]
      )
    }),
    [name + '_CREATE']: (state, action) => {
      const updates = action.data instanceof Array ? action.data : [action.data]
      const patch = _.indexBy(updates, key)
      return Object.assign({}, state, patch)
    },
    [name + '_DESTROY']: (state, action) => {
      const key = action.data[key]
      const obj = Object.assign({}, state[key], {_destroy: true})
      let newState = _.omit(state, key)
      newState.__deleted = Object.assign({key: obj}, state.__deleted)
    }
  }

  return (state = initialState, action) => {
    console.log('action called: ' + action.type)
    const reducer = actionTypeReducers[action.type]
    if (reducer) return reducer (state, action)
    else return state
  }
}
