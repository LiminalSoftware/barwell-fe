reducers = require("./reducers")
assert = require('assert')




describe("sumReducerFactory()", function () {
  var data = [
    {'a1': 1, 'a2': 2, 'a3': 1, _count: 3},
    {'a1': 1, 'a2': 2, 'a3': 3, _count: 1}
  ]

  it('should sum a list of things', function () {
    var reducer = reducers.sumReducerFactory('a3')
    var result = data.reduce(reducer)
    assert.deepEqual(result, {'a1': 1, 'a2': 2, 'a3': 4, '_count': 4})
  })
})


describe("avgReducerFactory()", function () {
  var data = [
    {'a1': 1, 'a2': 2, 'a3': 1, _count: 3},
    {'a1': 1, 'a2': 2, 'a3': 3, _count: 1}
  ]

  it('should average a list of things', function () {
    var reducer = reducers.avgReducerFactory('a3')
    var result = data.reduce(reducer)
    assert.deepEqual(result, {'a1': 1, 'a2': 2, 'a3': 1.5, '_count': 4})
  })
})
