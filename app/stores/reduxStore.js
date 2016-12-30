import { createStore, combineReducers } from 'redux'
import makeCRUDReducer from '../reducers/makeCRUDReducer'

const reducer = combineReducers({
  model: makeCRUDReducer({name: 'model'}),
  attribute: makeCRUDReducer({name: 'attribute'}),
  key: makeCRUDReducer({name: 'key'}),
  keycomp: makeCRUDReducer({name: 'keycomp'}),
  view: makeCRUDReducer({name: 'view'})
})

let store = createStore(reducer)

window._globalReduxStore = store

export default store
