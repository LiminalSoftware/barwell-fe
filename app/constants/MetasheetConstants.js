var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({
    MODEL_CREATE: null,
    MODEL_DESTROY: null,
    VIEW_CREATE: null,
    VIEW_DESTROY: null,
    CLICK_VIEW: null,
    CREATE_VIEW: null
  }),

  Constants: {
  	KEY_ENTER: 13,
  	KEY_ESC: 27,
  	KEY_ARROW_UP: 38,
  	KEY_ARROW_DOWN: 40,
  	KEY_ARROW_LEFT: 37,
  	KEY_ARROW_RIGHT: 39,
  	KEY_F2: 113,
  	KEY_SHIFT: 16
  }

};
