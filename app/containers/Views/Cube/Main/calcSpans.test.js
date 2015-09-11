calcSpans = require("./calcSpans")
assert = require('assert')

describe("calcSpans()", function () {
  it('should annotate a list of dimensions with appropriate row/column spans', function () {
    var levels = [
      {'a1': 1, 'a2': 2, 'a3': 1},
      {'a1': 1, 'a2': 3, 'a3': 1},
      {'a1': 2, 'a2': 3, 'a3': 1},
      {'a1': 3, 'a2': 3, 'a3': 1},
      {'a1': 3, 'a2': 3, 'a3': null},
      {'a1': 3, 'a2': 3, 'a3': null}
    ]
    var results = calcSpans(levels, ['a1','a2','a3'])

    console.log('results: ' + JSON.stringify(results.map(function(thing) {return thing.spans}) ))

    assert.equal(results[0].spans['a1'], 2)
    assert.equal(results[0].spans['a2'], 1)
    assert.equal(results[0].spans['a3'], 1)

    assert.equal(results[1].spans['a1'], 0)
    assert.equal(results[1].spans['a2'], 1)
    assert.equal(results[1].spans['a3'], 1)

    assert.equal(results[2].spans['a1'], 1)
    assert.equal(results[2].spans['a2'], 1)
    assert.equal(results[2].spans['a3'], 1)

    assert.equal(results[3].spans['a1'], 3)
    assert.equal(results[3].spans['a2'], 3)
    assert.equal(results[3].spans['a3'], 1)

    assert.equal(results[4].spans['a1'], 0)
    assert.equal(results[4].spans['a2'], 0)
    assert.equal(results[4].spans['a3'], 2)

    assert.equal(results[5].spans['a1'], 0)
    assert.equal(results[5].spans['a2'], 0)
    assert.equal(results[5].spans['a3'], 0)
  })
})
