void function () {

/**
 * Peaceful Roguelike Wonderland
 *
 * @Project URL: https://github.com/SuneBear/SB-Playgrounds/tree/master/src/games/peaceful-roguelike-wonderland
 *
 * @Dependences:
 *  - CSJS - Write modular, scoped CSS with valid JavaScript
 *  - Maquette - Pure and simple virtual DOM library
 *
 * @Code Overview:
 *  - Utils
 *  |-- compose
 *  |-- capitalize
 *  |-- keymap
 *  - Roguelike
 *  - Data Layer: Redux-like Pattern
 *  |-- Action Creators
 *  |-- Reducers
 *  |-- Middlewares
 *  |-- Store Core
 *  - View Component Layer
 *  |-- Library & Engine
 *  |--|-- Keyboard Listener
 *  |--|-- Sound Manager
 *  |--|-- Hero-Focused Viewport
 *  |-- Mixin: Currently just a sorted feature without interfering, please improve me...
 *  |--|-- Mixin with Component (Deprecated)
 *  |--|-- VNode Mixin (Dependence on Maquette)
 *  |--|-- Style Mixin (Dependence on CSJS)
 *  |-- View
 *  |--|-- Base View
 *  |--|-- Bottom Views: UI, High Order
 *  |--|-- Top Views: BLL, Singleton
 *  |-- Game Main
 *  - Init
 *
 * @List of Abbrs. of View Component:
 *  - h: HyperScript implemented by Maquette
 *  - hc: Include view component in HyperScript
 *  - s: Object of CSJS styles
 *  - sc: classNames util
 */

/* == Utils == */

const utils = {}

// FP high order function
utils.compose = (...fns) => arg => {
  return fns.reduceRight((composed, fn) => fn(composed), arg)
}

// Capitalize
utils.capitalize = str => {
  return str && str[0].toUpperCase() + str.slice(1)
}

// keycode <=> keyname
utils.keymap = (() => {
  // Incomplete keyCodes map
  const keyCodesMap = {
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
  for (let i = 48; i < 58; i++) keyCodesMap[i] = i - 48

  // Append low case alphabets
  for (let i = 97; i < 123; i++) keyCodesMap[i - 32] = String.fromCharCode(i)

  // Append function keys
  for (let i = 1; i < 13; i++) keyCodesMap[i + 111] = 'f' + i

  const swappedKeyCodesMap = Object.keys(keyCodesMap).reduce((obj, key) => {
    obj[keyCodesMap[key]] = key
    return obj
  }, {})

  return (arg) => typeof arg === 'number' ? keyCodesMap[arg] : swappedKeyCodesMap[arg]
})()

/* == Roguelike == */

const roguelike = {}

/* == Data Layer == */

/* ==== Action Creators ==== */
const actionCreators = {}

actionCreators.startGame = () => {
  return { type: 'StartGame' }
}

actionCreators.pauseGame = () => {
  return { type: 'PauseGame' }
}

actionCreators.stopGame = () => {
  return { type: 'StopGame' }
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

reducers.ui = (state, action) => {

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
      status: 'stopped',
      ui: {
        hasPanel: false,
        onSelectAction: null
      },
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
 * Keyboard Listener
 */

class KeyboardListener {

  constructor (options) {
    this._options = Object.assign({}, this._getDefaultOptions(), options)
    this._pressedKeys = new Array(255) // ASCII table

    // Attach event listeners
    window.addEventListener('keydown', e => this._handleKeydown(e))
    window.addEventListener('keyup', e => this._handleKeyup(e))
  }

  _getDefaultOptions () {
    return {
      isKeyRepeat: true,
      handlePress: () => {},
      handleRelease: () => {}
    }
  }

  _handleKeydown (e) {
    const { isKeyRepeat, handlePress } = this._options
    const keyCode = e.keyCode

    if (!isKeyRepeat && this.isPressed(keyCode)) return

    this._pressedKeys[keyCode] = true

    if (typeof handlePress === 'function') {
      handlePress(e)
    }
  }

  _handleKeyup (e) {
    const { handleRelease } = this._options
    const keyCode = e.keyCode

    this._pressedKeys[keyCode] = false

    if (typeof handleRelease === 'function') {
      handleRelease(e)
    }
  }

  isPressed (keyCode) {
    return this._pressedKeys[keyCode]
  }

}

/**
 * Sound Manager
 */

class SoundManager {

  constructor () {

  }

}

/**
 * Hero-Focused Viewport
 */

class HeroFocusedViewport {

}

/* ==== Mixin ==== */

/**
 * Mixin with Component
 *
 * @TODO: Separate some mixins into files when supporting ES6 Modules
 */

const mixinWithComponent = (...mixins) => {
  // MixedComponent Class
  class MixedComponent {

    constructor () {
      MixedComponent.mixinConstructors.map(
        f => f.call(this)
      )
    }

  }

  // Static props
  MixedComponent.mixinConstructors = []

  for(let mixin of mixins) {
    // @TODO: Would need to handle mixin collisions...

    // Collect constructor of mixin
    if (typeof mixin._constructor === 'function') {
      MixedComponent.mixinConstructors.push(
        mixin._constructor
      )
      delete mixin._constructor
    }

    // Mount functions to MixedComponent.prototype
    for(let name of Object.keys(mixin)) {
      MixedComponent.prototype[name] = mixin[name]
    }
  }

  return MixedComponent
}

/**
 * VNode Mixin
 */

const vnodeMixin = Object.assign({}, window.maquette, {

  _constructor: function () {
    this._subViews = []
    this.projector = this.createProjector({})
    this.hc = this.hc.bind(this) // @FIXME
  },

  mount: function ($container, renderFunction = this.render.bind(this)) {
    this.projector.append($container, renderFunction)
  },

  update: function (state) {
    this.updateProps(state)
    this.projector.scheduleRender()
  },

  hc: function (ComponentClass, props, children) {
    if (typeof ComponentClass !== 'function') {
      throw new Error('The first argument of `hc` should be a Component Class')
    }

    const component = new ComponentClass(props, children)

    if (typeof component.render !== 'function') {
      throw new Error(`No render function found in Component ${ComponentClass.name}`)
    }

    this._subViews.push(component)
    return component.render()
  }

})

/**
 * Style Mixin
 */

const styleMixin = Object.assign({ csjs: window.csjs }, {
  // @TODO: Define variables & utils

  _constructor: function () {
    if (!this.style) return

    // Get classNames from styles
    const styles = this.style()
    const _s = {}
    Object.keys(styles).map(styleName => _s[styleName] = styles[styleName].classNames)

    // Mount the styles object & the util function
    this.s = _s
    this.sc = this.csjs.deps.classNames

    // Inject Static CSS
    const staticCss = this.csjs.getCss(styles)
    this.csjs.deps.insertCss(staticCss)
  }

})

/* ==== View ==== */

/**
 * Base View
 *
 * @TODO: Think of a elegent way to combine tree-based structure and decoration (mixin-based inheritance)
 * @TODO: Beyond DOM-based view, make a magic to includes style, texture, sound, event and more info mixins
 */

class BaseView extends mixinWithComponent(
  vnodeMixin,
  styleMixin
) {

  static getDefaultProps () {
    return {
      canAutoRender: false
    }
  }

  constructor (props, children = []) {
    super()

    this.props = Object.assign({}, BaseView.getDefaultProps(), props)
    this.children = children

    if (this.props.canAutoRender) this.render()
  }

  updateProps (props) {
    this.props = props
  }

  render () {
    const { h } = this

    return h('div', 'Default render function, please override me', this.children)
  }

}

/* ==== Bottom Views ==== */
// @TODO: Add some common UI views

/* ==== Top Views ==== */

/**
 * HUD View
 */

class HUDView extends BaseView {

  render () {
    return this.renderMiniMap()
  }

  renderMiniMap () {
    const { h } = this

    return h('div', 'Mini Map')
  }

}

/**
 * Panel View
 */
class PanelView extends BaseView {

  style () {
    return this.csjs`
      .panelWrap {
        border: 1px solid black;
      }
    `
  }

  render () {
    const { status } = this.props

    switch (status) {
      case 'stopped':
        return this.renderStartPanel()
      case 'paused':
        return this.renderPausedPanel()
      default:
       return null
    }
  }

  renderStartPanel () {
    const { h, s, sc } = this

    // @TODO: Handle click
    return h('div', { class: sc(s.panelWrap) }, [
      h('div', 'Peaceful Roguelike Wonderland')
    ])
  }

  renderPausedPanel () {
    const { h } = this

    return h('div', 'pause')
  }

  handlePanelButtonClick () {

  }

}

/**
 * Scene View
 */
class SceneView extends BaseView {

  render () {
    const { h } = this

    return h('div', 'Game Scene', this.children)
  }

}

/**
 * Game View
 */
class GameView extends BaseView {

  render () {
    const { h, hc } = this
    const { status } = this.props

    return h('div.game', [
      hc(PanelView, { status }),
      this.renderScene()
    ])
  }

  renderScene () {
    const { hc } = this
    const { status } = this.props

    if (status !== 'started') {
      return null
    }

    return hc(SceneView, {}, [
      hc(HUDView)
    ])
  }

}


/* ==== Game Main ==== */

// Store instance
const store = new Store(
  middlewares.logger
)

// @TODO: MainLoop && Animation
class Game {
  static getDefaultProps () {
    return {
      renderMode: 'dom', // 'dom' | 'canvas'
      keyboardShortcuts: {
        // HUD
        togglePause: 'escape|p',
        select: 'enter',

        // Direction
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
    this.props = Object.assign({}, Game.getDefaultProps(), props) // Immutable = state
    this.state = store.getState() // Update by dispatching action
    // DOMs
    this.$container = document.querySelector('.gameContainer')
    this.$body      = document.querySelector('body')
    // Mount
    this._eventListeners()
    this._render(this.state)
  }

  _eventListeners () {
    // Player inputs
    this.keyboardListener = new KeyboardListener({
      handlePress: this._handlePlayerKeydown.bind(this)
    })

    // Store subscribe
    store.subscribe(this._update.bind(this))

    // @MAYBE: Router, Socket...
    return this
  }

  _handlePlayerKeydown (e) {
    const { status } = this.state

    const inputKeyName = utils.keymap(e.keyCode)
    const HUDKeys = ['escape', 'enter', 'p']

    const disableConditions = [
      () => inputKeyName === undefined,
      () => status === 'paused' && HUDKeys.indexOf(inputKeyName) === -1
    ]

    if (disableConditions.some(c => c())) return

    this._runActionByMatchKey(inputKeyName)
  }

  _runActionByMatchKey (key) {
    const { keyboardShortcuts } = this.props

    for (let action in keyboardShortcuts) {
      const pattern = keyboardShortcuts[action]
      const isMatched = new RegExp(`^(${pattern})$`, 'ig').test(key)
      // @TODO: Move event handlers into each view components, especially for UI
      if (isMatched) this[`handle${utils.capitalize(action)}`]()
    }
  }

  _update () {
    this.state = store.getState()
    this.renderer.update(this.state)
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
    const { keyboardShortcuts } = this.props

    this.renderer = new GameView(
      Object.assign({}, state, {
        keyboardShortcuts: keyboardShortcuts
      })
    )
    this.renderer.mount(this.$container)
  }

  _renderInCanvas (state) {
    // @TODO: HTML 2 Canvas
    // @P.S. Supportting multiple renderers is a complex abstraction, refer to Pixi.js or React
  }

  start () {
    store.dispatch(actionCreators.startGame())
  }

  pause () {
    store.dispatch(actionCreators.pauseGame())
  }

  resume () {
    this.start()
  }

  stop () {
    store.dispatch(actionCreators.stopGame())
  }

  handleTogglePause () {
    const { status } = this.state

    if (status === 'paused') {
      this.resume()
    } else if (status === 'started') {
      this.pause()
    }
  }

  handleSelect () {

  }

  handleMoveLeft () {

  }

  handleMoveRight () {

  }

  handleMoveTop () {

  }

  handleMoveBottom () {

  }

  handleJump () {

  }

  handleAttack () {

  }

}

/* == Init == */

const config = { }
const game = new Game(config)
if (DEBUG) window.game = game

}()
