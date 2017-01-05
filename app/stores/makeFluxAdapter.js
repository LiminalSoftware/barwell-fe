import _ from 'underscore'
import util from '../util/util'
import store from "./reduxStore"

const comparators = {
  gt:  (a,ref) => (a > ref),
  lt:  (a,ref) => (a < ref),
  lte: (a,ref) => (a <= ref),
  gte: (a,ref) => (a >= ref),
  ne:  (a,ref) => (a != ref),
  eq:  (a,ref) => (a == ref),
  startswith: (a,ref) => (String(a).toLowerCase().indexOf(ref) == 0),
  contains: (a,ref) => (String(a).toLowerCase().indexOf(ref) >= 0)
}

const makeSortFunc = function (sortSpec = []) {
  return function (a, b) {
    for (var i = 0; i <  sortSpec.length; i++) {
      var el = sortSpec[i]
      if (a[el] > b[el]) return 1
      else if (a[el] < b[el]) return -1
    }
    return 0
  }
}

const makeFilterFunc = function (filterSpec = {}) {
  const tests = (Object.keys(filterSpec).map(function (spec) {
    const parts = spec.split(':')
    const key = parts[0]
    const cmp = comparators[parts[1] || 'eq']
    const ref = filterSpec[spec]
    return obj => cmp(obj[key], ref)
  }))

  return obj => tests.every(test => test(obj))
}

let unsubscribeLkup = {}

const makeFluxAdapter = (name) => ({
    addChangeListener: (f) => {
      const unsubscribe = store.subscribe(f)
      unsubscribeLkup[f] = unsubscribe
      return unsubscribe
    },
    removeChangeListener: (f) => {
      unsubscribeLkup[f]()
    },
    get: function (key) {
      const state = store.getState()
      return state.data[name].byKey[key]
    },
    query: function (filterSpec, sortSpec) {
      const state = store.getState()
      const filterer = makeFilterFunc(filterSpec)
      const sorter = makeSortFunc(sortSpec)
      const data = state.data[name].byKey
      const list = Object.keys(data).map(k => data[k])
      return list.filter(filterer).sort(sorter)
    }
})

export default makeFluxAdapter;
