import _ from "underscore"
import update from 'react/lib/update'

export default (state = {counter: 1}, action) => {
  if (action.type === 'CLAIM_UUID') return {counter: state.counter + 1}
  else return state
}
