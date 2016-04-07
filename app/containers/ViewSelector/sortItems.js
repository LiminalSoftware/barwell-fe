import ModelConfigStore from "../../stores/ModelConfigStore";
import _ from "underscore";

var sortItems = function (model, items) {
	var config = ModelConfigStore.get(model.model_id)
	if (config && 'ordering' in config) {
		items = items.map(function (item) {
			item.order = config.ordering[item.view_id];
			return item;
		});
		items = _.sortBy(items, 'order');
	}
	return items;
};

export default sortItems