# simple-media-element

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

A bare-bones `<audio>` and `<video>` element abstraction. Handles mime-type lookups for common extensions and allows setting attributes via an options object.

## Install

```sh
npm i simple-media-element --save
```

## Example

```js
const media = require('simple-media-element')

// create a new <audio> tag
const audioElement = media.audio('assets/foo.mp3', {
  loop: true,
  crossOrigin: 'Anonymous',
  volume: 0.5
})

// play the audio
audioElement.play()

// create a new <video> tag with multiple sources
const videoElement = media.video([
  'assets/video.ogv',
  'assets/video.webm'
])
```

## Usage

[![NPM](https://nodei.co/npm/simple-media-element.png)](https://www.npmjs.com/package/simple-media-element)

#### `element = media.video([src], [opt])`

Creates a new `<video>` element with `src`, a source or array of sources. A source can be:

- A string; in which case the mime-type is guessed from extension
- A object with `{ src, type }`
- A `<source>` element

These are added as children to the media element.

The options given to `opt`. If any is unspecified, it will not be set on the element.

- `loop` (Boolean)
- `muted` (Boolean)
- `autoplay` (Boolean)
- `controls` (Boolean)
- `crossOrigin` (String)
- `preload` (String)
- `poster` (String)
- `volume` (Number)

#### `element = media.audio([src], [opt])`

The same as above, but returns a `<audio>` element instead.

## License

MIT, see [LICENSE.md](http://github.com/Jam3/simple-media-element/blob/master/LICENSE.md) for details.
