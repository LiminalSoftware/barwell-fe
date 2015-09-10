calcSpans = require("./calcSpans")
assert = require('assert')

describe("calcSpans()", function () {
  it('should annotate a list of dimensions with appropriate row/column spans', function () {
    var levels = [
      {'a1': 1, 'a2': 2},
      {'a1': 1, 'a2': 3},
      {'a1': 2, 'a2': 3}
    ]
    var results = calcSpans(levels, ['a1','a2'])

    console.log('results: ' + JSON.stringify(results.map(function(thing) {return thing.spans}) ))

    assert.equal(results[0].spans['a1'], 2)
    assert.equal(results[0].spans['a2'], 1)

    assert.equal(results[1].spans['a1'], 0)
    assert.equal(results[1].spans['a2'], 1)
  })
})
