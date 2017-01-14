void function () {

/**
 * Peaceful Roguelike Wonderland
 *
 * @Project URL: https://github.com/SuneBear/SB-Playgrounds/tree/master/src/games/peaceful-roguelike-wonderland
 * @Code Overview:
 *  - Utils
 *  |-- compose
 *  |-- keymap
 *  - Roguelike
 *  - Data Layer: Redux-like Pattern
 *  |-- Action Creators
 *  |-- Reducers
 *  |-- Middlewares
 *  |-- Store Core
 *  - View Component Layer
 *  |-- Library & Engine
 *  |-- Views
 *  |--|-- Bottom Views: UI, High Order
 *  |--|-- Top Views: BLL, Singleton
 *  |-- Game Main
 *  - Init
 */

/* == Utils == */

const utils = {}

// FP high order function
utils.compose = (...fns) => arg => {
  return fns.reduceRight((composed, fn) => fn(composed), arg)
}

// keycode <=> keyname
utils.keymap = (() => {
  // Incomplete keycodes map
  const keycodesMap = {
    13: 'enter',
    27: 'escape',
    32: 'spacebar',
    37: 'leftArrow',
    38: 'upArrow',
    39: 'rightArrow',
    40: 'downArrow',
    46: 'delete'
  }

  // Append numbers
  for (let i = 48; i < 58; i++) keycodesMap[i] = i - 48

  // Append low case alphabets
  for (let i = 97; i < 123; i++) keycodesMap[i - 32] = String.fromCharCode(i)

  // Append function keys
  for (let i = 1; i < 13; i++) keycodesMap[i + 111] = 'f' + i

  const swappedKeycodesMap = Object.keys(keycodesMap).reduce((obj, key) => {
    obj[keycodesMap[key]] = key
    return obj
  }, {})

  return (arg) => typeof arg === 'number' ? keycodesMap[arg] : swappedKeycodesMap[arg]
})()

/* == Roguelike == */

const roguelike = {}

/* == Data Layer == */

/* ==== Action Creators ==== */
const actionCreators = {}

actionCreators.startGame = () => {
  return {
    type: 'StartGame'
  }
}


/* ==== Reducers ==== */
const reducers = {}

reducers.status = (state, action) => {
  switch (action.type) {
    case 'StartGame':
      return 'started'
    case 'PauseGame':
      return 'paused'
    case 'StopGame':
      return 'stopped'
    default:
      return state
  }
}

/* ==== Middlewares ==== */
const middlewares = {}

middlewares.logger = store => next => action => {
  if (!DEBUG) return next(action)

  console.groupCollapsed(action.type)
    console.group('Action:')
      console.log(JSON.stringify(action, '', '\t'))
    console.groupEnd()
    console.groupCollapsed('Previous State:')
      console.log(JSON.stringify(store.getState(), '', '\t'))
    console.groupEnd()
    const result = next(action)
    console.groupCollapsed('State:')
      console.log(JSON.stringify(store.getState(), '', '\t'))
    console.groupEnd()
  console.groupEnd()

  return result
}

/* ==== Store Core ==== */
class Store {

  static getInitialState () {
    return {
      page: 'game', // @MAYBE: About
      status: 'stopped'
    }
  }

  constructor (...middlewares) {
    this.middlewares = middlewares || []
    this.subscribers = []
    this.prevState = {}
    this.state = this._reduce(Store.getInitialState(), {})

    if (middlewares.length > 0) {
      this.dispatch = this._dispatchCombineMiddlewares()
    }
  }

  getState () {
    return this.state
  }

  getPrevState () {
    return this.prevState
  }

  _reduce (state = {}, action) {
    return {
      status: reducers.status(state.status, action)
    }
  }

  dispatch (action) {
    this.prevState = this.state
    this.state = this._reduce(this.state, action)
    this._notifySubscribers()
    return action
  }

  _dispatchCombineMiddlewares () {
    const dispatch = this.dispatch.bind(this)
    // Inject store "proxy" into all middleware
    const chain = this.middlewares.map(middleware => middleware(this))
    // Init compose with store.dispatch as initial value
    return utils.compose(...chain)(dispatch)
  }

  subscribe (fn) {
    this.subscribers.push(fn)
  }

  _notifySubscribers () {
    this.subscribers.map((subscriber) => {
      subscriber(this.prevState, this.state)
    })
  }

}

/* == View Component Layer == */

/* ==== Library & Engine ==== */

/**
 * Base View Class
 *
 * @TODO: Think of a elegent way to combine tree-based structure and decoration
 * @TODO: Convert ES6 string template to virtual-node
 * @TODO: Beyond DOM-based view, make a magic to includes style, texture, sound and more info decorations
 */

class BaseView {

}

/**
 * Style Decoration Class
 */

class StyleDecoration {

}

/**
 * Sound Decoration Class
 */

class SoundDecoration {

}

/* ==== Views: Bottom ==== */
// @TODO: Add some common UI views

/* ==== Views: Top ==== */

class HUDView {

  constructor (props) {

  }

}

class PanelView {

  constructor (props) {

  }

}

/* ==== Game Main ==== */

// Store instance
const store = new Store(
  middlewares.logger
)

class Game {
  static getDefaultProps () {
    return {
      renderMode: 'dom', // 'dom' | 'canvas'
      keyboardShortcuts: {
        // HUD
        togglePanel: 'escape|p',

        // Move
        moveLeft: 'leftArrow|a',
        moveRight: 'rightArrow|d',
        moveTop: 'upArrow|w',
        moveBottom: 'downArrow|s',

        // Actions
        jump: 'spacebar|j',
        attack: 'k'
      }
    }
  }

  constructor (props) {
    // Data
    this.props = Object.assign({}, Game.getDefaultProps(), props) // Immutable
    this.state = store.getState() // Update by dispatching action
    // DOMs
    this.$container = document.querySelector('.gameContainer')
    this.$body      = document.querySelector('body')
    // Views
    this.views = {}
    // Mount
    this._eventListeners()
    this.start()
  }

  _eventListeners () {
    // Player inputs
    this.$body.addEventListener('keydown', e => this._handlePlayerKeydown(e))

    // Store subscribe
    store.subscribe(this._update.bind(this))

    // @MAYBE: Router, Socket...
    return this
  }

  _handlePlayerKeydown (e) {
    const { keyboardShortcuts } = this.props
    const inputKeyName = utils.keymap(e.keyCode)

    if (inputKeyName === undefined) return

    for (let action in keyboardShortcuts) {
      const pattern = keyboardShortcuts[action]
      const isMatched = new RegExp(`^(${pattern})$`, 'ig').test(inputKeyName)
      if (isMatched) return console.log(action) // @TODO: Dispatch Action
    }
  }

  _update () {
    this.state = store.getState()
    this._render(this.state)
  }

  _render (state) {
    const {
      renderMode
    } = this.props

    switch (renderMode) {
      case 'dom':
        return this._renderInDOM(state)
      case 'canvas':
        return this._renderInCanvas(state)
    }
  }

  _renderInDOM (state)  {
    this.$container.innerHTML = 'Hello World!'
  }

  _renderInCanvas (state) {
    // @TODO: HTML 2 Canvas
    // @P.S. Supportting multiple renderers is a complex abstraction, refer to Pixi.js or React
  }

  start () {
    store.dispatch(actionCreators.startGame())
  }

  pause () {
    // @TODO
  }

  resume () {
    // @TODO
  }

}

/* == Init == */

const config = { }
const game = new Game(config)
if (DEBUG) window.game = game

}()
