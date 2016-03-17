util = require("./util")
assert = require('assert')

describe("sum()", function () {
	it('should take a list of objects and a property name and return the sum', function () {
		var objects = [{a: 1}, {a: 3}, {a: 10}]
		assert.equal(util.sum(objects), 14)
	})
})

describe("compare()", function () {
	var a = {a: 1, b: 2};
	var b = {a: 1, b: 3};
	it('should return 0 if items are equivalent according to sort spec', function () {
		var spec = [{attribute_id: 'a', descending: true}]
		assert.equal(util.compare(a, b, spec), 0)
	});
	it('should return 1 if items are descending according to sort spec', function () {
		var spec = [{attribute_id: 'a', descending: true}, {attribute_id: 'b', descending: true}]
		assert.equal(util.compare(a, b, spec), 0)
	});
	it('should return -1 if items are ascending according to sort spec', function () {
		var spec = [{attribute_id: 'a', descending: true}, {attribute_id: 'b', descending: false}]
		assert.equal(util.compare(a, b, spec), 0)
	});
})

