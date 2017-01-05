import store from "../stores/reduxStore"
import _ from "underscore"
import update from 'react/lib/update'

export default (state = [], action) => {
  // only record actions that include a "logged" flag
  if (!action.logged) return state
  state.push({
    action: action,
    prevState: store.getState().data
  })
  return state
}
