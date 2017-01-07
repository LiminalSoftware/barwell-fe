import store from "./reduxStore"

const FocusStore = {
    addChangeListener: (f) => {
      const unsubscribe = store.subscribe(f)
      unsubscribeLkup[f] = unsubscribe
      return unsubscribe
    },
    removeChangeListener: (f) => {
      unsubscribeLkup[f]()
    },
    getFocus: function (key) {
      const state = store.getState()
      return state.session.focus
    }
}

export default FocusStore
