void function () {

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
const GAME_NAME = 'Peaceful Roguelike Wonderland'
const PRESENTATION_URL = 'https://github.com/SuneBear/SB-Sessions/tree/master/2017-02-08-peaceful-roguelike-wonderland-behind-the-scenes'
const NOOP = () => {}

/* == Utils == */

const utils = {}

// Compose - FP high order function
utils.compose = (...fns) => arg => {
  return fns.reduceRight((composed, fn) => fn(composed), arg)
}

// Capitalize
utils.capitalize = str => {
  return str && str[0].toUpperCase() + str.slice(1)
}

// Keymap - keyCode <=> keyName
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
    obj[keyCodesMap[key]] = parseInt(key)
    return obj
  }, {})

  return (arg) => typeof arg === 'number' ? keyCodesMap[arg] : swappedKeyCodesMap[arg]
})()

// Random Integer
utils.randomInteger = (min = 0, max = 1, omits = []) => {
  const number = Math.floor(Math.random() * (max - min + 1) + min)
  return omits.indexOf(number) === -1 ? number : utils.randomInteger(...arguments)
}

// Random Choice
utils.randomChoice = array => {
  const randIndex = Math.floor(Math.random() * array.length)
  return array[randIndex]
}

// Shuffle - the Fisher-Yates (aka Knuth) shuffle
// @REF: http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
utils.shuffle = array => {
  let currentIndex = array.length
  let randomIndex, temporaryValue

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

// Simulate Keypress
utils.simulateKeypress = keyName => {
  const { keymap, simulateKeyup } = utils

  // Keydown
  const eventKeydown = new Event('keydown')
  eventKeydown.key = keyName
  eventKeydown.keyCode = keymap(keyName)
  eventKeydown.which = eventKeydown.keyCode
  window.dispatchEvent(eventKeydown)

  // Keyup
  setTimeout(() => simulateKeyup(keyName), 0)
}

utils.simulateKeyup = keyName => {
  const { keymap } = utils

  const eventKeyup = new Event('keyup')
  eventKeyup.key = keyName
  eventKeyup.keyCode = keymap(keyName)
  eventKeyup.which = eventKeyup.keyCode
  window.dispatchEvent(eventKeyup)
}

// Throttle
// @REF: http://underscorejs.org/#throttle
utils.throttle = (func, wait, options) => {
  let timeout, context, args, result
  let previous = 0
  if (!options) options = {}

  const later = function() {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }

  const throttled = function() {
    const now = Date.now()
    if (!previous && options.leading === false) previous = now
    const remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }

  throttled.cancel = function() {
    clearTimeout(timeout)
    previous = 0
    timeout = context = args = null
  }

  return throttled
}

/* == Roguelike == */

/* ==== Direction ==== */
const direction = {}

direction.orthogonal = ['N', 'E', 'S', 'W']

direction.diagonal = ['NW', 'NE', 'SE', 'SW']

direction.all = [].concat(direction.orthogonal, direction.diagonal)

direction.getCode = (dir) => {
  switch (dir) {
    case 'N': return 1 << 3 // 8
    case 'E': return 1 << 2 // 4
    case 'S': return 1 << 1 // 2
    case 'W': return 1 << 0 // 1
    default : return 0
  }
}

direction.getDX = (dir) => {
  switch (dir) {
    case 'N': return 0
    case 'E': return 1
    case 'S': return 0
    case 'W': return -1
  }
}

direction.getDY = (dir) => {
  switch (dir) {
    case 'N': return -1
    case 'E': return 0
    case 'S': return 1
    case 'W': return 0
  }
}

direction.getOpposite = (dir) => {
  switch (dir) {
    case 'N': return 'S'
    case 'E': return 'W'
    case 'S': return 'N'
    case 'W': return 'E'

    case 'NW': return 'SE'
    case 'NE': return 'SW'
    case 'SE': return 'NW'
    case 'SW': return 'NE'
  }
}

/* ==== Point ==== */

class Point {

  static getDefaultOptions () {
    return {
      x: 0,
      y: 0
    }
  }

  constructor (options) {
    this.options = Object.assign(Point.getDefaultOptions(), options)
    Object.assign(this, this.options)
  }

  updateOptions (options) {
    Object.assign(this.options, options)
    Object.assign(this, this.options)
  }

  getPoint () {
    return {
      x: this.x,
      y: this.y
    }
  }

  isEqual (toCompare) {
    return this.x == toCompare.x && this.y == toCompare.y
  }

}

/* ==== Grid Generators ==== */

/**
 * Grid Cell
 */

class GridCell extends Point {

  static getDefaultOptions () {
    return {
      type: 'empty',
      walkable: true,
      // openingDirs: [],
      // entities: [],
      isWalked: false,
      isSolution: false
    }
  }

  constructor (options) {
    super(Object.assign(GridCell.getDefaultOptions(), options))
  }

  getOpeningsCode () {
    const { getCode } = direction
    let code = 0
    this.openingDirs.map(dir => code += getCode(dir))
    return code
  }

  walk () {
    this.updateOptions({
      isWalked: true
    })
  }

  correct () {
    this.updateOptions({
      isSolution: true
    })
  }

  clone () {
    return new GridCell(this.options)
  }

}

/**
 * Base Grid
 */

class BaseGrid {

  static getDefaultOptions () {
    return {
      cellOptions: {},
      name: 'Default Grid',
      cols: 51, // X or Width
      rows: 51 // Y or Height
    }
  }

  constructor (options) {
    this.options = Object.assign({}, BaseGrid.getDefaultOptions(), options)

    const { cols, rows, cellOptions} = this.options

    // Core Data
    this.total = cols * rows
    this.matrix = this._buildMatrix(cols, rows, cellOptions)
  }

  _buildMatrix (cols, rows, cellOptions) {
    const cellMatrix = new Array(cols)

    for (let x = 0; x < cols; ++x) {
      cellMatrix[x] = new Array(rows)
      for (let y = 0; y < rows; ++y) {
        cellMatrix[x][y] = new GridCell(Object.assign({ x, y }, cellOptions))
      }
    }

    return cellMatrix
  }

  getMatrix () {
    return this.matrix
  }

  getCellAt (x, y) {
    if (!this.isValidCell(x, y)) return null

    return this.matrix[x][y]
  }

  isWalkableAt (x, y) {
    if (!this.isValidCell(x, y)) return false

    return this.matrix[x][y].walkable
  }

  isEmptyTypeAt (x, y) {
    if (!this.isValidCell(x, y)) return false

    return this.matrix[x][y].type === 'empty'
  }

  isValidCell (x, y) {
    const { cols, rows } = this.options

    const conditions = [
      () => x >= 0 && x < cols,
      () => y >= 0 && y < rows
    ]

    return conditions.every(c => c())
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
  getNeighbors (cell, diagonalMovement, isValidAt = this.isWalkableAt.bind(this)) {
    const { matrix } = this
    const { x, y } = cell
    const neighbors = []

    const openingDirs = {}
    direction.all.map(dir => openingDirs[dir] = false)

    // ↑ → ↓ ←
    direction.orthogonal.map(dir => {
      const nx = x + direction.getDX(dir)
      const ny = y + direction.getDY(dir)

      if (isValidAt(nx, ny)) {
        neighbors.push(matrix[nx][ny])
        openingDirs[dir] = true
      }
    })

    if (diagonalMovement === DiagonalMovement.Never) {
      return neighbors
    }

    if (diagonalMovement === DiagonalMovement.OnlyWhenNoObstacles) {
      const { N, E, S, W } = openingDirs

      openingDirs.NW = N & W
      openingDirs.NE = N & E
      openingDirs.SE = S & E
      openingDirs.SW = S & W
    } else if (diagonalMovement === DiagonalMovement.IfAtMostOneObstacle) {
      const { N, E, S, W } = openingDirs

      openingDirs.NW = N || W
      openingDirs.NE = N || E
      openingDirs.SE = S || E
      openingDirs.SW = S || W
    } else if (diagonalMovement === DiagonalMovement.Always) {
      openingDirs.NW = true
      openingDirs.NE = true
      openingDirs.SE = true
      openingDirs.SW = true
    } else {
      throw new Error('Incorrect value of diagonalMovement')
    }

    // ↖
    if (openingDirs.NW && isValidAt(x - 1, y - 1)) {
      neighbors.push(matrix[x - 1][y - 1])
    }
    // ↗
    if (openingDirs.NE && isValidAt(x + 1, y - 1)) {
      neighbors.push(matrix[x + 1][y - 1])
    }
    // ↘
    if (openingDirs.SE && isValidAt(x + 1, y + 1)) {
      neighbors.push(matrix[x + 1][y + 1])
    }
    // ↙
    if (openingDirs.SW && isValidAt(x - 1, y + 1)) {
      neighbors.push(matrix[x - 1][y + 1])
    }

    return neighbors
  }

  clone () {
    const { matrix } = this
    const { cols, rows } = this.options

    const newGrid = new this.constructor(this.options)
    const newMatrix = new Array(cols)

    for (let x = 0; x < cols; ++x) {
      newMatrix[x] = new Array(cols)
      for (let y = 0; y < rows; ++y) {
        newMatrix[x][y] = matrix[x][y].clone()
      }
    }

    newGrid.matrix = newMatrix

    return newGrid
  }

}

/**
 * Roguelike Grid
 *
 * @TODO: Generate a roguelike grid
 */

class RoguelikeGrid extends BaseGrid {

  static getDefaultOptions () {
    return {

    }
  }

  constructor (options) {
    super(Object.assign(RoguelikeGrid.getDefaultOptions(), options))
  }

}

/**
 * Maze Grid
 */

class MazeGrid extends BaseGrid {

  static getDefaultOptions () {
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
    }
  }

  constructor (options) {
    super(Object.assign(MazeGrid.getDefaultOptions(), options))
    this._buildMazeGrid()
  }

  _buildMazeGrid () {
    this._genStartCell()
    this._genEndCell()
    this._buildRoadCells()
    this._genSolution()
  }

  /**
   * Based on Growing Tree algorithm
   *
   * @REF: http://weblog.jamisbuck.org/2011/1/27/maze-generation-growing-tree-algorithm
   * @TODO: Improve performance of the loops & move the algorithm somewhere else
   */
  _buildRoadCells () {
    const { randomInteger, randomChoice } = utils
    // const { orthogonal, getDX, getDY, getOpposite } = direction
    const { matrix } = this
    const { cols, rows, cellOptions } = this.options

    // Create an empty list of cells & add the starting cell to it
    let currentCell = this.getStartCell()
    const activeCellList = []
    activeCellList.push(currentCell)

    // Loop through adding to cells list if there are unvisited neighbours to add, or remove cells if not
    // when cell list is empty we know that the maze contains all the cells
    while (activeCellList.length > 0) {
      // Set the current cell to the most recently added cell in the cell list
      let index = activeCellList.length - 1
      currentCell = activeCellList[index]

      const neighbors = this.getNeighbors(currentCell, DiagonalMovement.Never, this._isUnvisitedAt.bind(this))

      if (neighbors.length) {
        this._breakDefaultCellAndCraveRoad(currentCell)

        const defaultCellNeighbors = neighbors.filter(neighbor => {
          return neighbor.type === cellOptions.type
        })

        const hasTooManyDefaultCells = Math.round(defaultCellNeighbors.length/neighbors.length)

        if (hasTooManyDefaultCells) {
          const neighbor = randomChoice(defaultCellNeighbors)
          this._breakDefaultCellAndCraveRoad(neighbor)
        }

        neighbors.map(neighbor => {
          neighbor._visited = true
          activeCellList.push(neighbor)
        })

      } else {
        activeCellList.pop()
      }

    }

  }

  _breakDefaultCellAndCraveRoad (cell) {
    const { cellOptions } = this.options

    if (cell.type !== cellOptions.type) return

    cell.updateOptions({
      type: 'road',
      walkable: true
    })
  }

  _isUnvisitedAt (x, y) {
    const cell = this.getCellAt(x, y)

    if (!cell) return false

    return !cell._visited
  }

  _genRandomPoint (omittedXs = [], omittedYs = []) {
    const { randomInteger } = utils
    const { cols, rows } = this.options

    return {
      x: randomInteger(0, cols - 1, omittedXs),
      y: randomInteger(0, rows - 1, omittedYs)
    }
  }

  _genStartCell () {
    const { matrix } = this
    let { startPoint } = this.options

    if (!startPoint) {
      startPoint = this._genRandomPoint()
    }

    const { x, y } = startPoint

    this.startCell = matrix[x][y] = new GridCell({ x, y, type: 'start' })
  }

  _genEndCell () {
    const { randomInteger } = utils
    const { matrix, startCell, _genRandomPoint } = this
    const { cols, rows } = this.options
    let { endPoint } = this.options

    if (!endPoint) {
      endPoint = this._genRandomPoint([startCell.x], [startCell.y])
    }

    const { x, y } = endPoint

    this.endCell = matrix[x][y] = new GridCell({ x, y, type: 'end' })
  }

  _genSolution () {
    const finder = new AStarFinder()

    const solution = finder.findPath(
      this.getStartCell(),
      this.getEndCell(),
      this
    )

    if (!solution.length) return

    this.solution = solution
    solution.map(soln => {
      const [x, y] = soln
      const cell = this.getCellAt(x, y)
      cell.correct()
    })

  }

  getStartCell () {
    return this.startCell
  }

  getEndCell () {
    return this.endCell
  }

  getSolution () {
    return this.solution
  }

}

/* ==== Path Finders ==== */

/**
 * Diagonal Movement - Grouped Constants
 */

const DiagonalMovement = {
  Always: 1,
  Never: 2,
  IfAtMostOneObstacle: 3,
  OnlyWhenNoObstacles: 4
}

/**
 * Heuristic
 */

const heuristic = {}

heuristic.manhattan = (dx, dy) => {
  return dx + dy
}

heuristic.euclidean = (dx, dy) => {
  return Math.sqrt(dx * dx + dy * dy)
}

heuristic.octile = (dx, dy) => {
  const F = Math.SQRT2 - 1
  return (dx < dy) ? F * dx + dy : F * dy + dx
}

/**
 * BaseFinder
 */

class BaseFinder {

  static getDefaultOptions () {
    return {
      diagonalMovement: DiagonalMovement.Never, // Allowed diagonal movement
      heuristic: heuristic.manhattan // Heuristic function to estimate the distance
    }
  }

  constructor (options) {
    this.options = Object.assign({}, BaseFinder.getDefaultOptions(), options)
  }

  findPath (startPoint, endPoint, grid) {
    throw new Error('Not implemented')
  }

}

/**
 * AStar Finder
 */

class AStarFinder extends BaseFinder {

  getDefaultOptions () {
    return {
      weight: 1 // Weight to apply to the heuristic to allow for suboptimal paths, in order to speed up the search.
    }
  }

  constructor (options) {
    super(options)
    Object.assign(this.options, AStarFinder.getDefaultOptions(), options)

    const { diagonalMovement } = this.options

    if (diagonalMovement === DiagonalMovement.Never) {
      this.options.heuristic = heuristic.octile
    }
  }

  _backtrack (node) {
    const path = [[node.x, node.y]]
    while (node.parent) {
      node = node.parent
      path.push([node.x, node.y])
    }
    return path.reverse()
  }

  findPath (startPoint, endPoint, grid) {
    const { _backtrack } = this
    const { heuristic, diagonalMovement, weight } = this.options
    const startCell = grid.getCellAt(startPoint.x, startPoint.y)
    const endCell = grid.getCellAt(endPoint.x, endPoint.y)
    const openList = new Heap((nodeA, nodeB) => nodeA.f - nodeB.f)

    // Set the `g` and `f` value of the start cell to be 0
    startCell.g = 0
    startCell.f = 0

    // Push the start cell into the open list
    openList.push(startCell)
    startCell._opened = true

    // While the open list is not empty
    while (!openList.empty()) {
      // Pop the position of cell which has the minimum `f` value.
      const cell = openList.pop()
      cell._closed = true

      // If reached the end position, construct the path and return it
      if (cell.x === endCell.x && cell.y === endCell.y) {
        return _backtrack(endCell)
      }

      // Get neigbours of the current cell
      const neighbors = grid.getNeighbors(cell, diagonalMovement)

      for (let i = 0; i < neighbors.length; ++i) {
        const neighbor = neighbors[i]

        if (neighbor._closed) continue

        const { x, y } = neighbor

        // Get the distance between current cell and the neighbor
        // And calculate the next g score
        const ng = cell.g + ((x - cell.x === 0 || y - cell.y === 0) ? 1 : Math.SQRT2)

        // Check if the neighbor has not been inspected yet, or
        // can be reached with smaller cost from the current cell
        if (!neighbor._opened || ng < neighbor.g) {
          neighbor.g = ng
          neighbor.h = neighbor.h || weight * heuristic(Math.abs(x - endPoint.x), Math.abs(y - endPoint.y))
          neighbor.f = neighbor.g + neighbor.h
          neighbor.parent = cell

          if (!neighbor._opened) {
            openList.push(neighbor)
            neighbor._opened = true
          } else {
            // The neighbor can be reached with smaller cost.
            // Since its f value has been updated, we have to
            // update its position in the open list
            openList.updateItem(neighbor)
          }
        }
      } // End for each neighbor
    } // End while not open list empty

    // Fail to find the path
    if (DEBUG) console.error('A* failed to find path')
    return []
  }

}

/* == Data Layer == */

/* ==== Action Creators ==== */
const actionCreators = {}

// Status
actionCreators.startGame = () => {
  return {
    type: 'Status/StartGame',
    linked: ['closePanel']
  }
}

actionCreators.pauseGame = () => {
  return {
    type: 'Status/PauseGame',
    linked: ['openPausePanel']
  }
}

actionCreators.stopGame = () => {
  return {
    type: 'Status/StopGame'
  }
}

actionCreators.winGame = () => {
  return {
    type: 'Status/WinGame',
    linked: ['openWinPanel'],
  }
}

// Display
actionCreators.switchSenceType = (sceneType) => {
  return { type: 'Display/SceneType', sceneType }
}

actionCreators.toggleMap = () => {
  return { type: 'Display/ToggleMap' }
}

actionCreators.invertPageColors = () => {
  return { type: 'Display/InvertPageColors' }
}

actionCreators.toggleSolution = () => {
  return { type: 'Display/ToggleSolution' }
}

actionCreators.startTime = (startTime) => {
  return { type: 'Display/StartTime', startTime }
}

actionCreators.endTime = (endTime) => {
  return { type: 'Display/EndTime', endTime }
}

actionCreators.resizeWindow = () => {
  return { type: 'Display/ResizeWindow' }
}

// Player
actionCreators.playerMove = (direction) => {
  return {
    type: 'Player/Move',
    meta: { sound: 'effects.move' },
    linked: ['playerMovedSteps'],
    direction
  }
}

actionCreators.playerMovedSteps = () => {
  return { type: 'Player/MovedSteps' }
}

actionCreators.playerMoveTo = (point) => {
  return { type: 'Player/MoveTo', point }
}

actionCreators.playerPlaceIndex = (placeIndex) => {
  return { type: 'Player/PlaceIndex', placeIndex }
}

// Places
actionCreators.addPlace = (place) => {
  return { type: 'Places/AddPlace', place }
}

actionCreators.updatePlace = (placeIndex, newPlace) => {
  return { type: 'Place/Update', placeIndex, newPlace }
}

actionCreators.updatePlaceMap = (placeIndex, newPlaceMap) => {
  return { type: 'Place/Map/Update', placeIndex, newPlaceMap }
}

// UI
actionCreators.openStartPanel = () => {
  return { type: 'UI/OpenStartPanel' }
}

actionCreators.openPausePanel = () => {
  return { type: 'UI/OpenPausePanel' }
}

actionCreators.openWinPanel = () => {
  return { type: 'UI/OpenWinPanel' }
}

actionCreators.updateModal = (modal) => {
  return { type: 'UI/OpenModal', modal }
}

actionCreators.openKeyboardControlsModal = () => {
  return actionCreators.updateModal('keyboardControls')
}

actionCreators.switchCurrentlySelectedAction = (actionName) => {
  return {
    type: 'UI/SwitchCurrentlySelectedAction',
    meta: { sound: 'effects.hover' },
    actionName
  }
}

actionCreators.closePanel = () => {
  return { type: 'UI/ClosePanel' }
}

/* ==== Reducers ==== */
const reducers = {}

reducers.status = (state, action) => {
  switch (action.type) {
    case 'Status/StartGame':
      return 'started'
    case 'Status/PauseGame':
      return 'paused'
    case 'Status/StopGame':
      return 'stopped'
    case 'Status/WinGame':
      return 'won'
    default:
      return state
  }
}

reducers.display = (state, action) => {
  switch (action.type) {
    case 'Display/SceneType':
      const { sceneType } = action
      return Object.assign({}, state, { sceneType })
    case 'Display/StartTime':
      const { startTime } = action
      return Object.assign({}, state, { startTime })
    case 'Display/EndTime':
      const { endTime } = action
      return Object.assign({}, state, { endTime })
    case 'Display/ToggleMap':
      const map = !state.map
      return Object.assign({}, state, { map })
    case 'Display/InvertPageColors':
      const invert = !state.invert
      return Object.assign({}, state, { invert })
    case 'Display/ToggleSolution':
      const solution = !state.solution
      return Object.assign({}, state, { solution })
    default:
      return state
  }
}

reducers.player = (state, action) => {
  switch (action.type) {
    case 'Player/Move':
      let { x, y } = state
      const { direction } = action
      switch (direction) {
        case 'W':
          x--
          break
        case 'E':
          x++
          break
        case 'N':
          y--
          break
        case 'S':
          y++
          break
      }
      return Object.assign({}, state, { direction, x, y })
    case 'Player/MovedSteps':
      let { movedSteps } = state
      movedSteps++
      return Object.assign({}, state, { movedSteps })
    case 'Player/MoveTo':
      const { point } = action
      return Object.assign({}, state, { x: point.x, y: point.y })
    case 'Player/PlaceIndex':
      const { placeIndex } = action
      return Object.assign({}, state, { placeIndex })
    default:
      return state
  }
}

// @TODO: Split up reducer logic, flatten many-to-many relationships
reducers.places = (state, action) => {
  const { placeIndex } = action

  switch (action.type) {
    case 'Places/AddPlace':
      const { place } = action
      return state.concat([place])
    case 'Place/Update':
      const { newPlace } = action
      return state.map(place => {
        if (place.index !== placeIndex) return place
        return Object.assign({}, place, newPlace)
      })
    case 'Place/Map/Update':
      const { newPlaceMap } = action
      return state.map(place => {
        if (place.index !== placeIndex) return place
        return Object.assign({}, place, { map: newPlaceMap })
      })
    default:
      return state
  }
}

reducers.ui = (state, action) => {
  switch (action.type) {
    case 'UI/OpenStartPanel':
      return Object.assign({}, state, {
        panel: 'start',
        panelActions: ['startGame', 'openKeyboardControlsModal', 'behindTheScenes'],
        onSelectAction: 'startGame'
      })
    case 'UI/OpenPausePanel':
      return Object.assign({}, state, {
        panel: 'pause',
        panelActions: ['startGame', 'openKeyboardControlsModal', 'stopGame'],
        onSelectAction: 'startGame'
      })
    case 'UI/OpenWinPanel':
      return Object.assign({}, state, {
        panel: 'win',
        panelActions: ['stopGame'],
        onSelectAction: 'stopGame'
      })
    case 'UI/ClosePanel':
      return Object.assign({}, state, {
        panel: null
      })
    case 'UI/SwitchCurrentlySelectedAction':
      return Object.assign({}, state, {
        onSelectAction: action.actionName
      })
    case 'UI/OpenModal':
      const { modal } = action
      return Object.assign({}, state, { modal })
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
      console.info(JSON.stringify(action, '', '\t'))
    console.groupEnd()
    console.groupCollapsed('Previous State:')
      console.info(JSON.stringify(store.getState(), '', '\t'))
    console.groupEnd()
    const result = next(action)
    console.groupCollapsed('State:')
      console.info(JSON.stringify(store.getState(), '', '\t'))
    console.groupEnd()
  console.groupEnd()

  return result
}

// Run related actions after dispatching a main action
middlewares.linked = store => next => action => {
  const { linked } = action

  if (!Array.isArray(linked)) {
    return next(action)
  }

  linked.map(linkedAction => {
    const _actionSpawn = actionCreators[linkedAction]
    if (typeof _actionSpawn === undefined) return
    store.dispatch(_actionSpawn())
  })

  return next(action)
}

// @REF: https://github.com/joshwcomeau/redux-sounds
middlewares.soundSpawn = soundManager => store => next => action => {
  if (typeof soundManager !== 'object' || !soundManager.isSoundManager) {
    throw new Error('Missing sound manager')
  }

  if (!action.meta || !action.meta.sound) {
    return next(action)
  }

  const [ soundName, spriteName ] = action.meta.sound.split('.')
  soundManager.play(soundName, spriteName)

  return next(action)
}

/* ==== Store Core ==== */
class Store {

  static getInitialState () {
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
        panelActions: ['startGame', 'openKeyboardControlsModal', 'behindTheScenes'],
        modal: null
      }
    }
  }

  constructor (...middlewares) {
    this.middlewares = middlewares || []
    this.subscribers = []
    this.prevState = {}
    this.state = this._reduce()

    this._enableReduxDevtools()

    if (middlewares.length > 0) {
      this.dispatch = this._dispatchCombineMiddlewares()
    }
  }

  setState (state) {
    this.prevState = Object.assign({}, this.state)
    this.state = state
  }

  getState () {
    return this.state
  }

  getPrevState () {
    return this.prevState
  }

  _reduce (state = Store.getInitialState(), action = {}) {
    // @Hack: Reset state when stop to the game
    if (action.type === 'Status/StopGame') {
      return this._resetState()
    }

    // Normal reducers
    return {
      status: reducers.status(state.status, action),
      display: reducers.display(state.display, action),
      player: reducers.player(state.player, action),
      places: reducers.places(state.places, action),
      ui: reducers.ui(state.ui, action)
    }
  }

  _resetState () {
    // Create persistent settings
    const { sceneType, invert } = this.state.display
    const persistentDisplay = {
      sceneType,
      invert
    }
    const display = Object.assign(
      Store.getInitialState().display,
      persistentDisplay
    )

    return Object.assign(Store.getInitialState(), { display })
  }

  _enableReduxDevtools () {
    this._devStore = window.devToolsExtension && window.devToolsExtension(this._reduce.bind(this))
    if (this._devStore) {
      this._devStore.subscribe(() => {
        this.setState(this._devStore.getState())
        this._notifySubscribers()
      })
    }
  }

  dispatch (action = {}) {
    const reducer = this._reduce.bind(this)
    this.setState(reducer(this.state, action))
    this._notifySubscribers()
    if (this._devStore) this._devStore.dispatch(action)
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

  static getDefaultOptions () {
    return {
      isKeyRepeat: true,
      handlePress: NOOP,
      handleRelease: NOOP
    }
  }

  constructor (options) {
    this.options = Object.assign({}, KeyboardListener.getDefaultOptions(), options)
    this.pressedKeys = {} // ASCII table
    this.throttleds = {}

    // Attach event listeners
    window.addEventListener('keydown', e => this.handleKeydown(e))
    window.addEventListener('keyup', e => this.handleKeyup(e))
  }

  handleKeydown (e) {
    const { throttle } = utils
    const { pressedKeys, throttleds } = this
    const { isKeyRepeat, handlePress } = this.options
    const keyCode = e.keyCode

    if (!isKeyRepeat && this.isPressed(keyCode)) return
    pressedKeys[keyCode] = true

    for (let key in pressedKeys) {
      if (!pressedKeys[key]) continue
      if (!throttleds[key]) {
        throttleds[key] = throttle(handlePress, 168, {
          trailing: false
        })
      }
      throttleds[key](~~key)
    }
  }

  handleKeyup (e) {
    const { handleRelease } = this.options
    const keyCode = e.keyCode

    this.pressedKeys[keyCode] = false

    if (typeof handleRelease === 'function') {
      handleRelease(e)
    }
  }

  isPressed (keyCode) {
    return this.pressedKeys[keyCode]
  }

}

/**
 * Sound Manager
 */

class SoundManager {

  static getDefaultOptions () {
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
    }
  }

  constructor (options) {
    this.options = Object.assign({}, SoundManager.getDefaultOptions(), options)
    this.isSoundManager = true
    this.mount()
  }

  mount () {
    const { bgmURLs, effectsURLs } = this.options

    this.types = [],
    this._loadedTypes = []

    if (bgmURLs.length) this.types.push('bgm')
    if (effectsURLs.length) this.types.push('effects')

    this.types.map(type => this.soundBuilder(type))
  }

  play (soundName, spriteName) {
    const sound = this[soundName]

    if (typeof sound === 'undefined') {
      return console.warn(`
        The sound '${soundName}' was requested, but SoundManager doesn't have anything registered under that name.
      `)
    } else if (spriteName && typeof sound._sprite[spriteName] === 'undefined') {
      const validSprites = Object.keys(sound._sprite).join(', ');

      return console.warn(`
        The sound '${soundName}' was found, but it does not have a sprite specified for '${spriteName}'.
        It only has access to the following sprites: ${validSprites}.
      `)
    }

    sound.play(spriteName)
  }

  onLoaded () {
    const { onLoadedSuccess } = this.options
    this._loaded = false

    const conditions = [
      () => !this._loaded,
      () => this._loadedTypes.length === this.types.length
    ]

    if (conditions.every(c => c())) {
      this._loaded = true
      onLoadedSuccess()
    }

  }

  soundBuilder (type) {
    if (!type) return

    const options = {}
    const sprite  = this.options[`${type}Sprite`]

    options.src = this.options[`${type}URLs`]
    options.loop = sprite ? false : true
    options.onload = () => {
      this._loadedTypes.push(type)
      this.onLoaded()
    }

    if (sprite) {
      options.sprite = sprite
      options.volume = 0.7
    }

    this[type] = new Howl(options)
  }

}

/**
 * Absolute Layout Engine
 */

class AbsoluteLayoutEngine {

  static getDefaultOptions () {
    return {
      unit: '%',
      unitLength: 5
    }
  }

  constructor (options) {
    this.options = Object.assign({}, AbsoluteLayoutEngine.getDefaultOptions(), options)
  }

  getPositionAt (x, y, isNagative) {
    const { unit, unitLength } = this.options

    let left = unitLength * x
    let top = unitLength * y

    if (isNagative) {
      left *= -1
      top *= -1
    }

    return {
      left: `${left}${unit}`,
      top: `${top}${unit}`
    }
  }

  getPositionTransformAt (...arg) {
    const offset = this.getPositionAt(...arg)

    return {
      transform: `translate3d(${offset.left}, ${offset.top}, 0)`
    }
  }

}

/**
 * Hero-Focused Camera
 *
 * @DESC: Camera <-> Scene Viewport <-> Scene Layer
 * @DEP: Layout Engine
 */

class HeroFocusedCamera {

  static getDefaultOptions () {
    return {
      layoutEngine: null,
      heroPoint: {
        x: 0,
        y: 0
      },
      totalCols: 0,
      totalRows: 0
    }
  }

  constructor (options) {
    this.options = Object.assign({}, HeroFocusedCamera.getDefaultOptions(), options)
  }

  getViewportSize () {
    const { layoutEngine } = this.options
    const { unitLength, unit } = layoutEngine.options

    if (unit === 'px') {
      return {
        viewportCols: window.innerWidth / unitLength,
        viewportRows: window.innerHeight / unitLength
      }
    } else {
      const aspectRatio = window.innerWidth/window.innerHeight
      const viewportRows = 100 / unitLength
      const viewportCols = viewportRows * aspectRatio
      return {
        viewportCols,
        viewportRows
      }
    }
  }

  getViewportOffset () {
    const {
      layoutEngine, heroPoint,
      totalCols, totalRows
    } = this.options

    const { viewportCols, viewportRows } = this.getViewportSize()

    // X
    const minX = 0
    const maxX = totalCols - viewportCols
    let cameraX = heroPoint.x - (viewportCols / 2)
    cameraX = Math.min(cameraX, maxX)
    cameraX = Math.max(cameraX, minX)

    // Y
    const minY = 0
    const maxY = totalRows - viewportRows
    let cameraY = heroPoint.y - (viewportRows / 2)
    cameraY = Math.min(cameraY, maxY)
    cameraY = Math.max(cameraY, minY)

    return layoutEngine.getPositionTransformAt(cameraX, cameraY, true)
  }

  getSceneLayerSize () {
    const { layoutEngine, totalCols, totalRows } = this.options
    const { unitLength, unit } = layoutEngine.options

    return {
      width: `${totalCols * unitLength}${unit}`,
      height: `${totalRows * unitLength}${unit}`
    }
  }

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
    this._subClasses = {}
    this._projector = this.createProjector({})
    this.hc = this.hc.bind(this) // @FIXME: Integrate into `h`
  },

  hc: function (ComponentClass, props, children) {
    if (typeof ComponentClass !== 'function') {
      throw new Error('The first argument of `hc` should be a Component Class')
    }

    let component = null
    const componentName = ComponentClass.name

    if (this._subClasses[componentName]) {
      component = this._subClasses[componentName]
      component.updateProps(props)
    } else {
      component = new ComponentClass(props, children)
      this._subClasses[componentName] = component
    }

    if (typeof component.render !== 'function') {
      throw new Error(`No render function found in Component ${ComponentClass.name}`)
    }

    return component.render()
  },

  mount: function ($container, renderFunction = this.render.bind(this)) {
    this._projector.append($container, renderFunction)
  },

  update: function (props) {
    this.updateProps(props)
    this._projector.scheduleRender()
  },

  resume: function () {
    this._projector.resume()
  },

  stop: function () {
    this._projector.stop()
  }

})

/**
 * Style Mixin
 */

// @Hack: Prevent duplicate styles
const _insertedCss = {}

const _styleVariables = {
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
}

const styleMixin = Object.assign({ csjs: window.csjs }, {
  // @TODO: Define variables & utils

  _constructor: function () {
    if (!this.style) return

    // Register global variables
    this.sv = _styleVariables

    // Get the classNames from the styles
    const styles = this.style()
    const _s = {}
    Object.keys(styles).map(styleName => _s[styleName] = styles[styleName].classNames)

    // Mount the styles object & the util function
    this.s  = _s
    this.sc = (...arg) => {
      const classnames = this.csjs.deps.classNames(arg).split(' ')
      const classnamesObj = {}
      classnames.map(classname => classnamesObj[classname] = true)
      return classnamesObj
    }

    // Inject the static string of CSS
    const constructorName = this.constructor.name
    if (_insertedCss[constructorName]) {
      return null
    } else {
      _insertedCss[constructorName] = true
    }
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
    const { h, children } = this

    return h('div', 'Default render function, please override me', children)
  }

  destory () {
    // @TODO
  }

}

/* ==== Bottom Views ==== */
// @TODO: Add more common UI views

/**
 * Modal View
 */

class ModalView extends BaseView {

  style () {
    const {
      svPrimary,
      svZIndexModal,
      svCard
    } = this.sv

    return this.csjs`

      .modalView {
        position: fixed;
        z-index: ${svZIndexModal};
        display: flex;
        width: 100%;
        height: 100vh;
      }

      .modalMask {
        position: absolute;
        z-index: -1;
        width: 100%;
        height: 100vh;
        background: rgba(245, 245, 245, 0.95);
        cursor: pointer;
      }

      .modalDialog {
        position: absolute;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        width: 65%;
        max-width: 700px;
        min-width: 300px;
        padding: 25px;
        margin: 10vh auto;
        max-height: 80vh;
        background: hsla(0, 0%, 100%, .36);
        border: 2px solid currentColor;
        border-radius: 4px;
        box-shadow: 1px 2px 5px rgba(0, 0, 0, .15);
        overflow-y: auto;
      }

      .modalHeader {
        position: relative;
        padding-bottom: 17px;
        margin-top: 5px;
        margin-bottom: 20px;
        border-bottom: 2px solid currentColor;
      }

      .modalTitle {
        font-size: 20px;
      }

      .modalClose {
        position: absolute;
        right: -2px;
        top: 2px;
        width: 24px;
        height: 24px;
        font-size: 20px;
        cursor: pointer;
      }

      .modalClose:before, .modalClose:after {
        content: ' ';
        position: absolute;
        left: 12px;
        height: 24px;
        width: 2px;
        background-color: currentColor;
        border-radius: 2px;
      }

      .modalClose:before {
        transform: rotate(45deg);
      }

      .modalClose:after {
        transform: rotate(-45deg);
      }

      .modalClose:hover {
        color: ${svPrimary};
      }

      .modalBody {
        display: flex;
        width: 100%;
        overflow: hidden;
      }

      .modalBody > * {
        flex: 1;
        overflow-y: auto;
        padding-bottom: 5px;
      }

    `
  }

  render () {
    const { h, s, sc, children } = this

    return h('div', { classes: sc(s.modalView), key: s.modalView }, [
      h('div', { classes: sc(s.modalDialog) }, [
        this.renderHeader(),
        h('div', { classes: sc(s.modalBody) }, children)
      ]),
      h('div', {
        classes: sc(s.modalMask),
        onclick: this.handleCloseClick,
        bind: this
      })
    ])
  }

  renderHeader () {
    const { h, s, sc } = this
    const { title } = this.props

    return h('div', { classes: sc(s.modalHeader) }, [
      this.renderTitle(),
      h('div', {
        classes: sc(s.modalClose),
        onclick: this.handleCloseClick,
        bind: this
      })
    ])
  }

  renderTitle () {
    const { h, s, sc } = this
    const { title } = this.props

    if (!title) {
      return null
    }

    return h('div', { classes: sc(s.modalTitle) }, title)
  }

  handleCloseClick () {
    const { keyboardShortcuts } = this.props
    const { simulateKeypress } = utils

    // @Hack: Simulate Keypress on click
    const keyName = keyboardShortcuts.togglePopup.split('|')[0]
    simulateKeypress(keyName)
  }

}

/* ==== Top Views ==== */

/**
 * KBC View - Keyboard Controls
 */

class KBCView extends BaseView {

  style () {
    return this.csjs`

      .kbcView {

      }

      .shortcutItem {
        display: flex;
        align-items: center;
      }

      .shortcutItem + .shortcutItem {
        margin-top: 20px;
      }

      .shortcutKey {
        min-width: 42px;
        height: 42px;
        padding: 0 10px;
        margin: 0px 4px;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.1);
        font: 18px/42px Helvetica, serif;
        text-transform: capitalize;
        text-align: center;
        color: #666;
      }

      .shortcutAction {
        margin-left: 20px;
        font-size: 18px;
        text-transform: capitalize;
      }

    `
  }

  render () {
    const { h, s, sc } = this
    const { keyboardShortcuts } = this.props

    const keyboardShortcutsMap = Object.keys(keyboardShortcuts)

    return h('div', { classes: sc(s.kbcView) }, keyboardShortcutsMap.map(action => {
      return h('div', { classes: sc(s.shortcutItem) }, [
        h('div', { classes: sc(s.shortcutKey), innerHTML: this.formatKeyAndAction(keyboardShortcuts[action]) } ),
        h('div', { classes: sc(s.shortcutAction), innerHTML: this.formatKeyAndAction(action) })
      ])
    }))
  }

  decamelize (str, sep = '-') {
    return str
      .replace(/([a-z\d])([A-Z])/g, '$1' + sep + '$2')
      .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + sep + '$2')
      .toLowerCase()
  }

  formatKeyAndAction (input) {
    let output = input

    const textToSymbol = {
      leftArrow: '←',
      rightArrow: '→',
      upArrow: '↑',
      downArrow: '↓'
    }

    for (let text in textToSymbol) {
      output = output.replace(text, textToSymbol[text])
    }

    output = this
      .decamelize(output, ' ')
      .split('|').join(' &nbsp;/&nbsp; ')

    return output
  }

}

/**
 * HUD View
 */

class HUDView extends BaseView {

  style () {
    const {
     svZIndexHud
    } = this.sv

    return this.csjs`

      .hudView {
        position: absolute;
        z-index: ${svZIndexHud};
      }

    `
  }

  render () {
    const { h, s, sc } = this

    return h('div', { classes: sc(s.hudView) },  [
      this.renderMap()
    ])
  }

  renderMap () {
    const { h } = this
    const { display } = this.props

    if (!display.map) {
      return null
    }

    return h('div', 'Map')
  }

}

/**
 * Panel View
 */
class PanelView extends BaseView {

  style () {
    const {
      svPrimary,
      svMask,
      svZIndexPanel
    } = this.sv

    return this.csjs`

      .panelWrap {
        position: fixed;
        z-index: ${svZIndexPanel};
        display: flex;
        justify-content: center;
        z-index: 10010;
        width: 100%;
        height: 100vh;
        padding-top: 20vh;
        background: ${svMask};
      }

      .panelBody {
        width: 80%;
        max-width: 400px;
        text-align: center;
      }

      .panelTitle {
        font-size: 24px;
        margin-bottom: 48px;
      }

      .panelList {
        /* overflow-y: auto; */
      }

      .panelButton {
        padding: 7px 16px;
        border: 2px solid currentColor;
        border-radius: 20px;
        cursor: pointer;
        transition: background 218ms;
      }

      .panelButton:hover,
      .panelButton.isActive {
        background: rgba(0, 0, 0, 0.1);
      }

      .panelButton + .panelButton {
        margin-top: 24px;
      }

      .wonBlessings {
        line-height: 1.6;
        padding: 14px;
        margin-top: -22px;
        margin-bottom: 28px;
        background: rgba(255, 255, 255, 0.65);
        border-radius: 25px;
      }

      .wonBlessings em {
        margin-right: 2px;
        color: ${svPrimary}
      }
    `
  }

  render () {
    const { status, ui } = this.props

    if (!ui.panel) return null

    switch (status) {
      case 'stopped':
        return this.renderStartPanel()
      case 'paused':
        return this.renderPausedPanel()
      case 'won':
        return this.renderWonPanel()
      default:
       return null
    }
  }

  renderPanelWrap (children) {
    const { h, s, sc } = this

    return h('div', { classes: sc(s.panelWrap), key: s.panelWrap }, [
      h('div', { classes: sc(s.panelBody) }, [
        h('div', { classes: sc(s.panelTitle) }, GAME_NAME),
        h('div', { classes: sc(s.panelList) }, children)
      ])
    ])
  }

  renderStartPanel () {
    const { h, s, sc } = this
    const { ui } = this.props
    const { panelActions } = ui

    const actionTexts = [
      'Start Game',
      'Keyboard Controls',
      'Behind the Scenes'
    ]

    return this.renderPanelWrap(
      panelActions.map((action, index) => {
        return this.renderPanelButton(action, actionTexts[index])
      })
    )
  }

  renderPausedPanel () {
    const { h, s, sc } = this
    const { ui } = this.props
    const { panelActions } = ui

    const actionTexts = [
      'Resume Game',
      'Keyboard Controls',
      'Return to Begin'
    ]

    return this.renderPanelWrap(
      panelActions.map((action, index) => {
        return this.renderPanelButton(action, actionTexts[index])
      })
    )
  }

  renderWonPanel () {
    const { h, s, sc } = this
    const { player, display, ui } = this.props
    const { panelActions } = ui

    const stepsTaken = player.movedSteps
    let secondsTaken = new Date(display.endTime).getTime() - new Date(display.startTime).getTime()
    secondsTaken = Math.ceil(secondsTaken / 1000)

    const actionTexts = [
      'Return to Begin'
    ]

    const blessings = h('div', {
      classes: sc(s.wonBlessings),
      innerHTML: `Congratulations! You won the game.
        <br/>Time taken is <em>${secondsTaken}</em> seconds with <em>${stepsTaken}</em> steps.`
    })

    const bottons = panelActions.map((action, index) => {
      return this.renderPanelButton(action, actionTexts[index])
    })

    return this.renderPanelWrap(
      [blessings].concat(bottons)
    )
  }

  renderPanelButton (action, text) {
    const { h, s, sc } = this
    const { ui } = this.props

    return h('div', {
      classes: { [s.panelButton]: true, [s.isActive]: ui.onSelectAction === action },
      dataAction: action,
      onmouseover: this.handlePanelButtonHover,
      onclick: this.handlePanelButtonClick,
      bind: this
    }, text)
  }

  handlePanelButtonHover (e) {
    const { dispatch } = store
    const { switchCurrentlySelectedAction } = actionCreators

    const $target = e.currentTarget
    const actionName = $target.getAttribute('dataAction')

    dispatch(switchCurrentlySelectedAction(actionName))
  }

  handlePanelButtonClick () {
    const { keyboardShortcuts } = this.props
    const { simulateKeypress } = utils

    // @Hack: Simulate Keypress on click
    simulateKeypress(keyboardShortcuts.select)
  }

}

/**
 * Scene View
 */
class SceneView extends BaseView {

  style () {
    const {
      svPrimary,
      svZIndexScene
    } = this.sv

    const svTextCellSize = 40 // 5
    const svTextCellUnit = 'px' // vh

    this.lsv = {
      svTextCellSize,
      svTextCellUnit
    }

    return this.csjs`

      /* Common */
      .sceneWrap {
        position: absolute;
        z-index: ${svZIndexScene};
        width: 100%;
      }

      .scene {
        position: absolute;
        width: 100%;
        height: 100vh;
        display: flex;
        will-change: transform;
        transition: all 618ms;
      }

      .sceneLayer {
        position: absolute;
        display: flex;
        max-width: 100%;
        max-height: 100vh;
        margin: auto;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
      }

      .sceneLayer.sceneEntities {
        z-index: 2;
      }

      .sceneLayer.sceneMap {
        z-index: 1;
        flex-direction: row;
      }

      .commonCol {
        flex: 0 0 auto;
        width: ${svTextCellSize}${svTextCellUnit};
      }

      .commonCell {
        flex: 1 0 auto;
      }

      .commonEntity {
        position: absolute;
      }

      /* Text */
      .textScene {

      }

      .textCell {
        display: flex;
        justify-content: center;
        align-items: center;
        width: ${svTextCellSize}${svTextCellUnit};
        height: ${svTextCellSize}${svTextCellUnit};
      }

      .textCell.typeRoad {
        color: #cccccc;
        transition: all 418ms 218ms;
      }

      .textCell.typeWall {
        color: #666666; /* #a6a6a6 */
      }

      .textCell.typeStart {
        color: currentColor !important;
        background: #f3ece2 !important;
      }

      .textCell.typeEnd {
        color: currentColor !important;
        background: #e2e9f3 !important;
      }

      .textCell.isWalked {
        color: ${svPrimary};
      }

      .textCell.isSolution {
        background: #e9f3e2;
      }

      .textEntity.typePlayer {
        align-items: flex-end;
        padding: 10px;
        background: ${svPrimary};
        background-clip: content-box;
        border-radius: 50%;
        color: #ffffff;
        opacity: 0.9;
        will-change: transform;
        transition: all 318ms;
      }

      /* Graphic */
      .graphicScene {
        align-items: center;
        justify-content: center;
      }

    `
  }

  render () {
    const { display } = this.props
    const { sceneType } = display
    const { svTextCellSize, svTextCellUnit } = this.lsv

    this.layoutEngine = new AbsoluteLayoutEngine({
      unit: svTextCellUnit,
      unitLength: svTextCellSize
    })

    switch (sceneType) {
      case 'text':
        return this.renderTextScene()
      case 'graphic':
        return this.renderGraphicScene()
      default:
       return null
    }
  }

  renderSceneWrap (children) {
    const { h, s, sc } = this
    const { cols, rows } = this.props.place

    return h('div', { classes: sc(s.sceneWrap), key: s.sceneWrap }, children)
  }

  renderTextScene () {
    const { h, s, sc } = this
    const { layoutEngine } = this
    const { unitLength, unit } = this.layoutEngine.options
    const { map, cols, rows } = this.props.place

    const heroPoint = this.getCameraTraceTarget()
    const camera = new HeroFocusedCamera({
      layoutEngine,
      heroPoint,
      totalCols: cols,
      totalRows: rows
    })

    const viewportOffset = camera.getViewportOffset()
    const sceneLayerSize = camera.getSceneLayerSize()

    return this.renderSceneWrap([
      h('div', { classes: sc(s.scene, s.textScene), styles: viewportOffset, key: s.textScene }, [
        h('div', { classes: sc(s.sceneLayer, s.sceneEntities), styles: sceneLayerSize }, [
          this.renderTextScenePlayer()
        ]),
        h('div', { classes: sc(s.sceneLayer, s.sceneMap), styles: sceneLayerSize, key: s.sceneMap }, map.map((col, index) => {
          return h('div', { classes: sc(s.commonCol), key: `col-${index}` }, [
            col.map(cell => this.renderTextCell(cell))
          ])
        }))
      ])
    ])
  }

  getCameraTraceTarget () {
    const { display, player, place } = this.props
    const { grid } = place
    const { cameraTraceTarget } = display

    switch (cameraTraceTarget) {
      case 'player': return player
      default: return grid.getCellAt(0, 0)
    }
  }

  renderTextScenePlayer () {
    const { h, s, sc } = this
    const { layoutEngine } = this
    const { status, player } = this.props

    const playerOffset = layoutEngine.getPositionTransformAt(player.x, player.y)

    if (status === 'stopped') {
      return null
    }

    return h('div', {
      classes: sc(s.textCell, s.commonEntity, s.textEntity, s.typePlayer),
      styles: playerOffset }
    , '@')
  }

  renderTextCell (cell) {
    const { capitalize, randomChoice } = utils
    const { h, s, sc } = this
    const { display, place } = this.props
    const { types } = place.grid.options

    const wallSymbols = ['#', '■', '/', '❄', '⚑', '◎']

    const roadSymbols = ['.∵', '.∵。', '。.']

    const typeSymbolsMap = {
      'start': 'S',
      'end': 'E',
      'wall': wallSymbols[3], // randomChoice(wallSymbols)
      'road': roadSymbols[0] // randomChoice(roadSymbols)
    }

    const topClasses = sc(
      s.commonCell,
      s.textCell
    )

    // @FIXME: Break the second rule http://maquettejs.org/docs/rules.html
    for (let type in types) {
      topClasses[s[`type${capitalize(type)}`]] = cell.type === type
    }

    topClasses[s.isWalked] = cell.isWalked
    topClasses[s.isSolution] = display.solution && cell.isSolution

    return h('div', { classes: topClasses, key: `cell-${cell.x}-${cell.y}` },
      typeSymbolsMap[cell.type]
    )
  }

  renderGraphicScene () {
    const { h, s, sc } = this

    return this.renderSceneWrap([
      h('div', {
        classes: sc(s.scene, s.graphicScene),
        key: s.graphicScene
      }, 'Graphic scene is WIP, please press T to switch to text scene. (¬_¬)')
    ])
  }

}

/**
 * Game View
 */
class GameView extends BaseView {

  style () {
    return this.csjs `

      .game {
        position: relative;
        background: #ffffff;
        height: 100vh;
        transition: all 518ms;
      }

      .game.isInvertColors {
        -webkit-filter: invert(100%);
      }

    `
  }

  render () {
    const { h, hc, s } = this
    const { invert } = this.props.display

    return h('div', { classes: { [s.game]: true, [s.isInvertColors]: invert } }, [
      this.renderModal(),
      this.renderPanel(),
      this.renderHUD(),
      this.renderScene()
    ])
  }

  renderModal () {
    const { h, hc } = this
    const { ui, keyboardShortcuts } = this.props
    const { modal } = ui

    let title = null
    let content = null

    if (!modal) {
      return null
    } else if (modal === 'keyboardControls') {
      title = 'Keyboard Controls'
      content = hc(KBCView, { keyboardShortcuts })
    }

    return hc(ModalView, { keyboardShortcuts, title }, [content])
  }

  renderPanel () {
    const { hc } = this
    const { status, player, display, ui, keyboardShortcuts } = this.props

    return hc(PanelView, { status, player, display, ui, keyboardShortcuts })
  }

  renderScene () {
    const { hc } = this
    const { status, display, player, place } = this.props

    if (status === 'stopped' && !place) {
      return null
    }

    return hc(SceneView, { status, display, player, place })
  }

  renderHUD () {
    const { hc } = this
    const { status, ui, display } = this.props

    if (status === 'stopped') {
      return null
    }

    return hc(HUDView, { ui, display })
  }

}

/* ==== Game Main ==== */

// Sound
const soundManager = new SoundManager()

// Store instance
const store = new Store(
  // middlewares.logger,
  middlewares.linked,
  middlewares.soundSpawn(soundManager)
)

// @TODO: MainLoop && Animation
class Game {

  static getDefaultProps () {
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
    }
  }

  constructor (props) {
    // Data
    this.props = Object.assign({}, Game.getDefaultProps(), props) // Immutable = state
    this.state = store.getState() // Update by dispatching action
    this.places = [] // Local data
    // DOMs
    this.$container = document.querySelector('.gameContainer')
    this.$body      = document.querySelector('body')
    // Events
    this.keyboardListener = null
    this._eventListeners()
    // Mount
    this._render(this.state)
    this._genPlaces()
    // @DEV
    // soundManager.bgm.mute(true)
    // soundManager.effects.mute(true)
    // this.start()
  }

  _eventListeners () {
    // User inputs
    this.keyboardListener = new KeyboardListener({
      handlePress: this._handlePlayerKeydown.bind(this)
    })

    // Window
    window.addEventListener('resize', this._handleResizeWindow.bind(this), false)

    // Store
    store.subscribe(this._update.bind(this))

    // @MAYBE: Router, Socket...
    return this
  }

  _handlePlayerKeydown (keyCode) {
    const { keymap } = utils
    const { keyboardShortcuts } = this.props
    const { status } = this.state

    const inputKeyName = keymap(keyCode)
    const persistingControls = ['togglePopup', 'select', 'invertPageColors', 'moveUp', 'moveDown']
    const persistingKeys = persistingControls
      .map(control => keyboardShortcuts[control])
      .join('|')
      .split('|')

    const disableConditions = [
      () => inputKeyName === undefined,
      () => status !== 'started' && persistingKeys.indexOf(inputKeyName) === -1
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

  _handleResizeWindow () {
    store.dispatch(actionCreators.resizeWindow())
  }

  _genPlaces () {
    const { places } = this

    const placeNames = [
      'Brekka',
      // 'Prestbakki',
      'Tungufell'
    ]

    const baseCols  = 57
    const baseRows  = 47
    const sizeDelta = 21

    placeNames.map((name, index) => {
      const cols = baseCols + (index * sizeDelta)
      const rows = baseRows + (index * sizeDelta)

      const grid = new MazeGrid({ cols, rows, name })
      const place = {
        index,
        name,
        cols,
        rows,
        grid,
        map: grid.getMatrix()
      }

      places.push(place)
      store.dispatch(actionCreators.addPlace({}))
    })
  }

  _update () {
    this.state = store.getState()
    const combinedState = this._genCombinedState(this.state)
    this.renderer.update(combinedState)
  }

  _genCombinedState (state) {
    const { keyboardShortcuts } = this.props
    const place = this.getCurrentPlace()

    return Object.assign({}, state, {
      keyboardShortcuts,
      place
    })
  }

  _render () {
    const { renderMode } = this.props

    switch (renderMode) {
      case 'dom':
        return this._renderInDOM()
      case 'canvas':
        return this._renderInCanvas()
    }
  }

  _renderInDOM ()  {
    const combinedState = this._genCombinedState(this.state)

    this.renderer = new GameView(combinedState)
    this.renderer.mount(this.$container)
  }

  _renderInCanvas (state) {
    const combinedState = this._genCombinedState(this.state)

    // @TODO: HTML 2 Canvas
    // @P.S. Supportting multiple renderers is a complex abstraction, refer to Pixi.js or React
  }

  _initPlayer () {
    const place = this.getCurrentPlace()
    const startCell = place.grid.getStartCell()

    store.dispatch(actionCreators.playerMoveTo(startCell.getPoint()))
  }

  getCurrentPlace () {
    const { places } = this
    const { display } = this.state
    const { cameraTraceTarget } = display

    const placeIndex = this.state[cameraTraceTarget].placeIndex

    return places[placeIndex]
  }

  start () {
    const { display } = this.state
    const { startTime } = display

    if (!startTime) {
      store.dispatch(actionCreators.startTime(new Date()))
      this._initPlayer()
    }

    store.dispatch(actionCreators.startGame())
    soundManager.bgm.play()
  }

  pause () {
    store.dispatch(actionCreators.pauseGame())
    soundManager.bgm.pause()
  }

  resume () {
    this.start()
  }

  stop () {
    this.places = []
    this._genPlaces()
    store.dispatch(actionCreators.stopGame())

    soundManager.bgm.pause()
    soundManager.bgm.seek(0)
  }

  handleTogglePopup () {
    const { status, ui } = this.state

    if (ui.modal) {
      return store.dispatch(actionCreators.updateModal(null))
    }

    if (status === 'paused') {
      this.resume()
    } else if (status === 'started') {
      this.pause()
    }
  }

  handleSelect () {
    const { simulateKeyup } = utils
    const { keyboardShortcuts } = this.props
    const { status, ui } = this.state

    if (ui.modal) {
      return store.dispatch(actionCreators.updateModal(null))
    }

    if (!ui.panel) return

    soundManager.play('effects', 'click')

    switch (ui.onSelectAction) {
      case 'behindTheScenes':
        window.open(PRESENTATION_URL)
        // @Hack: Fouce excute simulateKeyup
        return simulateKeyup(keyboardShortcuts.select)
      case 'startGame':
        return this.start()
      case 'stopGame':
       return this.stop()
      default:
        const action = actionCreators[ui.onSelectAction]
        if (action) store.dispatch(action())
    }
  }

  _handleMovePlayer (dir) {
    const place = this.getCurrentPlace()
    const { player } = this.state
    const { getDX, getDY } = direction
    const { grid } = place

    const nextPoint = {
      x: player.x + getDX(dir),
      y: player.y + getDY(dir)
    }

    const nextCell = grid.getCellAt(nextPoint.x, nextPoint.y)

    if (!nextCell || !nextCell.walkable) {
      return null
    }

    nextCell.walk()
    store.dispatch(actionCreators.playerMove(dir))

    if (nextCell.type === 'end') {
      this._handleEndPoint()
    }
  }

  _handleEndPoint () {
    const { places } = this
    const { player } = this.state

    const nextPlaceIndex = player.placeIndex + 1

    if (nextPlaceIndex >= places.length) {
      store.dispatch(actionCreators.endTime(new Date()))
      store.dispatch(actionCreators.winGame())
    } else {
      store.dispatch(actionCreators.playerPlaceIndex(nextPlaceIndex))
      this._initPlayer()
    }

    soundManager.effects.play('success')
  }

  handleMoveLeft () {
    this._handleMovePlayer('W')
  }

  handleMoveRight () {
    this._handleMovePlayer('E')
  }

  handleMoveUp () {
    const { status, ui } = this.state
    const { panel, panelActions, onSelectAction, modal } = ui

    if (modal) return

    if (panel) {
      const currentIndex = panelActions.indexOf(onSelectAction)
      const nextIndex = currentIndex === 0 ? panelActions.length - 1 : currentIndex - 1
      const nextAction = panelActions[nextIndex]
      store.dispatch(actionCreators.switchCurrentlySelectedAction(nextAction))
    } else if (status === 'started') {
      this._handleMovePlayer('N')
    }
  }

  handleMoveDown () {
    const { status, ui } = this.state
    const { panel, panelActions, onSelectAction, modal } = ui

    if (modal) return

    if (panel) {
      const currentIndex = panelActions.indexOf(onSelectAction)
      const nextIndex = currentIndex === panelActions.length - 1 ? 0 : currentIndex + 1
      const nextAction = panelActions[nextIndex]
      store.dispatch(actionCreators.switchCurrentlySelectedAction(nextAction))
    } else if (status === 'started') {
      this._handleMovePlayer('S')
    }
  }

  handleOpenMap () {
    store.dispatch(actionCreators.toggleMap())
  }

  handleInvertPageColors () {
    store.dispatch(actionCreators.invertPageColors())
  }

  handleGetSolution () {
    store.dispatch(actionCreators.toggleSolution())
  }

  handleSwitchToTextScene () {
    store.dispatch(actionCreators.switchSenceType('text'))
  }

  handleSwitchToGraphicScene () {
    store.dispatch(actionCreators.switchSenceType('graphic'))
  }

  handleJump () {
    // @TODO
  }

  handleAttack () {
    // @TODO
  }

}

/* == Init == */
void function init () {
  const config = { }
  const game = new Game(config)
  if (DEBUG) window.game = game
}()

}()
