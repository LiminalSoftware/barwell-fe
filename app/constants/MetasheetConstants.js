

module.exports = {

  transitions: {
    slideIn: {
      transitionEnterTimeout: 300,
      transitionAppearTimeout: 300,
      transitionLeaveTimeout: 300,
      transitionAppear: true,
      transitionName: "slide-in" 
    },
    zoomIn: {
      transitionEnterTimeout: 150,
      transitionLeaveTimeout: 150,
      transitionName: "zoomin" 
    },
    inandout: {
      transitionEnterTimeout: 1000,
      transitionAppearTimeout: 1000,
      transitionLeaveTimeout: 1000,
      transitionAppear: true,
      transitionName: "inandout" 
    },
    slideleft: {
      transitionEnterTimeout: 300,
      transitionAppearTimeout: 300,
      transitionLeaveTimeout: 300,
      transitionAppear: true,
      transitionName: "slideleft" 
    },
    fadeinout: {
      transitionEnterTimeout: 500,
      transitionLeaveTimeout: 500,
      transitionName: "fadeinout",
      transitionAppear: true,
      transitionAppearTimeout: 500,
    },
    fadeout: {
      transitionLeaveTimeout: 500,
      transitionName: "fadeout",
    }
  },

  updateMethods: {
    'P': {
      label: 'copy/paste',
      icon: 'icon-clipboard-check'
    },
    'M': {
      label: 'mouse or menu selection',
      icon: 'icon-mouse'
    },
    'K': {
      label: 'keyboard',
      icon: 'icon-keyboard'
    },
    'C': {
      label: 'clear',
      icon: 'icon-broom'
    },
    'I': {
      label: 'insert',
      icon: 'flare'
    }
  },

  fonts: {
    bodyFont: '"Helvetica Neue LT W06_61366420", "Helvetica", sans-serif',
    headerFont: '"Helvetica Neue LT W04_45", "Helvetica", sans-serif'
  },

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

    GREEN_1: '#079538',

    RED_BRIGHT_TRANS: "rgba(204, 0, 48, 0.2)"
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

  colTypeCategories: [
    'Basic',
    'Dates and Times',
    // 'Geographic',
    'Relationships'
  ],

  colTypes: {
    'INTEGER': {
      id: 'INTEGER',
      description: 'Integer',
      category: 'Basic',
      icon: 'calculator2'
    },

    'BOOLEAN': {
      id: 'BOOLEAN',
      description: 'True/False',
      category: 'Basic',
      icon: 'check'
    },
    
    'COLOR': {
      id: 'COLOR',
      description: 'Color',
      category: 'Basic',
      icon: 'eye-dropper'
    },

    'DECIMAL': {
      id: 'DECIMAL',
      description: 'Decimal',
      category: 'Basic',
      icon: 'dial'
    },

    'DATE_TIME': {
      id: 'DATE_TIME',
      description: 'Date/Time',
      category: 'Dates and Times',
      icon: 'watch'
    },

    'DATE': {
      id: 'DATE',
      description: 'Date',
      category: 'Dates and Times',
      icon: 'calendar-31'
    },

    'DURATION': {
      id: 'DURATION',
      description: 'Duration',
      category: 'Dates and Times',
      icon: 'timer'
    },


    'TEXT': {
      id: 'TEXT',
      description: 'Text',
      category: 'Basic',
      icon: 'text-align-justify'
    },

    'LOCATION': {
      id: 'LOCATION',
      description: 'Location',
      category: 'Geographic',
      icon: 'map-marker'
    },

    'REGION': {
      id: 'REGION',
      description: 'Region',
      category: 'Geographic',
      icon: 'earth'
    },

    'HAS_ONE': {
      id: 'HAS_ONE',
      description: 'Has One',
      category: 'Relationships',
      icon: 'arrows-merge'
    },

    'HAS_MANY': {
      id: 'HAS_MANY',
      description: 'Has Many',
      category: 'Relationships',
      icon: 'arrows-split'
    },

    'MANY_TO_MANY': {
      id: 'MANY_TO_MANY',
      description: 'Many to Many',
      category : 'Relationships',
      icon: 'shuffle'
    },

    'HIERARCHY': {
      id: 'HIERARCHY',
      description: 'Hierarchy',
      category: 'Relationships',
      icon: 'site-map'
    },

    'PRIMARY_KEY': {
      id: 'PRIMARY_KEY',
      description: 'Primary id',
      icon: 'key-hole'
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

  delimiter: '\u2661',

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
