import util from '../../../../util/util'

var chooseAggregateElement = function (type, aggregator) {
	if (aggregator === 'COUNT') return {
		type: 'INTEGER',
		editable: false
	};
	else if ((type === 'INTEGER' || type === 'PRIMARY_KEY' || type === 'REFERENCE') && 
		(aggregator === 'SUM' || aggregator === 'MAX' || aggregator === 'MIN')) 
	return {
		type: 'INTEGER',
		editable: false
	};
	else if (aggregator === 'LIST') return {
		type: 'HAS_MANY',
		editable: true
	};
	else return {
		type: 'TEXT',
		editable: false
	};
}

export default chooseAggregateElement;