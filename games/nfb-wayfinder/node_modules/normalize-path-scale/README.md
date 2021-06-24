# normalize-path-scale

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

Normalizes a 2D path to its bounding box, producing positions that are in the `-1.0 ... 1.0` range with correct aspect ratio. For example; to render arbitrary SVG paths in 3D, centred in world units.

This does not produce a copy of the path, but instead mutates it in place.

```js
var path = [ [x1, y1], [x2, y2], ... ]

//normalize path to -1.0 .. 1.0
normalize(path)

//render with webgl / canvas / etc
//...
```

## Usage

[![NPM](https://nodei.co/npm/normalize-path-scale.png)](https://nodei.co/npm/normalize-path-scale/)

### normalize(path[, bounds])

Normalizes the 2D `path` in place, scaling the points to `-1.0 .. 1.0` range. Maintains aspect ratio of the path. 

You can specify `bounds` for a custom bounding box:

```js
[ [minX, minY], [maxX, maxY] ]
```

Otherwise calculates the bounding box with [bound-points](https://github.com/mikolalysenko/bound-points).

Returns the specified `path`.

If the width or height of the bounding box is zero, this function returns early.

## Changes

- `2.0` changes the array in place, uses `bound-points`, returns early on zero size
- `1.0` a simple version that does not mutate the input

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/normalize-path-scale/blob/master/LICENSE.md) for details.
