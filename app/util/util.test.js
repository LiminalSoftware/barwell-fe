util = require("./util")
assert = require('assert')

describe("sum()", function () {
  it('should take a list of objects and a property name and return the sum', function () {
    var objects = [{a: 1}, {a: 3}, {a: 10}]
    assert.equal(util.sum(objects), 14)
  })
})
