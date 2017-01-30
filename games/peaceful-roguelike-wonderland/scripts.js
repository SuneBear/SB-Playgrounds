'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(['\n\n      .modalView {\n        position: fixed;\n        z-index: ', ';\n        display: flex;\n        justify-content: center;\n        width: 100%;\n        height: 100vh;\n      }\n\n      .modalMask {\n        position: absolute;\n        z-index: -1;\n        width: 100%;\n        height: 100vh;\n        background: rgba(245, 245, 245, 0.95);\n        cursor: pointer;\n      }\n\n      .modalDialog {\n        position: absolute;\n        display: flex;\n        flex-direction: column;\n        width: 65%;\n        max-width: 700px;\n        min-width: 300px;\n        padding: 25px;\n        margin: 10vh 0;\n        max-height: 80vh;\n        background: hsla(0, 0%, 100%, .36);\n        border: 2px solid currentColor;\n        border-radius: 4px;\n        box-shadow: 1px 2px 5px rgba(0, 0, 0, .15);\n        overflow-y: auto;\n      }\n\n      .modalHeader {\n        position: relative;\n        padding-bottom: 17px;\n        margin-top: 5px;\n        margin-bottom: 20px;\n        border-bottom: 2px solid currentColor;\n      }\n\n      .modalTitle {\n        font-size: 20px;\n      }\n\n      .modalClose {\n        position: absolute;\n        right: -2px;\n        top: 2px;\n        width: 24px;\n        height: 24px;\n        font-size: 20px;\n        cursor: pointer;\n      }\n\n      .modalClose:before, .modalClose:after {\n        content: \' \';\n        position: absolute;\n        left: 12px;\n        height: 24px;\n        width: 2px;\n        background-color: currentColor;\n        border-radius: 2px;\n      }\n\n      .modalClose:before {\n        transform: rotate(45deg);\n      }\n\n      .modalClose:after {\n        transform: rotate(-45deg);\n      }\n\n      .modalClose:hover {\n        color: ', ';\n      }\n\n      .modalBody {\n        display: flex;\n        width: 100%;\n        overflow: hidden;\n      }\n\n      .modalBody > * {\n        flex: 1;\n        overflow-y: auto;\n        padding-bottom: 5px;\n      }\n\n    '], ['\n\n      .modalView {\n        position: fixed;\n        z-index: ', ';\n        display: flex;\n        justify-content: center;\n        width: 100%;\n        height: 100vh;\n      }\n\n      .modalMask {\n        position: absolute;\n        z-index: -1;\n        width: 100%;\n        height: 100vh;\n        background: rgba(245, 245, 245, 0.95);\n        cursor: pointer;\n      }\n\n      .modalDialog {\n        position: absolute;\n        display: flex;\n        flex-direction: column;\n        width: 65%;\n        max-width: 700px;\n        min-width: 300px;\n        padding: 25px;\n        margin: 10vh 0;\n        max-height: 80vh;\n        background: hsla(0, 0%, 100%, .36);\n        border: 2px solid currentColor;\n        border-radius: 4px;\n        box-shadow: 1px 2px 5px rgba(0, 0, 0, .15);\n        overflow-y: auto;\n      }\n\n      .modalHeader {\n        position: relative;\n        padding-bottom: 17px;\n        margin-top: 5px;\n        margin-bottom: 20px;\n        border-bottom: 2px solid currentColor;\n      }\n\n      .modalTitle {\n        font-size: 20px;\n      }\n\n      .modalClose {\n        position: absolute;\n        right: -2px;\n        top: 2px;\n        width: 24px;\n        height: 24px;\n        font-size: 20px;\n        cursor: pointer;\n      }\n\n      .modalClose:before, .modalClose:after {\n        content: \' \';\n        position: absolute;\n        left: 12px;\n        height: 24px;\n        width: 2px;\n        background-color: currentColor;\n        border-radius: 2px;\n      }\n\n      .modalClose:before {\n        transform: rotate(45deg);\n      }\n\n      .modalClose:after {\n        transform: rotate(-45deg);\n      }\n\n      .modalClose:hover {\n        color: ', ';\n      }\n\n      .modalBody {\n        display: flex;\n        width: 100%;\n        overflow: hidden;\n      }\n\n      .modalBody > * {\n        flex: 1;\n        overflow-y: auto;\n        padding-bottom: 5px;\n      }\n\n    ']),
    _templateObject2 = _taggedTemplateLiteral(['\n\n      .kbcView {\n\n      }\n\n      .shortcutItem {\n        display: flex;\n        align-items: center;\n      }\n\n      .shortcutItem + .shortcutItem {\n        margin-top: 20px;\n      }\n\n      .shortcutKey {\n        min-width: 42px;\n        height: 42px;\n        padding: 0 10px;\n        margin: 0px 4px;\n        background: #fff;\n        border-radius: 4px;\n        box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.1);\n        font: 18px/42px Helvetica, serif;\n        text-transform: capitalize;\n        text-align: center;\n        color: #666;\n      }\n\n      .shortcutAction {\n        margin-left: 20px;\n        font-size: 18px;\n        text-transform: capitalize;\n      }\n\n    '], ['\n\n      .kbcView {\n\n      }\n\n      .shortcutItem {\n        display: flex;\n        align-items: center;\n      }\n\n      .shortcutItem + .shortcutItem {\n        margin-top: 20px;\n      }\n\n      .shortcutKey {\n        min-width: 42px;\n        height: 42px;\n        padding: 0 10px;\n        margin: 0px 4px;\n        background: #fff;\n        border-radius: 4px;\n        box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.1);\n        font: 18px/42px Helvetica, serif;\n        text-transform: capitalize;\n        text-align: center;\n        color: #666;\n      }\n\n      .shortcutAction {\n        margin-left: 20px;\n        font-size: 18px;\n        text-transform: capitalize;\n      }\n\n    ']),
    _templateObject3 = _taggedTemplateLiteral(['\n\n      .hudView {\n        position: absolute;\n        z-index: ', ';\n      }\n\n    '], ['\n\n      .hudView {\n        position: absolute;\n        z-index: ', ';\n      }\n\n    ']),
    _templateObject4 = _taggedTemplateLiteral(['\n\n      .panelWrap {\n        position: fixed;\n        z-index: ', ';\n        display: flex;\n        justify-content: center;\n        z-index: 10010;\n        width: 100%;\n        height: 100vh;\n        padding-top: 20vh;\n        background: ', ';\n      }\n\n      .panelBody {\n        width: 80%;\n        max-width: 400px;\n        text-align: center;\n      }\n\n      .panelTitle {\n        font-size: 24px;\n        margin-bottom: 48px;\n      }\n\n      .panelList {\n        /* overflow-y: auto; */\n      }\n\n      .panelButton {\n        padding: 7px 16px;\n        border: 2px solid currentColor;\n        border-radius: 20px;\n        cursor: pointer;\n        transition: background 218ms;\n      }\n\n      .panelButton:hover,\n      .panelButton.isActive {\n        background: rgba(0, 0, 0, 0.1);\n      }\n\n      .panelButton + .panelButton {\n        margin-top: 24px;\n      }\n\n      .wonBlessings {\n        line-height: 1.6;\n        padding: 14px;\n        margin-top: -22px;\n        margin-bottom: 28px;\n        background: rgba(255, 255, 255, 0.65);\n        border-radius: 25px;\n      }\n\n      .wonBlessings em {\n        margin-right: 2px;\n        color: ', '\n      }\n    '], ['\n\n      .panelWrap {\n        position: fixed;\n        z-index: ', ';\n        display: flex;\n        justify-content: center;\n        z-index: 10010;\n        width: 100%;\n        height: 100vh;\n        padding-top: 20vh;\n        background: ', ';\n      }\n\n      .panelBody {\n        width: 80%;\n        max-width: 400px;\n        text-align: center;\n      }\n\n      .panelTitle {\n        font-size: 24px;\n        margin-bottom: 48px;\n      }\n\n      .panelList {\n        /* overflow-y: auto; */\n      }\n\n      .panelButton {\n        padding: 7px 16px;\n        border: 2px solid currentColor;\n        border-radius: 20px;\n        cursor: pointer;\n        transition: background 218ms;\n      }\n\n      .panelButton:hover,\n      .panelButton.isActive {\n        background: rgba(0, 0, 0, 0.1);\n      }\n\n      .panelButton + .panelButton {\n        margin-top: 24px;\n      }\n\n      .wonBlessings {\n        line-height: 1.6;\n        padding: 14px;\n        margin-top: -22px;\n        margin-bottom: 28px;\n        background: rgba(255, 255, 255, 0.65);\n        border-radius: 25px;\n      }\n\n      .wonBlessings em {\n        margin-right: 2px;\n        color: ', '\n      }\n    ']),
    _templateObject5 = _taggedTemplateLiteral(['\n\n      /* Common */\n      .sceneWrap {\n        position: absolute;\n        z-index: ', ';\n        width: 100%;\n      }\n\n      .scene {\n        position: absolute;\n        width: 100%;\n        height: 100vh;\n        display: flex;\n        will-change: transform;\n        transition: all 618ms;\n      }\n\n      .sceneLayer {\n        position: absolute;\n        display: flex;\n        max-width: 100%;\n        max-height: 100vh;\n        margin: auto;\n        position: absolute;\n        top: 0;\n        left: 0;\n        bottom: 0;\n        right: 0;\n      }\n\n      .sceneLayer.sceneEntities {\n        z-index: 2;\n      }\n\n      .sceneLayer.sceneMap {\n        z-index: 1;\n        flex-direction: row;\n      }\n\n      .commonCol {\n        flex: 0 0 auto;\n        width: ', '', ';\n      }\n\n      .commonCell {\n        flex: 1 0 auto;\n      }\n\n      .commonEntity {\n        position: absolute;\n      }\n\n      /* Text */\n      .textScene {\n\n      }\n\n      .textCell {\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        width: ', '', ';\n        height: ', '', ';\n      }\n\n      .textCell.typeRoad {\n        color: #cccccc;\n        transition: all 418ms 218ms;\n      }\n\n      .textCell.typeWall {\n        color: #666666; /* #a6a6a6 */\n      }\n\n      .textCell.typeStart {\n        color: currentColor !important;\n        background: #f3ece2 !important;\n      }\n\n      .textCell.typeEnd {\n        color: currentColor !important;\n        background: #e2e9f3 !important;\n      }\n\n      .textCell.isWalked {\n        color: ', ';\n      }\n\n      .textCell.isSolution {\n        background: #e9f3e2;\n      }\n\n      .textEntity.typePlayer {\n        align-items: flex-end;\n        padding: 10px;\n        background: ', ';\n        background-clip: content-box;\n        border-radius: 50%;\n        color: #ffffff;\n        opacity: 0.9;\n        will-change: transform;\n        transition: all 318ms;\n      }\n\n      /* Graphic */\n      .graphicScene {\n        align-items: center;\n        justify-content: center;\n      }\n\n    '], ['\n\n      /* Common */\n      .sceneWrap {\n        position: absolute;\n        z-index: ', ';\n        width: 100%;\n      }\n\n      .scene {\n        position: absolute;\n        width: 100%;\n        height: 100vh;\n        display: flex;\n        will-change: transform;\n        transition: all 618ms;\n      }\n\n      .sceneLayer {\n        position: absolute;\n        display: flex;\n        max-width: 100%;\n        max-height: 100vh;\n        margin: auto;\n        position: absolute;\n        top: 0;\n        left: 0;\n        bottom: 0;\n        right: 0;\n      }\n\n      .sceneLayer.sceneEntities {\n        z-index: 2;\n      }\n\n      .sceneLayer.sceneMap {\n        z-index: 1;\n        flex-direction: row;\n      }\n\n      .commonCol {\n        flex: 0 0 auto;\n        width: ', '', ';\n      }\n\n      .commonCell {\n        flex: 1 0 auto;\n      }\n\n      .commonEntity {\n        position: absolute;\n      }\n\n      /* Text */\n      .textScene {\n\n      }\n\n      .textCell {\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        width: ', '', ';\n        height: ', '', ';\n      }\n\n      .textCell.typeRoad {\n        color: #cccccc;\n        transition: all 418ms 218ms;\n      }\n\n      .textCell.typeWall {\n        color: #666666; /* #a6a6a6 */\n      }\n\n      .textCell.typeStart {\n        color: currentColor !important;\n        background: #f3ece2 !important;\n      }\n\n      .textCell.typeEnd {\n        color: currentColor !important;\n        background: #e2e9f3 !important;\n      }\n\n      .textCell.isWalked {\n        color: ', ';\n      }\n\n      .textCell.isSolution {\n        background: #e9f3e2;\n      }\n\n      .textEntity.typePlayer {\n        align-items: flex-end;\n        padding: 10px;\n        background: ', ';\n        background-clip: content-box;\n        border-radius: 50%;\n        color: #ffffff;\n        opacity: 0.9;\n        will-change: transform;\n        transition: all 318ms;\n      }\n\n      /* Graphic */\n      .graphicScene {\n        align-items: center;\n        justify-content: center;\n      }\n\n    ']),
    _templateObject6 = _taggedTemplateLiteral(['\n\n      .game {\n        position: relative;\n        background: #ffffff;\n        height: 100vh;\n        transition: all 518ms;\n      }\n\n      .game.isInvertColors {\n        -webkit-filter: invert(100%);\n      }\n\n    '], ['\n\n      .game {\n        position: relative;\n        background: #ffffff;\n        height: 100vh;\n        transition: all 518ms;\n      }\n\n      .game.isInvertColors {\n        -webkit-filter: invert(100%);\n      }\n\n    ']);

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

void function () {
  var _arguments = arguments;


  /**
   * Peaceful Roguelike Wonderland
   *
   * @Project URL: https://github.com/SuneBear/SB-Playgrounds/tree/master/src/games/peaceful-roguelike-wonderland
   *
   * @Dependences:
   *  - Grid
   *  |-- Heap.js - A binary heap implementation in CoffeeScript/JavaScript. Ported from Python's heapq module
   *  |-- PathFinding.js - A comprehensive path-finding library for grid based games
   *  - View
   *  |-- CSJS - Write modular, scoped CSS with valid JavaScript
   *  |-- Classnames - A simple javascript utility for conditionally joining classNames together
   *  |-- Maquette - Pure and simple virtual DOM library
   *  - Sound
   *  |-- Howler.js - Javascript audio library for the modern web
   *
   * @Code Overview:
   *  - Constants
   *  - Utils
   *  |-- Compose
   *  |-- Capitalize
   *  |-- Keymap
   *  |-- Random Integer
   *  |-- Random Choice
   *  |-- Shuffle
   *  |-- Simulate Keypress
   *  |-- Throttle
   *  - Roguelike
   *  |-- Direction
   *  |-- Point
   *  |-- Grid Generators
   *  |--|-- Grid Cell
   *  |--|-- Base Grid
   *  |--|-- Roguelike Grid
   *  |--|-- Maze Grid
   *  |-- Path Finders (Dependence on PathFinding.js)
   *  |--|-- Diagonal Movement
   *  |--|-- Heuristic
   *  |--|-- Base Finder
   *  |--|-- AStar Finder (Dependence on Heap.js)
   *  - Data Layer: Redux-like Pattern
   *  |-- Action Creators
   *  |-- Reducers
   *  |-- Middlewares
   *  |-- Store Core
   *  - View Component Layer
   *  |-- Library & Engine
   *  |--|-- Keyboard Listener
   *  |--|-- Sound Manager (Dependence on Howler.js)
   *  |--|-- Absolute Layout
   *  |--|-- Hero-Focused Camera
   *  |-- Mixin: Currently just a sorted feature without interfering, please improve me...
   *  |--|-- Mixin with Component (Deprecated)
   *  |--|-- VNode Mixin (Dependence on Maquette)
   *  |--|-- Style Mixin (Dependence on CSJS & Classnames)
   *  |-- View
   *  |--|-- Base View
   *  |--|-- Bottom Views: UI, High Order
   *  |--|-- Top Views: Render Layer, Singleton
   *  |-- Game Main
   *  - Init
   *
   * @List of Abbrs. of the View Component:
   *  - h: HyperScript implemented by Maquette
   *  - hc: Include a view component in HyperScript
   *  - s: Object of CSJS styles
   *  - sv: Object of shared style variables
   *  - sc: classNames util
   */

  /* == Constants == */
  var GAME_NAME = 'Peaceful Roguelike Wonderland';
  var FEEDBACK_URL = 'https://github.com/SuneBear/SB-Playgrounds/issues/new';
  var NOOP = function NOOP() {};

  /* == Utils == */

  var utils = {};

  // Compose - FP high order function
  utils.compose = function () {
    for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
      fns[_key] = arguments[_key];
    }

    return function (arg) {
      return fns.reduceRight(function (composed, fn) {
        return fn(composed);
      }, arg);
    };
  };

  // Capitalize
  utils.capitalize = function (str) {
    return str && str[0].toUpperCase() + str.slice(1);
  };

  // Keymap - keyCode <=> keyName
  utils.keymap = function () {
    // Incomplete keyCodes map
    var keyCodesMap = {
      13: 'enter',
      27: 'escape',
      32: 'spacebar',
      37: 'leftArrow',
      38: 'upArrow',
      39: 'rightArrow',
      40: 'downArrow',
      46: 'delete'
    };

    // Append numbers
    for (var i = 48; i < 58; i++) {
      keyCodesMap[i] = i - 48;
    } // Append low case alphabets
    for (var _i = 97; _i < 123; _i++) {
      keyCodesMap[_i - 32] = String.fromCharCode(_i);
    } // Append function keys
    for (var _i2 = 1; _i2 < 13; _i2++) {
      keyCodesMap[_i2 + 111] = 'f' + _i2;
    }var swappedKeyCodesMap = Object.keys(keyCodesMap).reduce(function (obj, key) {
      obj[keyCodesMap[key]] = parseInt(key);
      return obj;
    }, {});

    return function (arg) {
      return typeof arg === 'number' ? keyCodesMap[arg] : swappedKeyCodesMap[arg];
    };
  }();

  // Random Integer
  utils.randomInteger = function () {
    var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var omits = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    var number = Math.floor(Math.random() * (max - min + 1) + min);
    return omits.indexOf(number) === -1 ? number : utils.randomInteger.apply(utils, _arguments);
  };

  // Random Choice
  utils.randomChoice = function (array) {
    var randIndex = Math.floor(Math.random() * array.length);
    return array[randIndex];
  };

  // Shuffle - the Fisher-Yates (aka Knuth) shuffle
  // @REF: http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  utils.shuffle = function (array) {
    var currentIndex = array.length;
    var randomIndex = void 0,
        temporaryValue = void 0;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };

  // Simulate Keypress
  utils.simulateKeypress = function (keyName) {
    var keymap = utils.keymap;

    // Keydown

    var eventKeydown = new Event('keydown');
    eventKeydown.key = keyName;
    eventKeydown.keyCode = keymap(keyName);
    eventKeydown.which = eventKeydown.keyCode;
    window.dispatchEvent(eventKeydown);

    // Keyup
    var eventKeyup = new Event('keyup');
    eventKeyup.key = keyName;
    eventKeyup.keyCode = keymap(keyName);
    eventKeyup.which = eventKeyup.keyCode;
    setTimeout(function () {
      return window.dispatchEvent(eventKeyup);
    }, 0);
  };

  // Throttle
  // @REF: http://underscorejs.org/#throttle
  utils.throttle = function (func, wait, options) {
    var timeout = void 0,
        context = void 0,
        args = void 0,
        result = void 0;
    var previous = 0;
    if (!options) options = {};

    var later = function later() {
      previous = options.leading === false ? 0 : Date.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function throttled() {
      var now = Date.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function () {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  };

  /* == Roguelike == */

  /* ==== Direction ==== */
  var direction = {};

  direction.orthogonal = ['N', 'E', 'S', 'W'];

  direction.diagonal = ['NW', 'NE', 'SE', 'SW'];

  direction.all = [].concat(direction.orthogonal, direction.diagonal);

  direction.getCode = function (dir) {
    switch (dir) {
      case 'N':
        return 1 << 3; // 8
      case 'E':
        return 1 << 2; // 4
      case 'S':
        return 1 << 1; // 2
      case 'W':
        return 1 << 0; // 1
      default:
        return 0;
    }
  };

  direction.getDX = function (dir) {
    switch (dir) {
      case 'N':
        return 0;
      case 'E':
        return 1;
      case 'S':
        return 0;
      case 'W':
        return -1;
    }
  };

  direction.getDY = function (dir) {
    switch (dir) {
      case 'N':
        return -1;
      case 'E':
        return 0;
      case 'S':
        return 1;
      case 'W':
        return 0;
    }
  };

  direction.getOpposite = function (dir) {
    switch (dir) {
      case 'N':
        return 'S';
      case 'E':
        return 'W';
      case 'S':
        return 'N';
      case 'W':
        return 'E';

      case 'NW':
        return 'SE';
      case 'NE':
        return 'SW';
      case 'SE':
        return 'NW';
      case 'SW':
        return 'NE';
    }
  };

  /* ==== Point ==== */

  var Point = function () {
    _createClass(Point, null, [{
      key: 'getDefaultOptions',
      value: function getDefaultOptions() {
        return {
          x: 0,
          y: 0
        };
      }
    }]);

    function Point(options) {
      _classCallCheck(this, Point);

      this.options = Object.assign(Point.getDefaultOptions(), options);
      Object.assign(this, this.options);
    }

    _createClass(Point, [{
      key: 'updateOptions',
      value: function updateOptions(options) {
        Object.assign(this.options, options);
        Object.assign(this, this.options);
      }
    }, {
      key: 'getPoint',
      value: function getPoint() {
        return {
          x: this.x,
          y: this.y
        };
      }
    }, {
      key: 'isEqual',
      value: function isEqual(toCompare) {
        return this.x == toCompare.x && this.y == toCompare.y;
      }
    }]);

    return Point;
  }();

  /* ==== Grid Generators ==== */

  /**
   * Grid Cell
   */

  var GridCell = function (_Point) {
    _inherits(GridCell, _Point);

    _createClass(GridCell, null, [{
      key: 'getDefaultOptions',
      value: function getDefaultOptions() {
        return {
          type: 'empty',
          walkable: true,
          // openingDirs: [],
          // entities: [],
          isWalked: false,
          isSolution: false
        };
      }
    }]);

    function GridCell(options) {
      _classCallCheck(this, GridCell);

      return _possibleConstructorReturn(this, (GridCell.__proto__ || Object.getPrototypeOf(GridCell)).call(this, Object.assign(GridCell.getDefaultOptions(), options)));
    }

    _createClass(GridCell, [{
      key: 'getOpeningsCode',
      value: function getOpeningsCode() {
        var getCode = direction.getCode;

        var code = 0;
        this.openingDirs.map(function (dir) {
          return code += getCode(dir);
        });
        return code;
      }
    }, {
      key: 'walk',
      value: function walk() {
        this.updateOptions({
          isWalked: true
        });
      }
    }, {
      key: 'correct',
      value: function correct() {
        this.updateOptions({
          isSolution: true
        });
      }
    }, {
      key: 'clone',
      value: function clone() {
        return new GridCell(this.options);
      }
    }]);

    return GridCell;
  }(Point);

  /**
   * Base Grid
   */

  var BaseGrid = function () {
    _createClass(BaseGrid, null, [{
      key: 'getDefaultOptions',
      value: function getDefaultOptions() {
        return {
          cellOptions: {},
          name: 'Default Grid',
          cols: 51, // X or Width
          rows: 51 // Y or Height
        };
      }
    }]);

    function BaseGrid(options) {
      _classCallCheck(this, BaseGrid);

      this.options = Object.assign({}, BaseGrid.getDefaultOptions(), options);

      var _options = this.options,
          cols = _options.cols,
          rows = _options.rows,
          cellOptions = _options.cellOptions;

      // Core Data

      this.total = cols * rows;
      this.matrix = this._buildMatrix(cols, rows, cellOptions);
    }

    _createClass(BaseGrid, [{
      key: '_buildMatrix',
      value: function _buildMatrix(cols, rows, cellOptions) {
        var cellMatrix = new Array(cols);

        for (var x = 0; x < cols; ++x) {
          cellMatrix[x] = new Array(rows);
          for (var y = 0; y < rows; ++y) {
            cellMatrix[x][y] = new GridCell(Object.assign({ x: x, y: y }, cellOptions));
          }
        }

        return cellMatrix;
      }
    }, {
      key: 'getMatrix',
      value: function getMatrix() {
        return this.matrix;
      }
    }, {
      key: 'getCellAt',
      value: function getCellAt(x, y) {
        if (!this.isValidCell(x, y)) return null;

        return this.matrix[x][y];
      }
    }, {
      key: 'isWalkableAt',
      value: function isWalkableAt(x, y) {
        if (!this.isValidCell(x, y)) return false;

        return this.matrix[x][y].walkable;
      }
    }, {
      key: 'isEmptyTypeAt',
      value: function isEmptyTypeAt(x, y) {
        if (!this.isValidCell(x, y)) return false;

        return this.matrix[x][y].type === 'empty';
      }
    }, {
      key: 'isValidCell',
      value: function isValidCell(x, y) {
        var _options2 = this.options,
            cols = _options2.cols,
            rows = _options2.rows;


        var conditions = [function () {
          return x >= 0 && x < cols;
        }, function () {
          return y >= 0 && y < rows;
        }];

        return conditions.every(function (c) {
          return c();
        });
      }

      /**
       * Get the neighbors of the given cell
       *
       * @REF: https://github.com/qiao/PathFinding.js/blob/master/src/core/Grid.js#L144
       *
       *     offsets      diagonalOffsets
       *  +---+---+---+    +----+---+----+
       *  |   | N |   |    | NW |   | NE |
       *  +---+---+---+    +----+---+----+
       *  | W |   | E |    |    |   |    |
       *  +---+---+---+    +----+---+----+
       *  |   | S |   |    | SW |   | SE |
       *  +---+---+---+    +----+---+----+
       */

    }, {
      key: 'getNeighbors',
      value: function getNeighbors(cell, diagonalMovement) {
        var isValidAt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.isWalkableAt.bind(this);
        var matrix = this.matrix;
        var x = cell.x,
            y = cell.y;

        var neighbors = [];

        var openingDirs = {};
        direction.all.map(function (dir) {
          return openingDirs[dir] = false;
        });

        // ↑ → ↓ ←
        direction.orthogonal.map(function (dir) {
          var nx = x + direction.getDX(dir);
          var ny = y + direction.getDY(dir);

          if (isValidAt(nx, ny)) {
            neighbors.push(matrix[nx][ny]);
            openingDirs[dir] = true;
          }
        });

        if (diagonalMovement === DiagonalMovement.Never) {
          return neighbors;
        }

        if (diagonalMovement === DiagonalMovement.OnlyWhenNoObstacles) {
          var N = openingDirs.N,
              E = openingDirs.E,
              S = openingDirs.S,
              W = openingDirs.W;


          openingDirs.NW = N & W;
          openingDirs.NE = N & E;
          openingDirs.SE = S & E;
          openingDirs.SW = S & W;
        } else if (diagonalMovement === DiagonalMovement.IfAtMostOneObstacle) {
          var _N = openingDirs.N,
              _E = openingDirs.E,
              _S = openingDirs.S,
              _W = openingDirs.W;


          openingDirs.NW = _N || _W;
          openingDirs.NE = _N || _E;
          openingDirs.SE = _S || _E;
          openingDirs.SW = _S || _W;
        } else if (diagonalMovement === DiagonalMovement.Always) {
          openingDirs.NW = true;
          openingDirs.NE = true;
          openingDirs.SE = true;
          openingDirs.SW = true;
        } else {
          throw new Error('Incorrect value of diagonalMovement');
        }

        // ↖
        if (openingDirs.NW && isValidAt(x - 1, y - 1)) {
          neighbors.push(matrix[x - 1][y - 1]);
        }
        // ↗
        if (openingDirs.NE && isValidAt(x + 1, y - 1)) {
          neighbors.push(matrix[x + 1][y - 1]);
        }
        // ↘
        if (openingDirs.SE && isValidAt(x + 1, y + 1)) {
          neighbors.push(matrix[x + 1][y + 1]);
        }
        // ↙
        if (openingDirs.SW && isValidAt(x - 1, y + 1)) {
          neighbors.push(matrix[x - 1][y + 1]);
        }

        return neighbors;
      }
    }, {
      key: 'clone',
      value: function clone() {
        var matrix = this.matrix;
        var _options3 = this.options,
            cols = _options3.cols,
            rows = _options3.rows;


        var newGrid = new this.constructor(this.options);
        var newMatrix = new Array(cols);

        for (var x = 0; x < cols; ++x) {
          newMatrix[x] = new Array(cols);
          for (var y = 0; y < rows; ++y) {
            newMatrix[x][y] = matrix[x][y].clone();
          }
        }

        newGrid.matrix = newMatrix;

        return newGrid;
      }
    }]);

    return BaseGrid;
  }();

  /**
   * Roguelike Grid
   *
   * @TODO: Generate a roguelike grid
   */

  var RoguelikeGrid = function (_BaseGrid) {
    _inherits(RoguelikeGrid, _BaseGrid);

    _createClass(RoguelikeGrid, null, [{
      key: 'getDefaultOptions',
      value: function getDefaultOptions() {
        return {};
      }
    }]);

    function RoguelikeGrid(options) {
      _classCallCheck(this, RoguelikeGrid);

      return _possibleConstructorReturn(this, (RoguelikeGrid.__proto__ || Object.getPrototypeOf(RoguelikeGrid)).call(this, Object.assign(RoguelikeGrid.getDefaultOptions(), options)));
    }

    return RoguelikeGrid;
  }(BaseGrid);

  /**
   * Maze Grid
   */

  var MazeGrid = function (_BaseGrid2) {
    _inherits(MazeGrid, _BaseGrid2);

    _createClass(MazeGrid, null, [{
      key: 'getDefaultOptions',
      value: function getDefaultOptions() {
        return {
          cellOptions: {
            type: 'wall',
            walkable: false
          },
          types: {
            wall: {
              walkable: false
            },
            road: {
              walkable: true
            },
            start: {
              walkable: true
            },
            end: {
              walkable: true
            }
          },
          startPoint: null,
          endPoint: null
        };
      }
    }]);

    function MazeGrid(options) {
      _classCallCheck(this, MazeGrid);

      var _this3 = _possibleConstructorReturn(this, (MazeGrid.__proto__ || Object.getPrototypeOf(MazeGrid)).call(this, Object.assign(MazeGrid.getDefaultOptions(), options)));

      _this3._buildMazeGrid();
      return _this3;
    }

    _createClass(MazeGrid, [{
      key: '_buildMazeGrid',
      value: function _buildMazeGrid() {
        this._genStartCell();
        this._genEndCell();
        this._buildRoadCells();
        this._genSolution();
      }

      /**
       * Based on Growing Tree algorithm
       *
       * @REF: http://weblog.jamisbuck.org/2011/1/27/maze-generation-growing-tree-algorithm
       * @TODO: Improve performance of the loops & move the algorithm somewhere else
       */

    }, {
      key: '_buildRoadCells',
      value: function _buildRoadCells() {
        var randomInteger = utils.randomInteger,
            randomChoice = utils.randomChoice;
        // const { orthogonal, getDX, getDY, getOpposite } = direction

        var matrix = this.matrix;
        var _options4 = this.options,
            cols = _options4.cols,
            rows = _options4.rows,
            cellOptions = _options4.cellOptions;

        // Create an empty list of cells & add the starting cell to it

        var currentCell = this.getStartCell();
        var activeCellList = [];
        activeCellList.push(currentCell);

        // Loop through adding to cells list if there are unvisited neighbours to add, or remove cells if not
        // when cell list is empty we know that the maze contains all the cells
        while (activeCellList.length > 0) {
          // Set the current cell to the most recently added cell in the cell list
          var index = activeCellList.length - 1;
          currentCell = activeCellList[index];

          var neighbors = this.getNeighbors(currentCell, DiagonalMovement.Never, this._isUnvisitedAt.bind(this));

          if (neighbors.length) {
            this._breakDefaultCellAndCraveRoad(currentCell);

            var defaultCellNeighbors = neighbors.filter(function (neighbor) {
              return neighbor.type === cellOptions.type;
            });

            var hasTooManyDefaultCells = Math.round(defaultCellNeighbors.length / neighbors.length);

            if (hasTooManyDefaultCells) {
              var neighbor = randomChoice(defaultCellNeighbors);
              this._breakDefaultCellAndCraveRoad(neighbor);
            }

            neighbors.map(function (neighbor) {
              neighbor._visited = true;
              activeCellList.push(neighbor);
            });
          } else {
            activeCellList.pop();
          }
        }
      }
    }, {
      key: '_breakDefaultCellAndCraveRoad',
      value: function _breakDefaultCellAndCraveRoad(cell) {
        var cellOptions = this.options.cellOptions;


        if (cell.type !== cellOptions.type) return;

        cell.updateOptions({
          type: 'road',
          walkable: true
        });
      }
    }, {
      key: '_isUnvisitedAt',
      value: function _isUnvisitedAt(x, y) {
        var cell = this.getCellAt(x, y);

        if (!cell) return false;

        return !cell._visited;
      }
    }, {
      key: '_genRandomPoint',
      value: function _genRandomPoint() {
        var omittedXs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var omittedYs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var randomInteger = utils.randomInteger;
        var _options5 = this.options,
            cols = _options5.cols,
            rows = _options5.rows;


        return {
          x: randomInteger(0, cols - 1, omittedXs),
          y: randomInteger(0, rows - 1, omittedYs)
        };
      }
    }, {
      key: '_genStartCell',
      value: function _genStartCell() {
        var matrix = this.matrix;
        var startPoint = this.options.startPoint;


        if (!startPoint) {
          startPoint = this._genRandomPoint();
        }

        var _startPoint = startPoint,
            x = _startPoint.x,
            y = _startPoint.y;


        this.startCell = matrix[x][y] = new GridCell({ x: x, y: y, type: 'start' });
      }
    }, {
      key: '_genEndCell',
      value: function _genEndCell() {
        var randomInteger = utils.randomInteger;
        var matrix = this.matrix,
            startCell = this.startCell,
            _genRandomPoint = this._genRandomPoint;
        var _options6 = this.options,
            cols = _options6.cols,
            rows = _options6.rows;
        var endPoint = this.options.endPoint;


        if (!endPoint) {
          endPoint = this._genRandomPoint([startCell.x], [startCell.y]);
        }

        var _endPoint = endPoint,
            x = _endPoint.x,
            y = _endPoint.y;


        this.endCell = matrix[x][y] = new GridCell({ x: x, y: y, type: 'end' });
      }
    }, {
      key: '_genSolution',
      value: function _genSolution() {
        var _this4 = this;

        var finder = new AStarFinder();

        var solution = finder.findPath(this.getStartCell(), this.getEndCell(), this);

        if (!solution.length) return;

        this.solution = solution;
        solution.map(function (soln) {
          var _soln = _slicedToArray(soln, 2),
              x = _soln[0],
              y = _soln[1];

          var cell = _this4.getCellAt(x, y);
          cell.correct();
        });
      }
    }, {
      key: 'getStartCell',
      value: function getStartCell() {
        return this.startCell;
      }
    }, {
      key: 'getEndCell',
      value: function getEndCell() {
        return this.endCell;
      }
    }, {
      key: 'getSolution',
      value: function getSolution() {
        return this.solution;
      }
    }]);

    return MazeGrid;
  }(BaseGrid);

  /* ==== Path Finders ==== */

  /**
   * Diagonal Movement - Grouped Constants
   */

  var DiagonalMovement = {
    Always: 1,
    Never: 2,
    IfAtMostOneObstacle: 3,
    OnlyWhenNoObstacles: 4
  };

  /**
   * Heuristic
   */

  var heuristic = {};

  heuristic.manhattan = function (dx, dy) {
    return dx + dy;
  };

  heuristic.euclidean = function (dx, dy) {
    return Math.sqrt(dx * dx + dy * dy);
  };

  heuristic.octile = function (dx, dy) {
    var F = Math.SQRT2 - 1;
    return dx < dy ? F * dx + dy : F * dy + dx;
  };

  /**
   * BaseFinder
   */

  var BaseFinder = function () {
    _createClass(BaseFinder, null, [{
      key: 'getDefaultOptions',
      value: function getDefaultOptions() {
        return {
          diagonalMovement: DiagonalMovement.Never, // Allowed diagonal movement
          heuristic: heuristic.manhattan // Heuristic function to estimate the distance
        };
      }
    }]);

    function BaseFinder(options) {
      _classCallCheck(this, BaseFinder);

      this.options = Object.assign({}, BaseFinder.getDefaultOptions(), options);
    }

    _createClass(BaseFinder, [{
      key: 'findPath',
      value: function findPath(startPoint, endPoint, grid) {
        throw new Error('Not implemented');
      }
    }]);

    return BaseFinder;
  }();

  /**
   * AStar Finder
   */

  var AStarFinder = function (_BaseFinder) {
    _inherits(AStarFinder, _BaseFinder);

    _createClass(AStarFinder, [{
      key: 'getDefaultOptions',
      value: function getDefaultOptions() {
        return {
          weight: 1 // Weight to apply to the heuristic to allow for suboptimal paths, in order to speed up the search.
        };
      }
    }]);

    function AStarFinder(options) {
      _classCallCheck(this, AStarFinder);

      var _this5 = _possibleConstructorReturn(this, (AStarFinder.__proto__ || Object.getPrototypeOf(AStarFinder)).call(this, options));

      Object.assign(_this5.options, AStarFinder.getDefaultOptions(), options);

      var diagonalMovement = _this5.options.diagonalMovement;


      if (diagonalMovement === DiagonalMovement.Never) {
        _this5.options.heuristic = heuristic.octile;
      }
      return _this5;
    }

    _createClass(AStarFinder, [{
      key: '_backtrack',
      value: function _backtrack(node) {
        var path = [[node.x, node.y]];
        while (node.parent) {
          node = node.parent;
          path.push([node.x, node.y]);
        }
        return path.reverse();
      }
    }, {
      key: 'findPath',
      value: function findPath(startPoint, endPoint, grid) {
        var _backtrack = this._backtrack;
        var _options7 = this.options,
            heuristic = _options7.heuristic,
            diagonalMovement = _options7.diagonalMovement,
            weight = _options7.weight;

        var startCell = grid.getCellAt(startPoint.x, startPoint.y);
        var endCell = grid.getCellAt(endPoint.x, endPoint.y);
        var openList = new Heap(function (nodeA, nodeB) {
          return nodeA.f - nodeB.f;
        });

        // Set the `g` and `f` value of the start cell to be 0
        startCell.g = 0;
        startCell.f = 0;

        // Push the start cell into the open list
        openList.push(startCell);
        startCell._opened = true;

        // While the open list is not empty
        while (!openList.empty()) {
          // Pop the position of cell which has the minimum `f` value.
          var cell = openList.pop();
          cell._closed = true;

          // If reached the end position, construct the path and return it
          if (cell.x === endCell.x && cell.y === endCell.y) {
            return _backtrack(endCell);
          }

          // Get neigbours of the current cell
          var neighbors = grid.getNeighbors(cell, diagonalMovement);

          for (var i = 0; i < neighbors.length; ++i) {
            var neighbor = neighbors[i];

            if (neighbor._closed) continue;

            var x = neighbor.x,
                y = neighbor.y;

            // Get the distance between current cell and the neighbor
            // And calculate the next g score

            var ng = cell.g + (x - cell.x === 0 || y - cell.y === 0 ? 1 : Math.SQRT2);

            // Check if the neighbor has not been inspected yet, or
            // can be reached with smaller cost from the current cell
            if (!neighbor._opened || ng < neighbor.g) {
              neighbor.g = ng;
              neighbor.h = neighbor.h || weight * heuristic(Math.abs(x - endPoint.x), Math.abs(y - endPoint.y));
              neighbor.f = neighbor.g + neighbor.h;
              neighbor.parent = cell;

              if (!neighbor._opened) {
                openList.push(neighbor);
                neighbor._opened = true;
              } else {
                // The neighbor can be reached with smaller cost.
                // Since its f value has been updated, we have to
                // update its position in the open list
                openList.updateItem(neighbor);
              }
            }
          } // End for each neighbor
        } // End while not open list empty

        // Fail to find the path
        if (DEBUG) console.error('A* failed to find path');
        return [];
      }
    }]);

    return AStarFinder;
  }(BaseFinder);

  /* == Data Layer == */

  /* ==== Action Creators ==== */


  var actionCreators = {};

  // Status
  actionCreators.startGame = function () {
    return {
      type: 'Status/StartGame',
      linked: ['closePanel']
    };
  };

  actionCreators.pauseGame = function () {
    return {
      type: 'Status/PauseGame',
      linked: ['openPausePanel']
    };
  };

  actionCreators.stopGame = function () {
    return {
      type: 'Status/StopGame'
    };
  };

  actionCreators.winGame = function () {
    return {
      type: 'Status/WinGame',
      linked: ['openWinPanel']
    };
  };

  // Display
  actionCreators.switchSenceType = function (sceneType) {
    return { type: 'Display/SceneType', sceneType: sceneType };
  };

  actionCreators.toggleMap = function () {
    return { type: 'Display/ToggleMap' };
  };

  actionCreators.invertPageColors = function () {
    return { type: 'Display/InvertPageColors' };
  };

  actionCreators.toggleSolution = function () {
    return { type: 'Display/ToggleSolution' };
  };

  actionCreators.startTime = function (startTime) {
    return { type: 'Display/StartTime', startTime: startTime };
  };

  actionCreators.endTime = function (endTime) {
    return { type: 'Display/EndTime', endTime: endTime };
  };

  actionCreators.resizeWindow = function () {
    return { type: 'Display/ResizeWindow' };
  };

  // Player
  actionCreators.playerMove = function (direction) {
    return {
      type: 'Player/Move',
      meta: { sound: 'effects.move' },
      linked: ['playerMovedSteps'],
      direction: direction
    };
  };

  actionCreators.playerMovedSteps = function () {
    return { type: 'Player/MovedSteps' };
  };

  actionCreators.playerMoveTo = function (point) {
    return { type: 'Player/MoveTo', point: point };
  };

  actionCreators.playerPlaceIndex = function (placeIndex) {
    return { type: 'Player/PlaceIndex', placeIndex: placeIndex };
  };

  // Places
  actionCreators.addPlace = function (place) {
    return { type: 'Places/AddPlace', place: place };
  };

  actionCreators.updatePlace = function (placeIndex, newPlace) {
    return { type: 'Place/Update', placeIndex: placeIndex, newPlace: newPlace };
  };

  actionCreators.updatePlaceMap = function (placeIndex, newPlaceMap) {
    return { type: 'Place/Map/Update', placeIndex: placeIndex, newPlaceMap: newPlaceMap };
  };

  // UI
  actionCreators.openStartPanel = function () {
    return { type: 'UI/OpenStartPanel' };
  };

  actionCreators.openPausePanel = function () {
    return { type: 'UI/OpenPausePanel' };
  };

  actionCreators.openWinPanel = function () {
    return { type: 'UI/OpenWinPanel' };
  };

  actionCreators.updateModal = function (modal) {
    return { type: 'UI/OpenModal', modal: modal };
  };

  actionCreators.openKeyboardControlsModal = function () {
    return actionCreators.updateModal('keyboardControls');
  };

  actionCreators.switchCurrentlySelectedAction = function (actionName) {
    return {
      type: 'UI/SwitchCurrentlySelectedAction',
      meta: { sound: 'effects.hover' },
      actionName: actionName
    };
  };

  actionCreators.closePanel = function () {
    return { type: 'UI/ClosePanel' };
  };

  /* ==== Reducers ==== */
  var reducers = {};

  reducers.status = function (state, action) {
    switch (action.type) {
      case 'Status/StartGame':
        return 'started';
      case 'Status/PauseGame':
        return 'paused';
      case 'Status/StopGame':
        return 'stopped';
      case 'Status/WinGame':
        return 'won';
      default:
        return state;
    }
  };

  reducers.display = function (state, action) {
    switch (action.type) {
      case 'Display/SceneType':
        var sceneType = action.sceneType;

        return Object.assign({}, state, { sceneType: sceneType });
      case 'Display/StartTime':
        var startTime = action.startTime;

        return Object.assign({}, state, { startTime: startTime });
      case 'Display/EndTime':
        var endTime = action.endTime;

        return Object.assign({}, state, { endTime: endTime });
      case 'Display/ToggleMap':
        var map = !state.map;
        return Object.assign({}, state, { map: map });
      case 'Display/InvertPageColors':
        var invert = !state.invert;
        return Object.assign({}, state, { invert: invert });
      case 'Display/ToggleSolution':
        var solution = !state.solution;
        return Object.assign({}, state, { solution: solution });
      default:
        return state;
    }
  };

  reducers.player = function (state, action) {
    switch (action.type) {
      case 'Player/Move':
        var x = state.x,
            y = state.y;
        var _direction = action.direction;

        switch (_direction) {
          case 'W':
            x--;
            break;
          case 'E':
            x++;
            break;
          case 'N':
            y--;
            break;
          case 'S':
            y++;
            break;
        }
        return Object.assign({}, state, { direction: _direction, x: x, y: y });
      case 'Player/MovedSteps':
        var movedSteps = state.movedSteps;

        movedSteps++;
        return Object.assign({}, state, { movedSteps: movedSteps });
      case 'Player/MoveTo':
        var point = action.point;

        return Object.assign({}, state, { x: point.x, y: point.y });
      case 'Player/PlaceIndex':
        var placeIndex = action.placeIndex;

        return Object.assign({}, state, { placeIndex: placeIndex });
      default:
        return state;
    }
  };

  // @TODO: Split up reducer logic, flatten many-to-many relationships
  reducers.places = function (state, action) {
    var placeIndex = action.placeIndex;

    var _ret = function () {

      switch (action.type) {
        case 'Places/AddPlace':
          var place = action.place;

          return {
            v: state.concat([place])
          };
        case 'Place/Update':
          var newPlace = action.newPlace;

          return {
            v: state.map(function (place) {
              if (place.index !== placeIndex) return place;
              return Object.assign({}, place, newPlace);
            })
          };
        case 'Place/Map/Update':
          var newPlaceMap = action.newPlaceMap;

          return {
            v: state.map(function (place) {
              if (place.index !== placeIndex) return place;
              return Object.assign({}, place, { map: newPlaceMap });
            })
          };
        default:
          return {
            v: state
          };
      }
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  };

  reducers.ui = function (state, action) {
    switch (action.type) {
      case 'UI/OpenStartPanel':
        return Object.assign({}, state, {
          panel: 'start',
          panelActions: ['startGame', 'openKeyboardControlsModal', 'giveFeedback'],
          onSelectAction: 'startGame'
        });
      case 'UI/OpenPausePanel':
        return Object.assign({}, state, {
          panel: 'pause',
          panelActions: ['startGame', 'openKeyboardControlsModal', 'stopGame'],
          onSelectAction: 'startGame'
        });
      case 'UI/OpenWinPanel':
        return Object.assign({}, state, {
          panel: 'win',
          panelActions: ['stopGame'],
          onSelectAction: 'stopGame'
        });
      case 'UI/ClosePanel':
        return Object.assign({}, state, {
          panel: null
        });
      case 'UI/SwitchCurrentlySelectedAction':
        return Object.assign({}, state, {
          onSelectAction: action.actionName
        });
      case 'UI/OpenModal':
        var modal = action.modal;

        return Object.assign({}, state, { modal: modal });
      default:
        return state;
    }
  };

  /* ==== Middlewares ==== */
  var middlewares = {};

  middlewares.logger = function (store) {
    return function (next) {
      return function (action) {
        if (!DEBUG) return next(action);

        console.groupCollapsed(action.type);
        console.group('Action:');
        console.info(JSON.stringify(action, '', '\t'));
        console.groupEnd();
        console.groupCollapsed('Previous State:');
        console.info(JSON.stringify(store.getState(), '', '\t'));
        console.groupEnd();
        var result = next(action);
        console.groupCollapsed('State:');
        console.info(JSON.stringify(store.getState(), '', '\t'));
        console.groupEnd();
        console.groupEnd();

        return result;
      };
    };
  };

  // Run related actions after dispatching a main action
  middlewares.linked = function (store) {
    return function (next) {
      return function (action) {
        var linked = action.linked;


        if (!Array.isArray(linked)) {
          return next(action);
        }

        linked.map(function (linkedAction) {
          var _actionSpawn = actionCreators[linkedAction];
          if ((typeof _actionSpawn === 'undefined' ? 'undefined' : _typeof(_actionSpawn)) === undefined) return;
          store.dispatch(_actionSpawn());
        });

        return next(action);
      };
    };
  };

  // @REF: https://github.com/joshwcomeau/redux-sounds
  middlewares.soundSpawn = function (soundManager) {
    return function (store) {
      return function (next) {
        return function (action) {
          if ((typeof soundManager === 'undefined' ? 'undefined' : _typeof(soundManager)) !== 'object' || !soundManager.isSoundManager) {
            throw new Error('Missing sound manager');
          }

          if (!action.meta || !action.meta.sound) {
            return next(action);
          }

          var _action$meta$sound$sp = action.meta.sound.split('.'),
              _action$meta$sound$sp2 = _slicedToArray(_action$meta$sound$sp, 2),
              soundName = _action$meta$sound$sp2[0],
              spriteName = _action$meta$sound$sp2[1];

          soundManager.play(soundName, spriteName);

          return next(action);
        };
      };
    };
  };

  /* ==== Store Core ==== */

  var Store = function () {
    _createClass(Store, null, [{
      key: 'getInitialState',
      value: function getInitialState() {
        return {
          page: 'game', // @MAYBE: About
          status: 'stopped',
          display: {
            sceneType: 'text',
            cameraTraceTarget: 'player',
            invert: false,
            map: false,
            solution: false,
            // Stats
            startTime: null,
            endTime: null
          },
          player: { // Global Entity
            // Info
            name: 'Sarah',
            // Display
            placeIndex: 0,
            direction: 'S',
            x: 0,
            y: 0,
            // Stats
            movedSteps: 0
          },
          places: [],
          ui: {
            panel: 'start',
            onSelectAction: 'startGame',
            panelActions: ['startGame', 'openKeyboardControlsModal', 'giveFeedback'],
            modal: null
          }
        };
      }
    }]);

    function Store() {
      _classCallCheck(this, Store);

      for (var _len2 = arguments.length, middlewares = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        middlewares[_key2] = arguments[_key2];
      }

      this.middlewares = middlewares || [];
      this.subscribers = [];
      this.prevState = {};
      this.state = this._reduce();

      this._enableReduxDevtools();

      if (middlewares.length > 0) {
        this.dispatch = this._dispatchCombineMiddlewares();
      }
    }

    _createClass(Store, [{
      key: 'setState',
      value: function setState(state) {
        this.prevState = Object.assign({}, this.state);
        this.state = state;
      }
    }, {
      key: 'getState',
      value: function getState() {
        return this.state;
      }
    }, {
      key: 'getPrevState',
      value: function getPrevState() {
        return this.prevState;
      }
    }, {
      key: '_reduce',
      value: function _reduce() {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Store.getInitialState();
        var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        // @Hack: Reset state when stop to the game
        if (action.type === 'Status/StopGame') {
          return this._resetState();
        }

        // Normal reducers
        return {
          status: reducers.status(state.status, action),
          display: reducers.display(state.display, action),
          player: reducers.player(state.player, action),
          places: reducers.places(state.places, action),
          ui: reducers.ui(state.ui, action)
        };
      }
    }, {
      key: '_resetState',
      value: function _resetState() {
        // Create persistent settings
        var _state$display = this.state.display,
            sceneType = _state$display.sceneType,
            invert = _state$display.invert;

        var persistentDisplay = {
          sceneType: sceneType,
          invert: invert
        };
        var display = Object.assign(Store.getInitialState().display, persistentDisplay);

        return Object.assign(Store.getInitialState(), { display: display });
      }
    }, {
      key: '_enableReduxDevtools',
      value: function _enableReduxDevtools() {
        var _this6 = this;

        this._devStore = window.devToolsExtension && window.devToolsExtension(this._reduce.bind(this));
        if (this._devStore) {
          this._devStore.subscribe(function () {
            _this6.setState(_this6._devStore.getState());
            _this6._notifySubscribers();
          });
        }
      }
    }, {
      key: 'dispatch',
      value: function dispatch() {
        var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var reducer = this._reduce.bind(this);
        this.setState(reducer(this.state, action));
        this._notifySubscribers();
        if (this._devStore) this._devStore.dispatch(action);
        return action;
      }
    }, {
      key: '_dispatchCombineMiddlewares',
      value: function _dispatchCombineMiddlewares() {
        var _this7 = this;

        var dispatch = this.dispatch.bind(this);
        // Inject store "proxy" into all middleware
        var chain = this.middlewares.map(function (middleware) {
          return middleware(_this7);
        });
        // Init compose with store.dispatch as initial value
        return utils.compose.apply(utils, _toConsumableArray(chain))(dispatch);
      }
    }, {
      key: 'subscribe',
      value: function subscribe(fn) {
        this.subscribers.push(fn);
      }
    }, {
      key: '_notifySubscribers',
      value: function _notifySubscribers() {
        var _this8 = this;

        this.subscribers.map(function (subscriber) {
          subscriber(_this8.prevState, _this8.state);
        });
      }
    }]);

    return Store;
  }();

  /* == View Component Layer == */

  /* ==== Library & Engine ==== */

  /**
   * Keyboard Listener
   */

  var KeyboardListener = function () {
    _createClass(KeyboardListener, null, [{
      key: 'getDefaultOptions',
      value: function getDefaultOptions() {
        return {
          isKeyRepeat: true,
          handlePress: NOOP,
          handleRelease: NOOP
        };
      }
    }]);

    function KeyboardListener(options) {
      var _this9 = this;

      _classCallCheck(this, KeyboardListener);

      this.options = Object.assign({}, KeyboardListener.getDefaultOptions(), options);
      this.pressedKeys = {}; // ASCII table
      this.throttleds = {};

      // Attach event listeners
      window.addEventListener('keydown', function (e) {
        return _this9.handleKeydown(e);
      });
      window.addEventListener('keyup', function (e) {
        return _this9.handleKeyup(e);
      });
    }

    _createClass(KeyboardListener, [{
      key: 'handleKeydown',
      value: function handleKeydown(e) {
        var throttle = utils.throttle;
        var pressedKeys = this.pressedKeys,
            throttleds = this.throttleds;
        var _options8 = this.options,
            isKeyRepeat = _options8.isKeyRepeat,
            handlePress = _options8.handlePress;

        var keyCode = e.keyCode;

        if (!isKeyRepeat && this.isPressed(keyCode)) return;
        pressedKeys[keyCode] = true;

        for (var key in pressedKeys) {
          if (!pressedKeys[key]) continue;
          if (!throttleds[key]) {
            throttleds[key] = throttle(handlePress, 168, {
              trailing: false
            });
          }
          throttleds[key](~~key);
        }
      }
    }, {
      key: 'handleKeyup',
      value: function handleKeyup(e) {
        var handleRelease = this.options.handleRelease;

        var keyCode = e.keyCode;

        this.pressedKeys[keyCode] = false;

        if (typeof handleRelease === 'function') {
          handleRelease(e);
        }
      }
    }, {
      key: 'isPressed',
      value: function isPressed(keyCode) {
        return this.pressedKeys[keyCode];
      }
    }]);

    return KeyboardListener;
  }();

  /**
   * Sound Manager
   */

  var SoundManager = function () {
    _createClass(SoundManager, null, [{
      key: 'getDefaultOptions',
      value: function getDefaultOptions() {
        return {
          bgmURLs: ['./assets/sounds/bgm.mp3'],
          effectsURLs: ['./assets/sounds/effects.mp3'],
          effectsSprite: {
            // HUD
            hover: [0, 2000],
            click: [3000, 2000],
            // Controls
            move: [15000, 2000],
            // Status
            success: [25000, 2000]
          },
          onLoadedSuccess: NOOP
        };
      }
    }]);

    function SoundManager(options) {
      _classCallCheck(this, SoundManager);

      this.options = Object.assign({}, SoundManager.getDefaultOptions(), options);
      this.isSoundManager = true;
      this.mount();
    }

    _createClass(SoundManager, [{
      key: 'mount',
      value: function mount() {
        var _this10 = this;

        var _options9 = this.options,
            bgmURLs = _options9.bgmURLs,
            effectsURLs = _options9.effectsURLs;


        this.types = [], this._loadedTypes = [];

        if (bgmURLs.length) this.types.push('bgm');
        if (effectsURLs.length) this.types.push('effects');

        this.types.map(function (type) {
          return _this10.soundBuilder(type);
        });
      }
    }, {
      key: 'play',
      value: function play(soundName, spriteName) {
        var sound = this[soundName];

        if (typeof sound === 'undefined') {
          return console.warn('\n        The sound \'' + soundName + '\' was requested, but SoundManager doesn\'t have anything registered under that name.\n      ');
        } else if (spriteName && typeof sound._sprite[spriteName] === 'undefined') {
          var validSprites = Object.keys(sound._sprite).join(', ');

          return console.warn('\n        The sound \'' + soundName + '\' was found, but it does not have a sprite specified for \'' + spriteName + '\'.\n        It only has access to the following sprites: ' + validSprites + '.\n      ');
        }

        sound.play(spriteName);
      }
    }, {
      key: 'onLoaded',
      value: function onLoaded() {
        var _this11 = this;

        var onLoadedSuccess = this.options.onLoadedSuccess;

        this._loaded = false;

        var conditions = [function () {
          return !_this11._loaded;
        }, function () {
          return _this11._loadedTypes.length === _this11.types.length;
        }];

        if (conditions.every(function (c) {
          return c();
        })) {
          this._loaded = true;
          onLoadedSuccess();
        }
      }
    }, {
      key: 'soundBuilder',
      value: function soundBuilder(type) {
        var _this12 = this;

        if (!type) return;

        var options = {};
        var sprite = this.options[type + 'Sprite'];

        options.src = this.options[type + 'URLs'];
        options.loop = sprite ? false : true;
        options.onload = function () {
          _this12._loadedTypes.push(type);
          _this12.onLoaded();
        };

        if (sprite) options.sprite = sprite;

        this[type] = new Howl(options);
      }
    }]);

    return SoundManager;
  }();

  /**
   * Absolute Layout Engine
   */

  var AbsoluteLayoutEngine = function () {
    _createClass(AbsoluteLayoutEngine, null, [{
      key: 'getDefaultOptions',
      value: function getDefaultOptions() {
        return {
          unit: '%',
          unitLength: 5
        };
      }
    }]);

    function AbsoluteLayoutEngine(options) {
      _classCallCheck(this, AbsoluteLayoutEngine);

      this.options = Object.assign({}, AbsoluteLayoutEngine.getDefaultOptions(), options);
    }

    _createClass(AbsoluteLayoutEngine, [{
      key: 'getPositionAt',
      value: function getPositionAt(x, y, isNagative) {
        var _options10 = this.options,
            unit = _options10.unit,
            unitLength = _options10.unitLength;


        var left = unitLength * x;
        var top = unitLength * y;

        if (isNagative) {
          left *= -1;
          top *= -1;
        }

        return {
          left: '' + left + unit,
          top: '' + top + unit
        };
      }
    }, {
      key: 'getPositionTransformAt',
      value: function getPositionTransformAt() {
        var offset = this.getPositionAt.apply(this, arguments);

        return {
          transform: 'translate3d(' + offset.left + ', ' + offset.top + ', 0)'
        };
      }
    }]);

    return AbsoluteLayoutEngine;
  }();

  /**
   * Hero-Focused Camera
   *
   * @DESC: Camera <-> Scene Viewport <-> Scene Layer
   * @DEP: Layout Engine
   */

  var HeroFocusedCamera = function () {
    _createClass(HeroFocusedCamera, null, [{
      key: 'getDefaultOptions',
      value: function getDefaultOptions() {
        return {
          layoutEngine: null,
          heroPoint: {
            x: 0,
            y: 0
          },
          totalCols: 0,
          totalRows: 0
        };
      }
    }]);

    function HeroFocusedCamera(options) {
      _classCallCheck(this, HeroFocusedCamera);

      this.options = Object.assign({}, HeroFocusedCamera.getDefaultOptions(), options);
    }

    _createClass(HeroFocusedCamera, [{
      key: 'getViewportSize',
      value: function getViewportSize() {
        var layoutEngine = this.options.layoutEngine;
        var _layoutEngine$options = layoutEngine.options,
            unitLength = _layoutEngine$options.unitLength,
            unit = _layoutEngine$options.unit;


        if (unit === 'px') {
          return {
            viewportCols: window.innerWidth / unitLength,
            viewportRows: window.innerHeight / unitLength
          };
        } else {
          var aspectRatio = window.innerWidth / window.innerHeight;
          var viewportRows = 100 / unitLength;
          var viewportCols = viewportRows * aspectRatio;
          return {
            viewportCols: viewportCols,
            viewportRows: viewportRows
          };
        }
      }
    }, {
      key: 'getViewportOffset',
      value: function getViewportOffset() {
        var _options11 = this.options,
            layoutEngine = _options11.layoutEngine,
            heroPoint = _options11.heroPoint,
            totalCols = _options11.totalCols,
            totalRows = _options11.totalRows;

        var _getViewportSize = this.getViewportSize(),
            viewportCols = _getViewportSize.viewportCols,
            viewportRows = _getViewportSize.viewportRows;

        // X


        var minX = 0;
        var maxX = totalCols - viewportCols;
        var cameraX = heroPoint.x - viewportCols / 2;
        cameraX = Math.min(cameraX, maxX);
        cameraX = Math.max(cameraX, minX);

        // Y
        var minY = 0;
        var maxY = totalRows - viewportRows;
        var cameraY = heroPoint.y - viewportRows / 2;
        cameraY = Math.min(cameraY, maxY);
        cameraY = Math.max(cameraY, minY);

        return layoutEngine.getPositionTransformAt(cameraX, cameraY, true);
      }
    }, {
      key: 'getSceneLayerSize',
      value: function getSceneLayerSize() {
        var _options12 = this.options,
            layoutEngine = _options12.layoutEngine,
            totalCols = _options12.totalCols,
            totalRows = _options12.totalRows;
        var _layoutEngine$options2 = layoutEngine.options,
            unitLength = _layoutEngine$options2.unitLength,
            unit = _layoutEngine$options2.unit;


        return {
          width: '' + totalCols * unitLength + unit,
          height: '' + totalRows * unitLength + unit
        };
      }
    }]);

    return HeroFocusedCamera;
  }();

  /* ==== Mixin ==== */

  /**
   * Mixin with Component
   *
   * @TODO: Separate some mixins into files when supporting ES6 Modules
   */

  var mixinWithComponent = function mixinWithComponent() {
    for (var _len3 = arguments.length, mixins = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      mixins[_key3] = arguments[_key3];
    }

    // MixedComponent Class
    var MixedComponent = function MixedComponent() {
      var _this13 = this;

      _classCallCheck(this, MixedComponent);

      MixedComponent.mixinConstructors.map(function (f) {
        return f.call(_this13);
      });
    };

    // Static props


    MixedComponent.mixinConstructors = [];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = mixins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var mixin = _step.value;

        // @TODO: Would need to handle mixin collisions...

        // Collect constructor of mixin
        if (typeof mixin._constructor === 'function') {
          MixedComponent.mixinConstructors.push(mixin._constructor);
          delete mixin._constructor;
        }

        // Mount functions to MixedComponent.prototype
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Object.keys(mixin)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var name = _step2.value;

            MixedComponent.prototype[name] = mixin[name];
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return MixedComponent;
  };

  /**
   * VNode Mixin
   */

  var vnodeMixin = Object.assign({}, window.maquette, {

    _constructor: function _constructor() {
      this._subClasses = {};
      this._projector = this.createProjector({});
      this.hc = this.hc.bind(this); // @FIXME: Integrate into `h`
    },

    hc: function hc(ComponentClass, props, children) {
      if (typeof ComponentClass !== 'function') {
        throw new Error('The first argument of `hc` should be a Component Class');
      }

      var component = null;
      var componentName = ComponentClass.name;

      if (this._subClasses[componentName]) {
        component = this._subClasses[componentName];
        component.updateProps(props);
      } else {
        component = new ComponentClass(props, children);
        this._subClasses[componentName] = component;
      }

      if (typeof component.render !== 'function') {
        throw new Error('No render function found in Component ' + ComponentClass.name);
      }

      return component.render();
    },

    mount: function mount($container) {
      var renderFunction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.render.bind(this);

      this._projector.append($container, renderFunction);
    },

    update: function update(props) {
      this.updateProps(props);
      this._projector.scheduleRender();
    },

    resume: function resume() {
      this._projector.resume();
    },

    stop: function stop() {
      this._projector.stop();
    }

  });

  /**
   * Style Mixin
   */

  // @Hack: Prevent duplicate styles
  var _insertedCss = {};

  var _styleVariables = {
    // Colors
    svPrimary: '#f3904e',
    svSecond: '#a6a6a6',
    svBackground: '#EEEEEE',
    svMask: 'rgba(245, 245, 245, 0.8)',
    svCard: 'rgba(255, 255, 255, 0.95)',

    // ZIndex
    svZIndexScene: 23,
    svZIndexHud: 233,
    svZIndexPanel: 2333,
    svZIndexModal: 23333,

    zPlaceholder: '-_-'
  };

  var styleMixin = Object.assign({ csjs: window.csjs }, {
    // @TODO: Define variables & utils

    _constructor: function _constructor() {
      var _this14 = this;

      if (!this.style) return;

      // Register global variables
      this.sv = _styleVariables;

      // Get the classNames from the styles
      var styles = this.style();
      var _s = {};
      Object.keys(styles).map(function (styleName) {
        return _s[styleName] = styles[styleName].classNames;
      });

      // Mount the styles object & the util function
      this.s = _s;
      this.sc = function () {
        for (var _len4 = arguments.length, arg = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          arg[_key4] = arguments[_key4];
        }

        var classnames = _this14.csjs.deps.classNames(arg).split(' ');
        var classnamesObj = {};
        classnames.map(function (classname) {
          return classnamesObj[classname] = true;
        });
        return classnamesObj;
      };

      // Inject the static string of CSS
      var constructorName = this.constructor.name;
      if (_insertedCss[constructorName]) {
        return null;
      } else {
        _insertedCss[constructorName] = true;
      }
      var staticCss = this.csjs.getCss(styles);
      this.csjs.deps.insertCss(staticCss);
    }

  });

  /* ==== View ==== */

  /**
   * Base View
   *
   * @TODO: Think of a elegent way to combine tree-based structure and decoration (mixin-based inheritance)
   * @TODO: Beyond DOM-based view, make a magic to includes style, texture, sound, event and more info mixins
   */

  var BaseView = function (_mixinWithComponent) {
    _inherits(BaseView, _mixinWithComponent);

    _createClass(BaseView, null, [{
      key: 'getDefaultProps',
      value: function getDefaultProps() {
        return {
          canAutoRender: false
        };
      }
    }]);

    function BaseView(props) {
      var children = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      _classCallCheck(this, BaseView);

      var _this15 = _possibleConstructorReturn(this, (BaseView.__proto__ || Object.getPrototypeOf(BaseView)).call(this));

      _this15.props = Object.assign({}, BaseView.getDefaultProps(), props);
      _this15.children = children;

      if (_this15.props.canAutoRender) _this15.render();
      return _this15;
    }

    _createClass(BaseView, [{
      key: 'updateProps',
      value: function updateProps(props) {
        this.props = props;
      }
    }, {
      key: 'render',
      value: function render() {
        var h = this.h,
            children = this.children;


        return h('div', 'Default render function, please override me', children);
      }
    }, {
      key: 'destory',
      value: function destory() {
        // @TODO
      }
    }]);

    return BaseView;
  }(mixinWithComponent(vnodeMixin, styleMixin));

  /* ==== Bottom Views ==== */
  // @TODO: Add more common UI views

  /**
   * Modal View
   */

  var ModalView = function (_BaseView) {
    _inherits(ModalView, _BaseView);

    function ModalView() {
      _classCallCheck(this, ModalView);

      return _possibleConstructorReturn(this, (ModalView.__proto__ || Object.getPrototypeOf(ModalView)).apply(this, arguments));
    }

    _createClass(ModalView, [{
      key: 'style',
      value: function style() {
        var _sv = this.sv,
            svPrimary = _sv.svPrimary,
            svZIndexModal = _sv.svZIndexModal,
            svCard = _sv.svCard;


        return this.csjs(_templateObject, svZIndexModal, svPrimary);
      }
    }, {
      key: 'render',
      value: function render() {
        var h = this.h,
            s = this.s,
            sc = this.sc,
            children = this.children;


        return h('div', { classes: sc(s.modalView), key: s.modalView }, [h('div', { classes: sc(s.modalDialog) }, [this.renderHeader(), h('div', { classes: sc(s.modalBody) }, children)]), h('div', {
          classes: sc(s.modalMask),
          onclick: this.handleCloseClick,
          bind: this
        })]);
      }
    }, {
      key: 'renderHeader',
      value: function renderHeader() {
        var h = this.h,
            s = this.s,
            sc = this.sc;
        var title = this.props.title;


        return h('div', { classes: sc(s.modalHeader) }, [this.renderTitle(), h('div', {
          classes: sc(s.modalClose),
          onclick: this.handleCloseClick,
          bind: this
        })]);
      }
    }, {
      key: 'renderTitle',
      value: function renderTitle() {
        var h = this.h,
            s = this.s,
            sc = this.sc;
        var title = this.props.title;


        if (!title) {
          return null;
        }

        return h('div', { classes: sc(s.modalTitle) }, title);
      }
    }, {
      key: 'handleCloseClick',
      value: function handleCloseClick() {
        var keyboardShortcuts = this.props.keyboardShortcuts;
        var simulateKeypress = utils.simulateKeypress;

        // @Hack: Simulate Keypress on click

        var keyName = keyboardShortcuts.togglePopup.split('|')[0];
        simulateKeypress(keyName);
      }
    }]);

    return ModalView;
  }(BaseView);

  /* ==== Top Views ==== */

  /**
   * KBC View - Keyboard Controls
   */

  var KBCView = function (_BaseView2) {
    _inherits(KBCView, _BaseView2);

    function KBCView() {
      _classCallCheck(this, KBCView);

      return _possibleConstructorReturn(this, (KBCView.__proto__ || Object.getPrototypeOf(KBCView)).apply(this, arguments));
    }

    _createClass(KBCView, [{
      key: 'style',
      value: function style() {
        return this.csjs(_templateObject2);
      }
    }, {
      key: 'render',
      value: function render() {
        var _this18 = this;

        var h = this.h,
            s = this.s,
            sc = this.sc;
        var keyboardShortcuts = this.props.keyboardShortcuts;


        var keyboardShortcutsMap = Object.keys(keyboardShortcuts);

        return h('div', { classes: sc(s.kbcView) }, keyboardShortcutsMap.map(function (action) {
          return h('div', { classes: sc(s.shortcutItem) }, [h('div', { classes: sc(s.shortcutKey), innerHTML: _this18.formatKeyAndAction(keyboardShortcuts[action]) }), h('div', { classes: sc(s.shortcutAction), innerHTML: _this18.formatKeyAndAction(action) })]);
        }));
      }
    }, {
      key: 'decamelize',
      value: function decamelize(str) {
        var sep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '-';

        return str.replace(/([a-z\d])([A-Z])/g, '$1' + sep + '$2').replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + sep + '$2').toLowerCase();
      }
    }, {
      key: 'formatKeyAndAction',
      value: function formatKeyAndAction(input) {
        var output = input;

        var textToSymbol = {
          leftArrow: '←',
          rightArrow: '→',
          upArrow: '↑',
          downArrow: '↓'
        };

        for (var text in textToSymbol) {
          output = output.replace(text, textToSymbol[text]);
        }

        output = this.decamelize(output, ' ').split('|').join(' &nbsp;/&nbsp; ');

        return output;
      }
    }]);

    return KBCView;
  }(BaseView);

  /**
   * HUD View
   */

  var HUDView = function (_BaseView3) {
    _inherits(HUDView, _BaseView3);

    function HUDView() {
      _classCallCheck(this, HUDView);

      return _possibleConstructorReturn(this, (HUDView.__proto__ || Object.getPrototypeOf(HUDView)).apply(this, arguments));
    }

    _createClass(HUDView, [{
      key: 'style',
      value: function style() {
        var svZIndexHud = this.sv.svZIndexHud;


        return this.csjs(_templateObject3, svZIndexHud);
      }
    }, {
      key: 'render',
      value: function render() {
        var h = this.h,
            s = this.s,
            sc = this.sc;


        return h('div', { classes: sc(s.hudView) }, [this.renderMap()]);
      }
    }, {
      key: 'renderMap',
      value: function renderMap() {
        var h = this.h;
        var display = this.props.display;


        if (!display.map) {
          return null;
        }

        return h('div', 'Map');
      }
    }]);

    return HUDView;
  }(BaseView);

  /**
   * Panel View
   */


  var PanelView = function (_BaseView4) {
    _inherits(PanelView, _BaseView4);

    function PanelView() {
      _classCallCheck(this, PanelView);

      return _possibleConstructorReturn(this, (PanelView.__proto__ || Object.getPrototypeOf(PanelView)).apply(this, arguments));
    }

    _createClass(PanelView, [{
      key: 'style',
      value: function style() {
        var _sv2 = this.sv,
            svPrimary = _sv2.svPrimary,
            svMask = _sv2.svMask,
            svZIndexPanel = _sv2.svZIndexPanel;


        return this.csjs(_templateObject4, svZIndexPanel, svMask, svPrimary);
      }
    }, {
      key: 'render',
      value: function render() {
        var _props = this.props,
            status = _props.status,
            ui = _props.ui;


        if (!ui.panel) return null;

        switch (status) {
          case 'stopped':
            return this.renderStartPanel();
          case 'paused':
            return this.renderPausedPanel();
          case 'won':
            return this.renderWonPanel();
          default:
            return null;
        }
      }
    }, {
      key: 'renderPanelWrap',
      value: function renderPanelWrap(children) {
        var h = this.h,
            s = this.s,
            sc = this.sc;


        return h('div', { classes: sc(s.panelWrap), key: s.panelWrap }, [h('div', { classes: sc(s.panelBody) }, [h('div', { classes: sc(s.panelTitle) }, GAME_NAME), h('div', { classes: sc(s.panelList) }, children)])]);
      }
    }, {
      key: 'renderStartPanel',
      value: function renderStartPanel() {
        var _this21 = this;

        var h = this.h,
            s = this.s,
            sc = this.sc;
        var ui = this.props.ui;
        var panelActions = ui.panelActions;


        var actionTexts = ['Start Game', 'Keyboard Controls', 'Give Feedback'];

        return this.renderPanelWrap(panelActions.map(function (action, index) {
          return _this21.renderPanelButton(action, actionTexts[index]);
        }));
      }
    }, {
      key: 'renderPausedPanel',
      value: function renderPausedPanel() {
        var _this22 = this;

        var h = this.h,
            s = this.s,
            sc = this.sc;
        var ui = this.props.ui;
        var panelActions = ui.panelActions;


        var actionTexts = ['Resume Game', 'Keyboard Controls', 'Return to Begin'];

        return this.renderPanelWrap(panelActions.map(function (action, index) {
          return _this22.renderPanelButton(action, actionTexts[index]);
        }));
      }
    }, {
      key: 'renderWonPanel',
      value: function renderWonPanel() {
        var _this23 = this;

        var h = this.h,
            s = this.s,
            sc = this.sc;
        var _props2 = this.props,
            player = _props2.player,
            display = _props2.display,
            ui = _props2.ui;
        var panelActions = ui.panelActions;


        var stepsTaken = player.movedSteps;
        var secondsTaken = new Date(display.endTime).getTime() - new Date(display.startTime).getTime();
        secondsTaken = Math.ceil(secondsTaken / 1000);

        var actionTexts = ['Return to Begin'];

        var blessings = h('div', {
          classes: sc(s.wonBlessings),
          innerHTML: 'Congratulations! You won the game.\n        <br/>Time taken is <em>' + secondsTaken + '</em> seconds with <em>' + stepsTaken + '</em> steps.'
        });

        var bottons = panelActions.map(function (action, index) {
          return _this23.renderPanelButton(action, actionTexts[index]);
        });

        return this.renderPanelWrap([blessings].concat(bottons));
      }
    }, {
      key: 'renderPanelButton',
      value: function renderPanelButton(action, text) {
        var _classes;

        var h = this.h,
            s = this.s,
            sc = this.sc;
        var ui = this.props.ui;


        return h('div', {
          classes: (_classes = {}, _defineProperty(_classes, s.panelButton, true), _defineProperty(_classes, s.isActive, ui.onSelectAction === action), _classes),
          dataAction: action,
          onmouseover: this.handlePanelButtonHover,
          onclick: this.handlePanelButtonClick,
          bind: this
        }, text);
      }
    }, {
      key: 'handlePanelButtonHover',
      value: function handlePanelButtonHover(e) {
        var dispatch = store.dispatch;
        var switchCurrentlySelectedAction = actionCreators.switchCurrentlySelectedAction;


        var $target = e.currentTarget;
        var actionName = $target.getAttribute('dataAction');

        dispatch(switchCurrentlySelectedAction(actionName));
      }
    }, {
      key: 'handlePanelButtonClick',
      value: function handlePanelButtonClick() {
        var keyboardShortcuts = this.props.keyboardShortcuts;
        var simulateKeypress = utils.simulateKeypress;

        // @Hack: Simulate Keypress on click

        simulateKeypress(keyboardShortcuts.select);
      }
    }]);

    return PanelView;
  }(BaseView);

  /**
   * Scene View
   */


  var SceneView = function (_BaseView5) {
    _inherits(SceneView, _BaseView5);

    function SceneView() {
      _classCallCheck(this, SceneView);

      return _possibleConstructorReturn(this, (SceneView.__proto__ || Object.getPrototypeOf(SceneView)).apply(this, arguments));
    }

    _createClass(SceneView, [{
      key: 'style',
      value: function style() {
        var _sv3 = this.sv,
            svPrimary = _sv3.svPrimary,
            svZIndexScene = _sv3.svZIndexScene;


        var svTextCellSize = 40; // 5
        var svTextCellUnit = 'px'; // vh

        this.lsv = {
          svTextCellSize: svTextCellSize,
          svTextCellUnit: svTextCellUnit
        };

        return this.csjs(_templateObject5, svZIndexScene, svTextCellSize, svTextCellUnit, svTextCellSize, svTextCellUnit, svTextCellSize, svTextCellUnit, svPrimary, svPrimary);
      }
    }, {
      key: 'render',
      value: function render() {
        var display = this.props.display;
        var sceneType = display.sceneType;
        var _lsv = this.lsv,
            svTextCellSize = _lsv.svTextCellSize,
            svTextCellUnit = _lsv.svTextCellUnit;


        this.layoutEngine = new AbsoluteLayoutEngine({
          unit: svTextCellUnit,
          unitLength: svTextCellSize
        });

        switch (sceneType) {
          case 'text':
            return this.renderTextScene();
          case 'graphic':
            return this.renderGraphicScene();
          default:
            return null;
        }
      }
    }, {
      key: 'renderSceneWrap',
      value: function renderSceneWrap(children) {
        var h = this.h,
            s = this.s,
            sc = this.sc;
        var _props$place = this.props.place,
            cols = _props$place.cols,
            rows = _props$place.rows;


        return h('div', { classes: sc(s.sceneWrap), key: s.sceneWrap }, children);
      }
    }, {
      key: 'renderTextScene',
      value: function renderTextScene() {
        var _this25 = this;

        var h = this.h,
            s = this.s,
            sc = this.sc;
        var layoutEngine = this.layoutEngine;
        var _layoutEngine$options3 = this.layoutEngine.options,
            unitLength = _layoutEngine$options3.unitLength,
            unit = _layoutEngine$options3.unit;
        var _props$place2 = this.props.place,
            map = _props$place2.map,
            cols = _props$place2.cols,
            rows = _props$place2.rows;


        var heroPoint = this.getCameraTraceTarget();
        var camera = new HeroFocusedCamera({
          layoutEngine: layoutEngine,
          heroPoint: heroPoint,
          totalCols: cols,
          totalRows: rows
        });

        var viewportOffset = camera.getViewportOffset();
        var sceneLayerSize = camera.getSceneLayerSize();

        return this.renderSceneWrap([h('div', { classes: sc(s.scene, s.textScene), styles: viewportOffset, key: s.textScene }, [h('div', { classes: sc(s.sceneLayer, s.sceneEntities), styles: sceneLayerSize }, [this.renderTextScenePlayer()]), h('div', { classes: sc(s.sceneLayer, s.sceneMap), styles: sceneLayerSize, key: s.sceneMap }, map.map(function (col, index) {
          return h('div', { classes: sc(s.commonCol), key: 'col-' + index }, [col.map(function (cell) {
            return _this25.renderTextCell(cell);
          })]);
        }))])]);
      }
    }, {
      key: 'getCameraTraceTarget',
      value: function getCameraTraceTarget() {
        var _props3 = this.props,
            display = _props3.display,
            player = _props3.player,
            place = _props3.place;
        var grid = place.grid;
        var cameraTraceTarget = display.cameraTraceTarget;


        switch (cameraTraceTarget) {
          case 'player':
            return player;
          default:
            return grid.getCellAt(0, 0);
        }
      }
    }, {
      key: 'renderTextScenePlayer',
      value: function renderTextScenePlayer() {
        var h = this.h,
            s = this.s,
            sc = this.sc;
        var layoutEngine = this.layoutEngine;
        var _props4 = this.props,
            status = _props4.status,
            player = _props4.player;


        var playerOffset = layoutEngine.getPositionTransformAt(player.x, player.y);

        if (status === 'stopped') {
          return null;
        }

        return h('div', {
          classes: sc(s.textCell, s.commonEntity, s.textEntity, s.typePlayer),
          styles: playerOffset }, '@');
      }
    }, {
      key: 'renderTextCell',
      value: function renderTextCell(cell) {
        var capitalize = utils.capitalize,
            randomChoice = utils.randomChoice;
        var h = this.h,
            s = this.s,
            sc = this.sc;
        var _props5 = this.props,
            display = _props5.display,
            place = _props5.place;
        var types = place.grid.options.types;


        var wallSymbols = ['#', '■', '/', '❄', '⚑', '◎'];

        var roadSymbols = ['.∵', '.∵。', '。.'];

        var typeSymbolsMap = {
          'start': 'S',
          'end': 'E',
          'wall': wallSymbols[3], // randomChoice(wallSymbols)
          'road': roadSymbols[0] // randomChoice(roadSymbols)
        };

        var topClasses = sc(s.commonCell, s.textCell);

        // @FIXME: Break the second rule http://maquettejs.org/docs/rules.html
        for (var type in types) {
          topClasses[s['type' + capitalize(type)]] = cell.type === type;
        }

        topClasses[s.isWalked] = cell.isWalked;
        topClasses[s.isSolution] = display.solution && cell.isSolution;

        return h('div', { classes: topClasses, key: 'cell-' + cell.x + '-' + cell.y }, typeSymbolsMap[cell.type]);
      }
    }, {
      key: 'renderGraphicScene',
      value: function renderGraphicScene() {
        var h = this.h,
            s = this.s,
            sc = this.sc;


        return this.renderSceneWrap([h('div', {
          classes: sc(s.scene, s.graphicScene),
          key: s.graphicScene
        }, 'Graphic scene is WIP, please press T to switch to text scene. (¬_¬)')]);
      }
    }]);

    return SceneView;
  }(BaseView);

  /**
   * Game View
   */


  var GameView = function (_BaseView6) {
    _inherits(GameView, _BaseView6);

    function GameView() {
      _classCallCheck(this, GameView);

      return _possibleConstructorReturn(this, (GameView.__proto__ || Object.getPrototypeOf(GameView)).apply(this, arguments));
    }

    _createClass(GameView, [{
      key: 'style',
      value: function style() {
        return this.csjs(_templateObject6);
      }
    }, {
      key: 'render',
      value: function render() {
        var _classes2;

        var h = this.h,
            hc = this.hc,
            s = this.s;
        var invert = this.props.display.invert;


        return h('div', { classes: (_classes2 = {}, _defineProperty(_classes2, s.game, true), _defineProperty(_classes2, s.isInvertColors, invert), _classes2) }, [this.renderModal(), this.renderPanel(), this.renderHUD(), this.renderScene()]);
      }
    }, {
      key: 'renderModal',
      value: function renderModal() {
        var h = this.h,
            hc = this.hc;
        var _props6 = this.props,
            ui = _props6.ui,
            keyboardShortcuts = _props6.keyboardShortcuts;
        var modal = ui.modal;


        var title = null;
        var content = null;

        if (!modal) {
          return null;
        } else if (modal === 'keyboardControls') {
          title = 'Keyboard Controls';
          content = hc(KBCView, { keyboardShortcuts: keyboardShortcuts });
        }

        return hc(ModalView, { keyboardShortcuts: keyboardShortcuts, title: title }, [content]);
      }
    }, {
      key: 'renderPanel',
      value: function renderPanel() {
        var hc = this.hc;
        var _props7 = this.props,
            status = _props7.status,
            player = _props7.player,
            display = _props7.display,
            ui = _props7.ui,
            keyboardShortcuts = _props7.keyboardShortcuts;


        return hc(PanelView, { status: status, player: player, display: display, ui: ui, keyboardShortcuts: keyboardShortcuts });
      }
    }, {
      key: 'renderScene',
      value: function renderScene() {
        var hc = this.hc;
        var _props8 = this.props,
            status = _props8.status,
            display = _props8.display,
            player = _props8.player,
            place = _props8.place;


        if (status === 'stopped' && !place) {
          return null;
        }

        return hc(SceneView, { status: status, display: display, player: player, place: place });
      }
    }, {
      key: 'renderHUD',
      value: function renderHUD() {
        var hc = this.hc;
        var _props9 = this.props,
            status = _props9.status,
            ui = _props9.ui,
            display = _props9.display;


        if (status === 'stopped') {
          return null;
        }

        return hc(HUDView, { ui: ui, display: display });
      }
    }]);

    return GameView;
  }(BaseView);

  /* ==== Game Main ==== */

  // Sound


  var soundManager = new SoundManager();

  // Store instance
  var store = new Store(
  // middlewares.logger,
  middlewares.linked, middlewares.soundSpawn(soundManager));

  // @TODO: MainLoop && Animation

  var Game = function () {
    _createClass(Game, null, [{
      key: 'getDefaultProps',
      value: function getDefaultProps() {
        return {
          renderMode: 'dom', // 'dom' | 'canvas'
          keyboardShortcuts: {
            // HUD
            select: 'enter',
            togglePopup: 'escape|p',
            // openMap: 'm',
            invertPageColors: 'i',
            getSolution: 'h',

            // Sence Type
            switchToTextScene: 't',
            switchToGraphicScene: 'g',

            // Direction
            moveLeft: 'leftArrow|a',
            moveRight: 'rightArrow|d',
            moveUp: 'upArrow|w',
            moveDown: 'downArrow|s'

            // Actions
            // jump: 'spacebar|j',
            // attack: 'k'
          }
        };
      }
    }]);

    function Game(props) {
      _classCallCheck(this, Game);

      // Data
      this.props = Object.assign({}, Game.getDefaultProps(), props); // Immutable = state
      this.state = store.getState(); // Update by dispatching action
      this.places = []; // Local data
      // DOMs
      this.$container = document.querySelector('.gameContainer');
      this.$body = document.querySelector('body');
      // Events
      this.keyboardListener = null;
      this._eventListeners();
      // Mount
      this._render(this.state);
      this._genPlaces();
      // @DEV
      // soundManager.bgm.mute(true)
      // soundManager.effects.mute(true)
      // this.start()
    }

    _createClass(Game, [{
      key: '_eventListeners',
      value: function _eventListeners() {
        // User inputs
        this.keyboardListener = new KeyboardListener({
          handlePress: this._handlePlayerKeydown.bind(this)
        });

        // Window
        window.addEventListener('resize', this._handleResizeWindow.bind(this), false);

        // Store
        store.subscribe(this._update.bind(this));

        // @MAYBE: Router, Socket...
        return this;
      }
    }, {
      key: '_handlePlayerKeydown',
      value: function _handlePlayerKeydown(keyCode) {
        var keymap = utils.keymap;
        var keyboardShortcuts = this.props.keyboardShortcuts;
        var status = this.state.status;


        var inputKeyName = keymap(keyCode);
        var persistingControls = ['togglePopup', 'select', 'invertPageColors', 'moveUp', 'moveDown'];
        var persistingKeys = persistingControls.map(function (control) {
          return keyboardShortcuts[control];
        }).join('|').split('|');

        var disableConditions = [function () {
          return inputKeyName === undefined;
        }, function () {
          return status !== 'started' && persistingKeys.indexOf(inputKeyName) === -1;
        }];

        if (disableConditions.some(function (c) {
          return c();
        })) return;

        this._runActionByMatchKey(inputKeyName);
      }
    }, {
      key: '_runActionByMatchKey',
      value: function _runActionByMatchKey(key) {
        var keyboardShortcuts = this.props.keyboardShortcuts;


        for (var action in keyboardShortcuts) {
          var pattern = keyboardShortcuts[action];
          var isMatched = new RegExp('^(' + pattern + ')$', 'ig').test(key);
          // @TODO: Move event handlers into each view components, especially for UI
          if (isMatched) this['handle' + utils.capitalize(action)]();
        }
      }
    }, {
      key: '_handleResizeWindow',
      value: function _handleResizeWindow() {
        store.dispatch(actionCreators.resizeWindow());
      }
    }, {
      key: '_genPlaces',
      value: function _genPlaces() {
        var places = this.places;


        var placeNames = ['Brekka',
        // 'Prestbakki',
        'Tungufell'];

        var baseCols = 57;
        var baseRows = 47;
        var sizeDelta = 21;

        placeNames.map(function (name, index) {
          var cols = baseCols + index * sizeDelta;
          var rows = baseRows + index * sizeDelta;

          var grid = new MazeGrid({ cols: cols, rows: rows, name: name });
          var place = {
            index: index,
            name: name,
            cols: cols,
            rows: rows,
            grid: grid,
            map: grid.getMatrix()
          };

          places.push(place);
          store.dispatch(actionCreators.addPlace({}));
        });
      }
    }, {
      key: '_update',
      value: function _update() {
        this.state = store.getState();
        var combinedState = this._genCombinedState(this.state);
        this.renderer.update(combinedState);
      }
    }, {
      key: '_genCombinedState',
      value: function _genCombinedState(state) {
        var keyboardShortcuts = this.props.keyboardShortcuts;

        var place = this.getCurrentPlace();

        return Object.assign({}, state, {
          keyboardShortcuts: keyboardShortcuts,
          place: place
        });
      }
    }, {
      key: '_render',
      value: function _render() {
        var renderMode = this.props.renderMode;


        switch (renderMode) {
          case 'dom':
            return this._renderInDOM();
          case 'canvas':
            return this._renderInCanvas();
        }
      }
    }, {
      key: '_renderInDOM',
      value: function _renderInDOM() {
        var combinedState = this._genCombinedState(this.state);

        this.renderer = new GameView(combinedState);
        this.renderer.mount(this.$container);
      }
    }, {
      key: '_renderInCanvas',
      value: function _renderInCanvas(state) {
        var combinedState = this._genCombinedState(this.state);

        // @TODO: HTML 2 Canvas
        // @P.S. Supportting multiple renderers is a complex abstraction, refer to Pixi.js or React
      }
    }, {
      key: '_initPlayer',
      value: function _initPlayer() {
        var place = this.getCurrentPlace();
        var startCell = place.grid.getStartCell();

        store.dispatch(actionCreators.playerMoveTo(startCell.getPoint()));
      }
    }, {
      key: 'getCurrentPlace',
      value: function getCurrentPlace() {
        var places = this.places;
        var display = this.state.display;
        var cameraTraceTarget = display.cameraTraceTarget;


        var placeIndex = this.state[cameraTraceTarget].placeIndex;

        return places[placeIndex];
      }
    }, {
      key: 'start',
      value: function start() {
        var display = this.state.display;
        var startTime = display.startTime;


        if (!startTime) {
          store.dispatch(actionCreators.startTime(new Date()));
          this._initPlayer();
        }

        store.dispatch(actionCreators.startGame());
        soundManager.bgm.play();
      }
    }, {
      key: 'pause',
      value: function pause() {
        store.dispatch(actionCreators.pauseGame());
        soundManager.bgm.pause();
      }
    }, {
      key: 'resume',
      value: function resume() {
        this.start();
      }
    }, {
      key: 'stop',
      value: function stop() {
        this.places = [];
        this._genPlaces();
        store.dispatch(actionCreators.stopGame());

        soundManager.bgm.pause();
        soundManager.bgm.seek(0);
      }
    }, {
      key: 'handleTogglePopup',
      value: function handleTogglePopup() {
        var _state = this.state,
            status = _state.status,
            ui = _state.ui;


        if (ui.modal) {
          return store.dispatch(actionCreators.updateModal(null));
        }

        if (status === 'paused') {
          this.resume();
        } else if (status === 'started') {
          this.pause();
        }
      }
    }, {
      key: 'handleSelect',
      value: function handleSelect() {
        var _state2 = this.state,
            status = _state2.status,
            ui = _state2.ui;


        if (ui.modal) {
          return store.dispatch(actionCreators.updateModal(null));
        }

        if (!ui.panel) return;

        soundManager.play('effects', 'click');

        switch (ui.onSelectAction) {
          case 'giveFeedback':
            return window.open(FEEDBACK_URL);
          case 'startGame':
            return this.start();
          case 'stopGame':
            return this.stop();
          default:
            var action = actionCreators[ui.onSelectAction];
            if (action) store.dispatch(action());
        }
      }
    }, {
      key: '_handleMovePlayer',
      value: function _handleMovePlayer(dir) {
        var place = this.getCurrentPlace();
        var player = this.state.player;
        var getDX = direction.getDX,
            getDY = direction.getDY;
        var grid = place.grid;


        var nextPoint = {
          x: player.x + getDX(dir),
          y: player.y + getDY(dir)
        };

        var nextCell = grid.getCellAt(nextPoint.x, nextPoint.y);

        if (!nextCell || !nextCell.walkable) {
          return null;
        }

        nextCell.walk();
        store.dispatch(actionCreators.playerMove(dir));

        if (nextCell.type === 'end') {
          this._handleEndPoint();
        }
      }
    }, {
      key: '_handleEndPoint',
      value: function _handleEndPoint() {
        var places = this.places;
        var player = this.state.player;


        var nextPlaceIndex = player.placeIndex + 1;

        if (nextPlaceIndex >= places.length) {
          store.dispatch(actionCreators.endTime(new Date()));
          store.dispatch(actionCreators.winGame());
        } else {
          store.dispatch(actionCreators.playerPlaceIndex(nextPlaceIndex));
          this._initPlayer();
        }

        soundManager.effects.play('success');
      }
    }, {
      key: 'handleMoveLeft',
      value: function handleMoveLeft() {
        this._handleMovePlayer('W');
      }
    }, {
      key: 'handleMoveRight',
      value: function handleMoveRight() {
        this._handleMovePlayer('E');
      }
    }, {
      key: 'handleMoveUp',
      value: function handleMoveUp() {
        var _state3 = this.state,
            status = _state3.status,
            ui = _state3.ui;
        var panel = ui.panel,
            panelActions = ui.panelActions,
            onSelectAction = ui.onSelectAction,
            modal = ui.modal;


        if (modal) return;

        if (panel) {
          var currentIndex = panelActions.indexOf(onSelectAction);
          var nextIndex = currentIndex === 0 ? panelActions.length - 1 : currentIndex - 1;
          var nextAction = panelActions[nextIndex];
          store.dispatch(actionCreators.switchCurrentlySelectedAction(nextAction));
        } else if (status === 'started') {
          this._handleMovePlayer('N');
        }
      }
    }, {
      key: 'handleMoveDown',
      value: function handleMoveDown() {
        var _state4 = this.state,
            status = _state4.status,
            ui = _state4.ui;
        var panel = ui.panel,
            panelActions = ui.panelActions,
            onSelectAction = ui.onSelectAction,
            modal = ui.modal;


        if (modal) return;

        if (panel) {
          var currentIndex = panelActions.indexOf(onSelectAction);
          var nextIndex = currentIndex === panelActions.length - 1 ? 0 : currentIndex + 1;
          var nextAction = panelActions[nextIndex];
          store.dispatch(actionCreators.switchCurrentlySelectedAction(nextAction));
        } else if (status === 'started') {
          this._handleMovePlayer('S');
        }
      }
    }, {
      key: 'handleOpenMap',
      value: function handleOpenMap() {
        store.dispatch(actionCreators.toggleMap());
      }
    }, {
      key: 'handleInvertPageColors',
      value: function handleInvertPageColors() {
        store.dispatch(actionCreators.invertPageColors());
      }
    }, {
      key: 'handleGetSolution',
      value: function handleGetSolution() {
        store.dispatch(actionCreators.toggleSolution());
      }
    }, {
      key: 'handleSwitchToTextScene',
      value: function handleSwitchToTextScene() {
        store.dispatch(actionCreators.switchSenceType('text'));
      }
    }, {
      key: 'handleSwitchToGraphicScene',
      value: function handleSwitchToGraphicScene() {
        store.dispatch(actionCreators.switchSenceType('graphic'));
      }
    }, {
      key: 'handleJump',
      value: function handleJump() {
        // @TODO
      }
    }, {
      key: 'handleAttack',
      value: function handleAttack() {
        // @TODO
      }
    }]);

    return Game;
  }();

  /* == Init == */


  void function init() {
    var config = {};
    var game = new Game(config);
    if (DEBUG) window.game = game;
  }();
}();

//# sourceMappingURL=scripts.js.map