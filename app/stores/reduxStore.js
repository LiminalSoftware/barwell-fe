import { createStore, combineReducers } from 'redux'
import makeCRUDReducer from '../reducers/makeCRUDReducer'
import recordReducer from "../reducers/recordReducer"
import focusReducer from "../reducers/focusReducer"
import cidReducer from "../reducers/cidReducer"
import actionReducer from "../reducers/actionReducer"
import sidebarReducer from "../reducers/sidebarReducer"
import selectionReducer from "../reducers/selectionReducer"

const reducer = combineReducers({
  actions: actionReducer,
  data: combineReducers({
    models: makeCRUDReducer({name: 'model'}),
    attributes: makeCRUDReducer({
      name: 'attribute',
      indexes: {
        'model_id': {unique: false}
      }
    }),
    keys: makeCRUDReducer({name: 'key'}),
    keycomps: makeCRUDReducer({name: 'keycomp'}),
    views: makeCRUDReducer({name: 'view'}),
    notifications: makeCRUDReducer({name: 'notification'}),
    // record: recordReducer,
  }),
  session: combineReducers({
    cidCounter: cidReducer,
    focus: focusReducer,
    sidebar: sidebarReducer,
    selection: selectionReducer
  })
})

let store = createStore(reducer)

// for debugging...
window._globalReduxStore = store

export default store
