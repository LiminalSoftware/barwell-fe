import _ from "underscore";

const BIGNUM = 10000;

const sortItems = function (model, items, ordering) {
	ordering = ordering || {};

	items = items.map(function (item, idx) {
		item._order = ordering[item.view_id] || (BIGNUM + idx);
		return item;
	});
	return _.sortBy(items, '_order');
};

export default sortItems