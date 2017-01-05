import _ from "underscore"
import update from 'react/lib/update'

export default (state = '', action) => {

  if (action.type === 'GET_FOCUS') console.log(action)
  if (action.type === 'GET_FOCUS') return action.focus
  else return state
}
