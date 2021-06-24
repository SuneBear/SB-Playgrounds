# xhr-progress [![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges) #

Get progress updates for your XMLHttpRequests where supported.

## Usage ##

[![xhr-progress](https://nodei.co/npm/xhr-progress.png?mini=true)](https://nodei.co/npm/xhr-progress)

### `progress(xhr)` ###

Returns an [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter)
that emits progress events for the `XMLHttpRequest` passed into the first
argument.

### `progress.on('data', handler(amount, total))` ###

Emitted for each progress update. `amount` is a number between 0 and 1
representing how much of the request has been completed. `total` is the
total size of the request.

If progress events are not available, `total` will default to `null`,
and this event will be emitted once the request is complete with an
`amount` of 1.

### `progress.on('end', handler())` ###

Called when the request is complete.

## License ##

MIT. See [LICENSE.md](http://github.com/hughsk/xhr-progress/blob/master/LICENSE.md) for details.
