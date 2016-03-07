

module.exports = {

  colors: {
    GRAY_A: '#2a3034',
    GRAY_1: '#524A50',
    GRAY_2: '#71646B',
    GRAY_3: '#CBC3B7',
    GRAY_4: '#FAFAF4',

    PURPLE_1: '#54365E',
    PURPLE_2: '#7F5E8A',
    PURPLE_3: '#AF86BD',
    PURPLE_4: '#A041BF',

    GREEN_1: '#079538'
  },

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
    'PRIMARY_KEY': 'Primary id',
    'HAS_ONE': 'Has One',
    'HAS_MANY': 'Has Many',
    'MANY_TO_MANY': 'Has Many',
    'HIERARCHY': 'Hierarchy'
  },

  colTypes: {
    'INTEGER': {
      id: 'INTEGER',
      label: 'Integer',
      category: 'Numbers'
    },

    'BOOLEAN': {
      id: 'BOOLEAN',
      label: 'Yes/No',
      category: 'Others'
    },
    
    'COLOR': {
      id: 'COLOR',
      description: 'Color',
      category: 'Others'
    },

    'DECIMAL': {
      id: 'DECIMAL',
      description: 'Decimal',
      category: 'Numbers'
    },

    'DATE_TIME': {
      id: 'DATE_TIME',
      description: 'Date/Time',
      category: 'Dates and Times'
    },

    'DATE': {
      id: 'DATE',
      description: 'Date',
      category: 'Dates and Times'
    },

    'TEXT': {
      id: 'TEXT',
      description: 'Text',
      category: 'Text'
    },

    'LOCATION': {
      id: 'LOCATION',
      description: 'Location',
      category: 'Geographic'
    },

    'REGION': {
      id: 'REGION',
      description: 'Region',
      category: 'Geographic'
    },

    'HAS_ONE': {
      id: 'HAS_ONE',
      description: 'Has One',
      category: 'Relationships'
    },

    'HAS_MANY': {
      id: 'HAS_MANY',
      description: 'Has Many',
      category: 'Relationships'
    },

    'MANY_TO_MANY': {
      id: 'MANY_TO_MANY',
      description: 'Many to Many',
      category : 'Relationships'
    },

    'HIERARCHY': {
      id: 'HIERARCHY',
      description: 'Hierarchy',
      category: 'Relationships'
    },

    'PRIMARY_KEY': {
      id: 'PRIMARY_KEY',
      description: 'Primary id',
    }
  },

  dates: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ],

  delimiter: String.prototype.charCodeAt(31),

  aggregators: {
    'SUM': 'Sum',
    'LIST': 'List',
    'MAXIMUM': 'Maximum',
    'MINIMUM': 'Minimum',
    'AVERAGE': 'Average'
  },

  keycodes: {
    C: 67,
    V: 86,
    X: 88,
    Z: 90,
    Y: 91,
    DELETE: 46,
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
    PLUS: 187,
    MINUS: 189
  },

  calcFunctions: {
    sum: ['@INTEGER|DECIMAL'],
    count: ['@*'],
    average: ['@INTEGER|DECIMAL'],
    heat: ['@DECIMAL|PERCENTAGE'],
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
