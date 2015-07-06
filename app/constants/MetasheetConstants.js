

module.exports = {
  
  fieldTypes: {
    'INTEGER': 'Integer',
    'BOOLEAN': 'Yes/No',
    'COLOR': 'Color',
    'DECIMAL': 'Decimal',
    'DATE_TIME': 'Date/Time',
    'DATE': 'Date',
    'TEXT': 'Text',
    'LOCATION': 'Location',
    'REGION': 'Region',
    'PRIMARY_KEY': 'Primary id'
  },

  aggregators: {
    'SUM': 'Sum',
    'LIST': 'List',
    'MAXIMUM': 'Maximum',
    'MINIMUM': 'Minimum',
    'AVERAGE': 'Average'
  },
  
  keycodes: {
  	ENTER: 13,
  	ESC: 27,
  	ARROW_UP: 38,
  	ARROW_DOWN: 40,
  	ARROW_LEFT: 37,
  	ARROW_RIGHT: 39,
  	F2: 113,
  	SHIFT: 16,
    SPACE: 32,
    TAB: 9,
    PLUS: 187
  },

  calcFunctions: {
    sum: ['@INTEGER|DECIMAL'], 
    count: ['@*'],
    average: ['@INTEGER|DECIMAL'],
    heat: ['@DECIMAL'],
    concatenate: ['@TEXT|INTEGER'],
    month: ['DATE|DATE_TIME'],
    day: ['DATE|DATE_TIME']
  },

  calcOperators: {
    'TEXT|INTEGER': '&',
    'DECIMAL|INTEGER': '+',
    'DATE|INTEGER': '&',
  }

};
