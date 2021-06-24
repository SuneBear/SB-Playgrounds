# browser-media-mime-type

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

A simple mime-type lookup for `<video>` and `<audio>` formats in modern browsers.

Please open a PR or issue if you feel something is missing from [the list](./mime-types.json).

Sourced from:

- http://www.leanbackplayer.com/test/h5mt.html
- https://github.com/broofa/node-mime/blob/master/types.json

## Example

```js
var mime = require('brwoser-media-mime-type')

mime('.mp4')
//=> 'video/mp4'

mime('mp3')
//=> 'audio/mpeg'
```

## Usage

[![NPM](https://nodei.co/npm/browser-media-mime-type.png)](https://www.npmjs.com/package/browser-media-mime-type)

#### `type = lookup(extension)`

Takes the case-insensitive `extension` string, with or without a leading dot, and returns a mime type that might be applicable for that extension.

#### `require('browser-media-mime-type/mime-types.josn')`

You can require the JSON for the raw mime types hash.

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/browser-media-mime-type/blob/master/LICENSE.md) for details.
