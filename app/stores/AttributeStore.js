import makeFluxAdapter from "./makeFluxAdapter"

export default makeFluxAdapter('attributes', {
  indexes:{
    'model_id': {unique: false}
  }
})
