document.documentElement.classList.add('enhanced');

!function e(t, i, s) {
  function n(a, o) {
    if (!i[a]) {
      if (!t[a]) {
        var h = "function" == typeof require && require;
        if (!o && h)
          return h(a, !0);
        if (r)
          return r(a, !0);
        var l = new Error("Cannot find module '" + a + "'");
        throw l.code = "MODULE_NOT_FOUND",
        l
      }
      var c = i[a] = {
        exports: {}
      };
      t[a][0].call(c.exports, (function(e) {
        return n(t[a][1][e] || e)
      }
      ), c, c.exports, e, t, i, s)
    }
    return i[a].exports
  }
  for (var r = "function" == typeof require && require, a = 0; a < s.length; a++)
    n(s[a]);
  return n
}({
  1: [function(e, t, i) {
    "use strict";
    function s() {
      this._createElements(),
      this._bindEvents()
    }
    var n = s.prototype;
    n._bindEvents = function() {
      this._onResize = this._resize.bind(this)
    }
    ,
    n._createElements = function() {
      this.span = document.createElement("span");
      var e = this.span.style;
      if (e.visibility = "hidden",
      e.position = "absolute",
      e.top = "0",
      e.bottom = "0",
      e.zIndex = "-1",
      this.span.innerHTML = "&nbsp;",
      !window.ResizeObserver) {
        this.iframe = document.createElement("iframe");
        var t = this.iframe.style;
        t.position = "absolute",
        t.top = "0",
        t.left = "0",
        t.width = "100%",
        t.height = "100%",
        this.span.appendChild(this.iframe)
      }
      document.body.appendChild(this.span)
    }
    ,
    n.detect = function(e) {
      this.originalSize = e || 17,
      this.currentSize = parseFloat(window.getComputedStyle(this.span)["font-size"]),
      this.currentSize > this.originalSize && this._onResize(),
      this.isDetecting || (window.ResizeObserver ? (this.resizeObserver = new ResizeObserver(this._onResize),
      this.resizeObserver.observe(this.span)) : this.iframe.contentWindow.addEventListener("resize", this._onResize),
      this.isDetecting = !0)
    }
    ,
    n._resize = function() {
      this.currentSize = parseFloat(window.getComputedStyle(this.span)["font-size"]),
      this.originalSize < this.currentSize ? document.documentElement.classList.add("text-zoom") : document.documentElement.classList.remove("text-zoom"),
      window.dispatchEvent(new Event("resize")),
      window.dispatchEvent(new CustomEvent("resize:text-zoom",{
        detail: this
      }))
    }
    ,
    n.getScale = function() {
      return this.currentSize / this.originalSize
    }
    ,
    n.remove = function() {
      this.isDetecting && (this.resizeObserver && this.resizeObserver.unobserve(this.span),
      this.iframe && this.iframe.contentWindow.removeEventListener("resize", this._onResize),
      this.isDetecting = !1)
    }
    ,
    n.destroy = function() {
      this.remove(),
      this.span && this.span.parentElement && this.span.parentElement.removeChild(this.span),
      this.span = null,
      this.iframe = null,
      this.resizeObserver = null
    }
    ,
    t.exports = new s
  }
  , {}],
  2: [function(e, t, i) {
    "use strict";
    t.exports = {
      cname: e(3)
    }
  }
  , {
    3: 3
  }],
  3: [function(e, t, i) {
    "use strict";
    var s = e(152).path;
    function n(e) {
      return n.addPrefix(e)
    }
    n._prefix = "/global/elements/blank.gif".replace(/global\/.*/, ""),
    n.addPrefix = function(e) {
      return s.isAbsolute(e) ? e : (n._assertRootRelative(e),
      e = (e = n._prefix + e.replace(/^\//, "")).replace(/(^.+)(\/105\/)/, "$1/"))
    }
    ,
    n.formatUrl = function(e, t, i, r) {
      var a = s.format({
        dirname: e,
        filename: t,
        extname: i
      }, r);
      return s.isAbsolute(a) ? a : (n._assertRootRelative(e),
      n.addPrefix(a))
    }
    ,
    n._assertRootRelative = function(e) {
      if (!s.isRootRelative(e))
        throw new URIError("Only root-relative paths are currently supported")
    }
    ,
    t.exports = n
  }
  , {
    152: 152
  }],
  4: [function(e, t, i) {
    "use strict";
    t.exports = {
      assert: e(5),
      count: e(6),
      countReset: e(7),
      dir: e(8),
      dirxml: e(9),
      enabled: e(10),
      error: e(11),
      group: e(12),
      groupCollapsed: e(13),
      groupEnd: e(14),
      info: e(15),
      log: e(17),
      profile: e(18),
      profileEnd: e(19),
      table: e(20),
      time: e(21),
      timeEnd: e(22),
      trace: e(23),
      warn: e(24)
    }
  }
  , {
    10: 10,
    11: 11,
    12: 12,
    13: 13,
    14: 14,
    15: 15,
    17: 17,
    18: 18,
    19: 19,
    20: 20,
    21: 21,
    22: 22,
    23: 23,
    24: 24,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9
  }],
  5: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("assert")
  }
  , {
    16: 16
  }],
  6: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("count")
  }
  , {
    16: 16
  }],
  7: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("countReset")
  }
  , {
    16: 16
  }],
  8: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("dir")
  }
  , {
    16: 16
  }],
  9: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("dirxml")
  }
  , {
    16: 16
  }],
  10: [function(e, t, i) {
    "use strict";
    var s = !1
      , n = window || self;
    try {
      s = !!n.localStorage.getItem("f7c9180f-5c45-47b4-8de4-428015f096c0")
    } catch (e) {}
    t.exports = s
  }
  , {}],
  11: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("error")
  }
  , {
    16: 16
  }],
  12: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("group")
  }
  , {
    16: 16
  }],
  13: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("groupCollapsed")
  }
  , {
    16: 16
  }],
  14: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("groupEnd")
  }
  , {
    16: 16
  }],
  15: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("info")
  }
  , {
    16: 16
  }],
  16: [function(e, t, i) {
    "use strict";
    var s = e(10);
    t.exports = function(e) {
      return function() {
        if (s && "object" == typeof window.console && "function" == typeof console[e])
          return console[e].apply(console, Array.prototype.slice.call(arguments, 0))
      }
    }
  }
  , {
    10: 10
  }],
  17: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("log")
  }
  , {
    16: 16
  }],
  18: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("profile")
  }
  , {
    16: 16
  }],
  19: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("profileEnd")
  }
  , {
    16: 16
  }],
  20: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("table")
  }
  , {
    16: 16
  }],
  21: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("time")
  }
  , {
    16: 16
  }],
  22: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("timeEnd")
  }
  , {
    16: 16
  }],
  23: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("trace")
  }
  , {
    16: 16
  }],
  24: [function(e, t, i) {
    "use strict";
    t.exports = e(16)("warn")
  }
  , {
    16: 16
  }],
  25: [function(e, t, i) {
    "use strict";
    t.exports = {
      EventEmitterMicro: e(26)
    }
  }
  , {
    26: 26
  }],
  26: [function(e, t, i) {
    "use strict";
    function s() {
      this._events = {}
    }
    var n = s.prototype;
    n.on = function(e, t) {
      this._events[e] = this._events[e] || [],
      this._events[e].unshift(t)
    }
    ,
    n.once = function(e, t) {
      var i = this;
      this.on(e, (function s(n) {
        i.off(e, s),
        void 0 !== n ? t(n) : t()
      }
      ))
    }
    ,
    n.off = function(e, t) {
      if (this.has(e)) {
        if (1 === arguments.length)
          return this._events[e] = null,
          void delete this._events[e];
        var i = this._events[e].indexOf(t);
        -1 !== i && this._events[e].splice(i, 1)
      }
    }
    ,
    n.trigger = function(e, t) {
      if (this.has(e))
        for (var i = this._events[e].length - 1; i >= 0; i--)
          void 0 !== t ? this._events[e][i](t) : this._events[e][i]()
    }
    ,
    n.has = function(e) {
      return e in this._events != !1 && 0 !== this._events[e].length
    }
    ,
    n.destroy = function() {
      for (var e in this._events)
        this._events[e] = null;
      this._events = null
    }
    ,
    t.exports = s
  }
  , {}],
  27: [function(e, t, i) {
    "use strict";
    var s = {};
    t.exports = function(e, t, i) {
      if (e = e.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]"),
      i || !s.hasOwnProperty(e)) {
        var n = new RegExp("[\\?&]" + e + "=([^&#]*)").exec(location.search)
          , r = null === n ? t : decodeURIComponent(n[1].replace(/\+/g, " "));
        "true" !== r && "false" !== r || (r = "true" === r),
        isNaN(parseFloat(r)) || (r = parseFloat(r)),
        s[e] = r
      }
      return s[e]
    }
  }
  , {}],
  28: [function(e, t, i) {
    t.exports = function(e, t, i) {
      return t in e ? Object.defineProperty(e, t, {
        value: i,
        enumerable: !0,
        configurable: !0,
        writable: !0
      }) : e[t] = i,
      e
    }
  }
  , {}],
  29: [function(e, t, i) {
    t.exports = function(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
  }
  , {}],
  30: [function(e, t, i) {
    var s = e(31);
    function n() {
      if ("function" != typeof WeakMap)
        return null;
      var e = new WeakMap;
      return n = function() {
        return e
      }
      ,
      e
    }
    t.exports = function(e) {
      if (e && e.__esModule)
        return e;
      if (null === e || "object" !== s(e) && "function" != typeof e)
        return {
          default: e
        };
      var t = n();
      if (t && t.has(e))
        return t.get(e);
      var i = {}
        , r = Object.defineProperty && Object.getOwnPropertyDescriptor;
      for (var a in e)
        if (Object.prototype.hasOwnProperty.call(e, a)) {
          var o = r ? Object.getOwnPropertyDescriptor(e, a) : null;
          o && (o.get || o.set) ? Object.defineProperty(i, a, o) : i[a] = e[a]
        }
      return i.default = e,
      t && t.set(e, i),
      i
    }
  }
  , {
    31: 31
  }],
  31: [function(e, t, i) {
    function s(e) {
      return "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? t.exports = s = function(e) {
        return typeof e
      }
      : t.exports = s = function(e) {
        return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
      }
      ,
      s(e)
    }
    t.exports = s
  }
  , {}],
  32: [function(e, t, i) {
    "use strict";
    t.exports = {
      majorVersionNumber: "3.x"
    }
  }
  , {}],
  33: [function(e, t, i) {
    "use strict";
    var s, n = e(25).EventEmitterMicro, r = e(42), a = e(41);
    function o(e) {
      e = e || {},
      n.call(this),
      this.id = a.getNewID(),
      this.executor = e.executor || r,
      this._reset(),
      this._willRun = !1,
      this._didDestroy = !1
    }
    (s = o.prototype = Object.create(n.prototype)).run = function() {
      return this._willRun || (this._willRun = !0),
      this._subscribe()
    }
    ,
    s.cancel = function() {
      this._unsubscribe(),
      this._willRun && (this._willRun = !1),
      this._reset()
    }
    ,
    s.destroy = function() {
      var e = this.willRun();
      return this.cancel(),
      this.executor = null,
      n.prototype.destroy.call(this),
      this._didDestroy = !0,
      e
    }
    ,
    s.willRun = function() {
      return this._willRun
    }
    ,
    s.isRunning = function() {
      return this._isRunning
    }
    ,
    s._subscribe = function() {
      return this.executor.subscribe(this)
    }
    ,
    s._unsubscribe = function() {
      return this.executor.unsubscribe(this)
    }
    ,
    s._onAnimationFrameStart = function(e) {
      this._isRunning = !0,
      this._willRun = !1,
      this._didEmitFrameData || (this._didEmitFrameData = !0,
      this.trigger("start", e))
    }
    ,
    s._onAnimationFrameEnd = function(e) {
      this._willRun || (this.trigger("stop", e),
      this._reset())
    }
    ,
    s._reset = function() {
      this._didEmitFrameData = !1,
      this._isRunning = !1
    }
    ,
    t.exports = o
  }
  , {
    25: 25,
    41: 41,
    42: 42
  }],
  34: [function(e, t, i) {
    "use strict";
    var s, n = e(26);
    function r(e) {
      e = e || {},
      this._reset(),
      this.updatePhases(),
      this.eventEmitter = new n,
      this._willRun = !1,
      this._totalSubscribeCount = -1,
      this._requestAnimationFrame = window.requestAnimationFrame,
      this._cancelAnimationFrame = window.cancelAnimationFrame,
      this._boundOnAnimationFrame = this._onAnimationFrame.bind(this),
      this._boundOnExternalAnimationFrame = this._onExternalAnimationFrame.bind(this)
    }
    (s = r.prototype).frameRequestedPhase = "requested",
    s.startPhase = "start",
    s.runPhases = ["update", "external", "draw"],
    s.endPhase = "end",
    s.disabledPhase = "disabled",
    s.beforePhaseEventPrefix = "before:",
    s.afterPhaseEventPrefix = "after:",
    s.subscribe = function(e, t) {
      return this._totalSubscribeCount++,
      this._nextFrameSubscribers[e.id] || (t ? this._nextFrameSubscribersOrder.unshift(e.id) : this._nextFrameSubscribersOrder.push(e.id),
      this._nextFrameSubscribers[e.id] = e,
      this._nextFrameSubscriberArrayLength++,
      this._nextFrameSubscriberCount++,
      this._run()),
      this._totalSubscribeCount
    }
    ,
    s.subscribeImmediate = function(e, t) {
      return this._totalSubscribeCount++,
      this._subscribers[e.id] || (t ? this._subscribersOrder.splice(this._currentSubscriberIndex + 1, 0, e.id) : this._subscribersOrder.unshift(e.id),
      this._subscribers[e.id] = e,
      this._subscriberArrayLength++,
      this._subscriberCount++),
      this._totalSubscribeCount
    }
    ,
    s.unsubscribe = function(e) {
      return !!this._nextFrameSubscribers[e.id] && (this._nextFrameSubscribers[e.id] = null,
      this._nextFrameSubscriberCount--,
      0 === this._nextFrameSubscriberCount && this._cancel(),
      !0)
    }
    ,
    s.getSubscribeID = function() {
      return this._totalSubscribeCount += 1
    }
    ,
    s.destroy = function() {
      var e = this._cancel();
      return this.eventEmitter.destroy(),
      this.eventEmitter = null,
      this.phases = null,
      this._subscribers = null,
      this._subscribersOrder = null,
      this._nextFrameSubscribers = null,
      this._nextFrameSubscribersOrder = null,
      this._rafData = null,
      this._boundOnAnimationFrame = null,
      this._onExternalAnimationFrame = null,
      e
    }
    ,
    s.useExternalAnimationFrame = function(e) {
      if ("boolean" == typeof e) {
        var t = this._isUsingExternalAnimationFrame;
        return e && this._animationFrame && (this._cancelAnimationFrame.call(window, this._animationFrame),
        this._animationFrame = null),
        !this._willRun || e || this._animationFrame || (this._animationFrame = this._requestAnimationFrame.call(window, this._boundOnAnimationFrame)),
        this._isUsingExternalAnimationFrame = e,
        e ? this._boundOnExternalAnimationFrame : t || !1
      }
    }
    ,
    s.updatePhases = function() {
      this.phases || (this.phases = []),
      this.phases.length = 0,
      this.phases.push(this.frameRequestedPhase),
      this.phases.push(this.startPhase),
      Array.prototype.push.apply(this.phases, this.runPhases),
      this.phases.push(this.endPhase),
      this._runPhasesLength = this.runPhases.length,
      this._phasesLength = this.phases.length
    }
    ,
    s._run = function() {
      if (!this._willRun)
        return this._willRun = !0,
        0 === this.lastFrameTime && (this.lastFrameTime = performance.now()),
        this._animationFrameActive = !0,
        this._isUsingExternalAnimationFrame || (this._animationFrame = this._requestAnimationFrame.call(window, this._boundOnAnimationFrame)),
        this.phase === this.disabledPhase && (this.phaseIndex = 0,
        this.phase = this.phases[this.phaseIndex]),
        !0
    }
    ,
    s._cancel = function() {
      var e = !1;
      return this._animationFrameActive && (this._animationFrame && (this._cancelAnimationFrame.call(window, this._animationFrame),
      this._animationFrame = null),
      this._animationFrameActive = !1,
      this._willRun = !1,
      e = !0),
      this._isRunning || this._reset(),
      e
    }
    ,
    s._onAnimationFrame = function(e) {
      for (this._subscribers = this._nextFrameSubscribers,
      this._subscribersOrder = this._nextFrameSubscribersOrder,
      this._subscriberArrayLength = this._nextFrameSubscriberArrayLength,
      this._subscriberCount = this._nextFrameSubscriberCount,
      this._nextFrameSubscribers = {},
      this._nextFrameSubscribersOrder = [],
      this._nextFrameSubscriberArrayLength = 0,
      this._nextFrameSubscriberCount = 0,
      this.phaseIndex = 0,
      this.phase = this.phases[this.phaseIndex],
      this._isRunning = !0,
      this._willRun = !1,
      this._didRequestNextRAF = !1,
      this._rafData.delta = e - this.lastFrameTime,
      this.lastFrameTime = e,
      this._rafData.fps = 0,
      this._rafData.delta >= 1e3 && (this._rafData.delta = 0),
      0 !== this._rafData.delta && (this._rafData.fps = 1e3 / this._rafData.delta),
      this._rafData.time = e,
      this._rafData.naturalFps = this._rafData.fps,
      this._rafData.timeNow = Date.now(),
      this.phaseIndex++,
      this.phase = this.phases[this.phaseIndex],
      this.eventEmitter.trigger(this.beforePhaseEventPrefix + this.phase),
      this._currentSubscriberIndex = 0; this._currentSubscriberIndex < this._subscriberArrayLength; this._currentSubscriberIndex++)
        null !== this._subscribers[this._subscribersOrder[this._currentSubscriberIndex]] && !1 === this._subscribers[this._subscribersOrder[this._currentSubscriberIndex]]._didDestroy && this._subscribers[this._subscribersOrder[this._currentSubscriberIndex]]._onAnimationFrameStart(this._rafData);
      for (this.eventEmitter.trigger(this.afterPhaseEventPrefix + this.phase),
      this._runPhaseIndex = 0; this._runPhaseIndex < this._runPhasesLength; this._runPhaseIndex++) {
        for (this.phaseIndex++,
        this.phase = this.phases[this.phaseIndex],
        this.eventEmitter.trigger(this.beforePhaseEventPrefix + this.phase),
        this._currentSubscriberIndex = 0; this._currentSubscriberIndex < this._subscriberArrayLength; this._currentSubscriberIndex++)
          null !== this._subscribers[this._subscribersOrder[this._currentSubscriberIndex]] && !1 === this._subscribers[this._subscribersOrder[this._currentSubscriberIndex]]._didDestroy && this._subscribers[this._subscribersOrder[this._currentSubscriberIndex]].trigger(this.phase, this._rafData);
        this.eventEmitter.trigger(this.afterPhaseEventPrefix + this.phase)
      }
      for (this.phaseIndex++,
      this.phase = this.phases[this.phaseIndex],
      this.eventEmitter.trigger(this.beforePhaseEventPrefix + this.phase),
      this._currentSubscriberIndex = 0; this._currentSubscriberIndex < this._subscriberArrayLength; this._currentSubscriberIndex++)
        null !== this._subscribers[this._subscribersOrder[this._currentSubscriberIndex]] && !1 === this._subscribers[this._subscribersOrder[this._currentSubscriberIndex]]._didDestroy && this._subscribers[this._subscribersOrder[this._currentSubscriberIndex]]._onAnimationFrameEnd(this._rafData);
      this.eventEmitter.trigger(this.afterPhaseEventPrefix + this.phase),
      this._willRun ? (this.phaseIndex = 0,
      this.phaseIndex = this.phases[this.phaseIndex]) : this._reset()
    }
    ,
    s._onExternalAnimationFrame = function(e) {
      this._isUsingExternalAnimationFrame && this._onAnimationFrame(e)
    }
    ,
    s._reset = function() {
      this._rafData || (this._rafData = {}),
      this._rafData.time = 0,
      this._rafData.delta = 0,
      this._rafData.fps = 0,
      this._rafData.naturalFps = 0,
      this._rafData.timeNow = 0,
      this._subscribers = {},
      this._subscribersOrder = [],
      this._currentSubscriberIndex = -1,
      this._subscriberArrayLength = 0,
      this._subscriberCount = 0,
      this._nextFrameSubscribers = {},
      this._nextFrameSubscribersOrder = [],
      this._nextFrameSubscriberArrayLength = 0,
      this._nextFrameSubscriberCount = 0,
      this._didEmitFrameData = !1,
      this._animationFrame = null,
      this._animationFrameActive = !1,
      this._isRunning = !1,
      this._shouldReset = !1,
      this.lastFrameTime = 0,
      this._runPhaseIndex = -1,
      this.phaseIndex = -1,
      this.phase = this.disabledPhase
    }
    ,
    t.exports = r
  }
  , {
    26: 26
  }],
  35: [function(e, t, i) {
    "use strict";
    var s = e(37)
      , n = function(e) {
      this.phase = e,
      this.rafEmitter = new s,
      this._cachePhaseIndex(),
      this.requestAnimationFrame = this.requestAnimationFrame.bind(this),
      this.cancelAnimationFrame = this.cancelAnimationFrame.bind(this),
      this._onBeforeRAFExecutorStart = this._onBeforeRAFExecutorStart.bind(this),
      this._onBeforeRAFExecutorPhase = this._onBeforeRAFExecutorPhase.bind(this),
      this._onAfterRAFExecutorPhase = this._onAfterRAFExecutorPhase.bind(this),
      this.rafEmitter.on(this.phase, this._onRAFExecuted.bind(this)),
      this.rafEmitter.executor.eventEmitter.on("before:start", this._onBeforeRAFExecutorStart),
      this.rafEmitter.executor.eventEmitter.on("before:" + this.phase, this._onBeforeRAFExecutorPhase),
      this.rafEmitter.executor.eventEmitter.on("after:" + this.phase, this._onAfterRAFExecutorPhase),
      this._frameCallbacks = [],
      this._currentFrameCallbacks = [],
      this._nextFrameCallbacks = [],
      this._phaseActive = !1,
      this._currentFrameID = -1,
      this._cancelFrameIdx = -1,
      this._frameCallbackLength = 0,
      this._currentFrameCallbacksLength = 0,
      this._nextFrameCallbacksLength = 0,
      this._frameCallbackIteration = 0
    }
      , r = n.prototype;
    r.requestAnimationFrame = function(e, t) {
      return !0 === t && this.rafEmitter.executor.phaseIndex > 0 && this.rafEmitter.executor.phaseIndex <= this.phaseIndex ? this._phaseActive ? (this._currentFrameID = this.rafEmitter.executor.subscribeImmediate(this.rafEmitter, !0),
      this._frameCallbacks.push(this._currentFrameID, e),
      this._frameCallbackLength += 2) : (this._currentFrameID = this.rafEmitter.executor.subscribeImmediate(this.rafEmitter, !1),
      this._currentFrameCallbacks.push(this._currentFrameID, e),
      this._currentFrameCallbacksLength += 2) : (this._currentFrameID = this.rafEmitter.run(),
      this._nextFrameCallbacks.push(this._currentFrameID, e),
      this._nextFrameCallbacksLength += 2),
      this._currentFrameID
    }
    ,
    r.cancelAnimationFrame = function(e) {
      this._cancelFrameIdx = this._nextFrameCallbacks.indexOf(e),
      this._cancelFrameIdx > -1 ? this._cancelNextAnimationFrame() : (this._cancelFrameIdx = this._currentFrameCallbacks.indexOf(e),
      this._cancelFrameIdx > -1 ? this._cancelCurrentAnimationFrame() : (this._cancelFrameIdx = this._frameCallbacks.indexOf(e),
      this._cancelFrameIdx > -1 && this._cancelRunningAnimationFrame()))
    }
    ,
    r._onRAFExecuted = function(e) {
      for (this._frameCallbackIteration = 0; this._frameCallbackIteration < this._frameCallbackLength; this._frameCallbackIteration += 2)
        this._frameCallbacks[this._frameCallbackIteration + 1](e.time, e);
      this._frameCallbacks.length = 0,
      this._frameCallbackLength = 0
    }
    ,
    r._onBeforeRAFExecutorStart = function() {
      Array.prototype.push.apply(this._currentFrameCallbacks, this._nextFrameCallbacks.splice(0, this._nextFrameCallbacksLength)),
      this._currentFrameCallbacksLength = this._nextFrameCallbacksLength,
      this._nextFrameCallbacks.length = 0,
      this._nextFrameCallbacksLength = 0
    }
    ,
    r._onBeforeRAFExecutorPhase = function() {
      this._phaseActive = !0,
      Array.prototype.push.apply(this._frameCallbacks, this._currentFrameCallbacks.splice(0, this._currentFrameCallbacksLength)),
      this._frameCallbackLength = this._currentFrameCallbacksLength,
      this._currentFrameCallbacks.length = 0,
      this._currentFrameCallbacksLength = 0
    }
    ,
    r._onAfterRAFExecutorPhase = function() {
      this._phaseActive = !1
    }
    ,
    r._cachePhaseIndex = function() {
      this.phaseIndex = this.rafEmitter.executor.phases.indexOf(this.phase)
    }
    ,
    r._cancelRunningAnimationFrame = function() {
      this._frameCallbacks.splice(this._cancelFrameIdx, 2),
      this._frameCallbackLength -= 2
    }
    ,
    r._cancelCurrentAnimationFrame = function() {
      this._currentFrameCallbacks.splice(this._cancelFrameIdx, 2),
      this._currentFrameCallbacksLength -= 2
    }
    ,
    r._cancelNextAnimationFrame = function() {
      this._nextFrameCallbacks.splice(this._cancelFrameIdx, 2),
      this._nextFrameCallbacksLength -= 2,
      0 === this._nextFrameCallbacksLength && this.rafEmitter.cancel()
    }
    ,
    t.exports = n
  }
  , {
    37: 37
  }],
  36: [function(e, t, i) {
    "use strict";
    var s = e(35)
      , n = function() {
      this.events = {}
    }
      , r = n.prototype;
    r.requestAnimationFrame = function(e) {
      return this.events[e] || (this.events[e] = new s(e)),
      this.events[e].requestAnimationFrame
    }
    ,
    r.cancelAnimationFrame = function(e) {
      return this.events[e] || (this.events[e] = new s(e)),
      this.events[e].cancelAnimationFrame
    }
    ,
    t.exports = new n
  }
  , {
    35: 35
  }],
  37: [function(e, t, i) {
    "use strict";
    var s = e(33)
      , n = function(e) {
      s.call(this, e)
    };
    (n.prototype = Object.create(s.prototype))._subscribe = function() {
      return this.executor.subscribe(this, !0)
    }
    ,
    t.exports = n
  }
  , {
    33: 33
  }],
  38: [function(e, t, i) {
    "use strict";
    var s = e(36);
    t.exports = s.cancelAnimationFrame("update")
  }
  , {
    36: 36
  }],
  39: [function(e, t, i) {
    "use strict";
    var s = e(36);
    t.exports = s.requestAnimationFrame("draw")
  }
  , {
    36: 36
  }],
  40: [function(e, t, i) {
    "use strict";
    var s = e(36);
    t.exports = s.requestAnimationFrame("external")
  }
  , {
    36: 36
  }],
  41: [function(e, t, i) {
    "use strict";
    var s = e(44).SharedInstance
      , n = e(32).majorVersionNumber
      , r = function() {
      this._currentID = 0
    };
    r.prototype.getNewID = function() {
      return this._currentID++,
      "raf:" + this._currentID
    }
    ,
    t.exports = s.share("@marcom/ac-raf-emitter/sharedRAFEmitterIDGeneratorInstance", n, r)
  }
  , {
    32: 32,
    44: 44
  }],
  42: [function(e, t, i) {
    "use strict";
    var s = e(44).SharedInstance
      , n = e(32).majorVersionNumber
      , r = e(34);
    t.exports = s.share("@marcom/ac-raf-emitter/sharedRAFExecutorInstance", n, r)
  }
  , {
    32: 32,
    34: 34,
    44: 44
  }],
  43: [function(e, t, i) {
    "use strict";
    var s = e(36);
    t.exports = s.requestAnimationFrame("update")
  }
  , {
    36: 36
  }],
  44: [function(e, t, i) {
    "use strict";
    t.exports = {
      SharedInstance: e(45)
    }
  }
  , {
    45: 45
  }],
  45: [function(e, t, i) {
    "use strict";
    var s, n = window, r = n.AC, a = (s = {},
    {
      get: function(e, t) {
        var i = null;
        return s[e] && s[e][t] && (i = s[e][t]),
        i
      },
      set: function(e, t, i) {
        return s[e] || (s[e] = {}),
        s[e][t] = "function" == typeof i ? new i : i,
        s[e][t]
      },
      share: function(e, t, i) {
        var s = this.get(e, t);
        return s || (s = this.set(e, t, i)),
        s
      },
      remove: function(e, t) {
        var i = typeof t;
        if ("string" !== i && "number" !== i)
          s[e] && (s[e] = null);
        else {
          if (!s[e] || !s[e][t])
            return;
          s[e][t] = null
        }
      }
    });
    r || (r = n.AC = {}),
    r.SharedInstance || (r.SharedInstance = a),
    t.exports = r.SharedInstance
  }
  , {}],
  46: [function(e, t, i) {
    "use strict";
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    Object.defineProperty(i, "ThreeJSLoader", {
      enumerable: !0,
      get: function() {
        return s.ThreeJSLoader
      }
    });
    var s = e(48)
  }
  , {
    48: 48
  }],
  47: [function(e, t, i) {
    "use strict";
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.PathsMap = void 0;
    let s = new Map;
    i.PathsMap = s,
    s.set("THREE", "three"),
    s.set("OrbitControls", "controls/OrbitControls"),
    s.set("TrackballControls", "controls/TrackballControls"),
    s.set("DRACOLoader", "loaders/DRACOLoader"),
    s.set("GLTFLoader", "loaders/GLTFLoader"),
    s.set("HDRCubeTextureLoader", "loaders/HDRCubeTextureLoader"),
    s.set("RGBELoader", "loaders/RGBELoader"),
    s.set("CSS3DRenderer", "renderers/CSS3DRenderer")
  }
  , {}],
  48: [function(e, t, i) {
    "use strict";
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.ThreeJSLoader = i.ThreeModuleLoader = void 0;
    var s = e(2)
      , n = e(47);
    const r = 118
      , a = "THREE"
      , o = "/ac/libs/three"
      , h = "js";
    class l {
      constructor() {
        this._settings = new Object,
        this._revisionNumber = null,
        this._loadQueue = new Array,
        this._didCreateScriptTag = !1
      }
      load(e) {

      }
      _getFileNames() {
        let e = new Array;
        l.isModuleLoaded(a) || e.push(n.PathsMap.get(a));
        for (let t in this._settings)
          "revisionNumber" !== t && this._settings[t] && void 0 !== n.PathsMap.get(t) && !l.isModuleLoaded(t) && e.push(n.PathsMap.get(t));
        return l.flattenArray(e)
      }
      static createScriptTag(e, t) {
        return new Promise((i,s)=>{
          let n = document.createElement("script")
            , r = l.getFilePath(e, t);
          n.src = r,
          n.async = !0,
          n.addEventListener("load", e=>{
            n.removeEventListener("load", this),
            i(r)
          }
          ),
          n.onerror = e=>{
            throw s(e),
            new Error("ThreeJSLoader::createScriptTag - Failed to load resource: ".concat(r))
          }
          ,
          document.body.appendChild(n)
        }
        )
      }
      static promiseChain(e) {
        return e.reduce((e,t)=>e.then(e=>t().then(Array.prototype.concat.bind(e))), Promise.resolve([]))
      }
      static getFilePath(e, t) {
        if (!e)
          throw new Error("ThreeJSLoader::getFilePath - No filename argument passed to the static method.");
        if (!t)
          throw new Error("ThreeJSLoader::getFilePath - No THREE version number argument passed to the static method.");
        return (0,
        s.cname)("".concat(o, "/").concat(t, "/").concat(e, ".").concat(h))
      }
      static flattenArray(e) {
        return (new Array).concat.apply(new Array, e)
      }
      static isModuleLoaded(e) {
        return e === a ? !!window[a] : void 0 !== window[a] && !!window[a][e]
      }
    }
    i.ThreeModuleLoader = l;
    const c = new l;
    i.ThreeJSLoader = c
  }
  , {
    2: 2,
    47: 47
  }],
  49: [function(e, t, i) {
    "use strict";
    class s {
      constructor(e={}) {
        this.options = e,
        "loading" === document.readyState ? document.addEventListener("readystatechange", e=>{
          "interactive" === document.readyState && this._init()
        }
        ) : this._init()
      }
      _init() {
        if (this._images = Array.from(document.querySelectorAll("*[".concat(s.DATA_ATTRIBUTE, "]"))),
        this.AnimSystem = this._findAnim(),
        null === this.AnimSystem)
          return null;
        this._addKeyframesToImages()
      }
      _defineKeyframeOptions(e=null) {
        const t = e.getAttribute(s.DATA_DOWNLOAD_AREA_KEYFRAME) || "{}";
        return Object.assign({}, {
          start: "t - 200vh",
          end: "b + 100vh",
          event: "AnimLazyImage"
        }, JSON.parse(t))
      }
      _addKeyframesToImages() {
        this._scrollGroup = this.AnimSystem.getGroupForTarget(document.body),
        this._images.forEach(e=>{
          this.AnimSystem.getGroupForTarget(e) && (this._scrollGroup = this.AnimSystem.getGroupForTarget(e));
          let t = this._defineKeyframeOptions(e);
          this._scrollGroup.addKeyframe(e, t).controller.once("AnimLazyImage:enter", ()=>{
            this._imageIsInLoadRange(e)
          }
          )
        }
        )
      }
      _cleanUpImageAttributes(e) {
        let t = !1;
        try {
          t = this._scrollGroup.getControllerForTarget(e).getNearestKeyframeForAttribute("AnimLazyImage").isCurrentlyInRange
        } catch (e) {
          t = !1
        }
        t || e.setAttribute(s.DATA_ATTRIBUTE, "")
      }
      _downloadingImageAttributes(e) {
        e.removeAttribute(s.DATA_ATTRIBUTE)
      }
      _imageIsInLoadRange(e) {
        this._downloadImage(e)
      }
      _downloadImage(e) {
        this._downloadingImageAttributes(e)
      }
      _findAnim() {
        var e = Array.from(document.querySelectorAll("[data-anim-group],[data-anim-scroll-group],[data-anim-time-group]"));
        return e.map(e=>e._animInfo ? e._animInfo.group : null).filter(e=>null !== e),
        e[0] && e[0]._animInfo ? e[0]._animInfo.group.anim : (console.error("AnimLazyImage: AnimSystem not found, please initialize anim before instantiating"),
        null)
      }
    }
    s.DATA_DOWNLOAD_AREA_KEYFRAME = "data-download-area-keyframe",
    s.DATA_ATTRIBUTE = "data-anim-lazy-image",
    t.exports = s
  }
  , {}],
  50: [function(e, t, i) {
    "use strict";
    const s = e(49)
      , n = e(151)
      , r = e(39)
      , a = e(43);
    class o extends s {
      constructor(e={}) {
        super(e),
        this.arrayImg = []
      }
      _init() {
        super._init(),
        this._onBreakpointChangeCallback = this._onBreakpointChangeCallback.bind(this),
        this._addViewportEvents(),
        this._resetPromises(),
        this._addMethodsToImageElement()
      }
      _addViewportEvents() {
        let e = this.options.breakpoints ? {
          breakpoints: this.options.breakpoints
        } : {};
        this.viewportEmitterMicro = new n(e),
        this.viewportEmitterMicro.on(n.CHANGE_EVENTS.VIEWPORT, this._onBreakpointChangeCallback),
        this.viewportEmitterMicro.on(n.CHANGE_EVENTS.RETINA, this._onBreakpointChangeCallback)
      }
      _addKeyframesToImages() {
        this._scrollGroup = this.AnimSystem.getGroupForTarget(document.body),
        this._images.forEach(e=>{
          this.AnimSystem.getGroupForTarget(e) && (this._scrollGroup = this.AnimSystem.getGroupForTarget(e));
          let t = this._defineKeyframeOptions(e);
          this._scrollGroup.addKeyframe(e, t).controller.on("AnimLazyImage:enter", ()=>{
            this._imageIsInLoadRange(e)
          }
          )
        }
        )
      }
      _onBreakpointChangeCallback(e) {
        this._resetPromises(),
        this.arrayImg = [],
        this._images.forEach(e=>{
          this._cleanUpImageAttributes(e),
          "" != e.getAttribute(s.DATA_ATTRIBUTE) && this._imageIsInLoadRange(e)
        }
        )
      }
      _resetPromises() {
        this._images.forEach(e=>{
          e.promises = {},
          e.promises.downloadComplete = new Promise(t=>{
            e.promises.__completePromiseResolver = t
          }
          )
        }
        )
      }
      _addMethodsToImageElement() {
        this._images.forEach(e=>{
          e.forceLazyLoad = ()=>{
            this._imageIsInLoadRange(e)
          }
        }
        )
      }
      _imageIsInLoadRange(e) {
        this._downloadImage(e).then(()=>{
          e.promises.__completePromiseResolver(e),
          e.dispatchEvent(new Event(o.EVENTS.DOWNLOAD_COMPLETE))
        }
        )
      }
      _cleanUpImageAttributes(e) {
        e.removeAttribute(o.DATA_DOWNLOADING_ATTRIBUTE),
        e.removeAttribute(o.DATA_DOWNLOAD_COMPLETE_ATTRIBUTE)
      }
      _downloadingImageAttributes(e) {
        super._downloadingImageAttributes(e),
        e.setAttribute(o.DATA_DOWNLOADING_ATTRIBUTE, "")
      }
      _finishedDownloadAttributes(e) {
        e.removeAttribute(o.DATA_DOWNLOADING_ATTRIBUTE),
        e.setAttribute(o.DATA_DOWNLOAD_COMPLETE_ATTRIBUTE, "")
      }
      _downloadImage(e) {
        return new Promise((t,i)=>{
          null === e.getAttribute(o.DATA_DOWNLOAD_COMPLETE_ATTRIBUTE) ? null === e.getAttribute(o.DATA_DOWNLOADING_ATTRIBUTE) && this._waitForBackgroundVisible(e).then(e=>this._getBackgroundImageSrc(e)).then(e=>this._loadImage(e)).then(()=>{
            r(()=>{
              this._finishedDownloadAttributes(e),
              t()
            }
            , !0)
          }
          ) : t()
        }
        )
      }
      _waitForBackgroundVisible(e) {
        return new Promise((t,i)=>{
          r(()=>{
            this._downloadingImageAttributes(e),
            t(e)
          }
          , !0)
        }
        )
      }
      _getBackgroundImageSrc(e) {
        return new Promise((t,i)=>{
          a(()=>{
            let i = e.currentStyle;
            i || (i = window.getComputedStyle(e, !1)),
            0 !== i.backgroundImage.indexOf("url(") ? t(null) : t(i.backgroundImage.slice(4, -1).replace(/"/g, ""))
          }
          , !0)
        }
        )
      }
      _loadImage(e) {
        return new Promise(this._loadImagePromiseFunc.bind(this, e))
      }
      _loadImagePromiseFunc(e, t, i) {
        if (!e)
          return void t(null);
        let s = new Image(1,1);
        s.addEventListener("load", (function e(i) {
          s.removeEventListener("load", e),
          t(this)
        }
        )),
        s.src = e,
        this.arrayImg.push(s)
      }
    }
    o.DATA_DOWNLOAD_COMPLETE_ATTRIBUTE = "data-anim-lazy-image-download-complete",
    o.DATA_DOWNLOADING_ATTRIBUTE = "data-anim-lazy-image-downloading",
    o.EVENTS = {},
    o.EVENTS.DOWNLOAD_COMPLETE = "video-loading-complete",
    t.exports = o
  }
  , {
    151: 151,
    39: 39,
    43: 43,
    49: 49
  }],
  51: [function(e, t, i) {
    "use strict";
    t.exports = {
      version: "3.4.0",
      major: "3.x",
      majorMinor: "3.4"
    }
  }
  , {}],
  52: [function(e, t, i) {
    "use strict";
    const s = e(25).EventEmitterMicro
      , n = e(59)
      , r = e(54)
      , a = e(55)
      , o = e(57)
      , h = e(74)
      , l = e(75)
      , c = e(76)
      , d = e(51)
      , u = {};
    "undefined" != typeof window && (u.update = e(43),
    u.cancelUpdate = e(38),
    u.external = e(40),
    u.draw = e(39));
    let m = null;
    class p extends s {
      constructor() {
        if (super(),
        m)
          throw "You cannot create multiple AnimSystems. You probably want to create multiple groups instead. You can have unlimited groups on a page";
        m = this,
        this.groups = [],
        this.scrollSystems = [],
        this.timeSystems = [],
        this.tweenGroup = null,
        this._forceUpdateRAFId = -1,
        this.initialized = !1,
        this.model = n,
        this.version = d.version,
        this._resolveReady = ()=>{}
        ,
        this.ready = new Promise(e=>this._resolveReady = e),
        this.onScroll = this.onScroll.bind(this),
        this.onResizedDebounced = this.onResizedDebounced.bind(this),
        this.onResizeImmediate = this.onResizeImmediate.bind(this)
      }
      initialize() {
        return this.initialized || "undefined" == typeof window || (this.initialized = !0,
        this.timeSystems = [],
        this.scrollSystems = [],
        this.groups = [],
        this.setupEvents(),
        this.initializeResizeFilter(),
        this.initializeModel(),
        this.createDOMGroups(),
        this.createDOMKeyframes(),
        this.tweenGroup = new c(null,this),
        this.groups.push(this.tweenGroup),
        this._resolveReady()),
        this.ready
      }
      remove() {
        return this.initialized ? Promise.all(this.groups.map(e=>e.remove())).then(()=>{
          this.groups = null,
          this.scrollSystems = null,
          this.timeSystems = null,
          window.clearTimeout(n.RESIZE_TIMEOUT),
          window.removeEventListener("scroll", this.onScroll),
          window.removeEventListener("resize", this.onResizeImmediate),
          this._events = {},
          this.initialized = !1,
          this.ready = new Promise(e=>this._resolveReady = e)
        }
        ) : (this.ready = new Promise(e=>this._resolveReady = e),
        Promise.resolve())
      }
      destroy() {
        return this.remove()
      }
      createTimeGroup(e) {
        let t = new l(e,this);
        return this.groups.push(t),
        this.timeSystems.push(t),
        this.trigger(n.EVENTS.ON_GROUP_CREATED, t),
        t
      }
      createScrollGroup(e) {
        if (!e)
          throw "AnimSystem scroll based groups must supply an HTMLElement";
        let t = new h(e,this);
        return this.groups.push(t),
        this.scrollSystems.push(t),
        this.trigger(n.EVENTS.ON_GROUP_CREATED, t),
        t
      }
      removeGroup(e) {
        return Promise.all(e.keyframeControllers.map(t=>e.removeKeyframeController(t))).then(()=>{
          let t = this.groups.indexOf(e);
          -1 !== t && this.groups.splice(t, 1),
          t = this.scrollSystems.indexOf(e),
          -1 !== t && this.scrollSystems.splice(t, 1),
          t = this.timeSystems.indexOf(e),
          -1 !== t && this.timeSystems.splice(t, 1),
          e.destroy()
        }
        )
      }
      createDOMGroups() {
        document.body.setAttribute("data-anim-scroll-group", "body"),
        document.querySelectorAll("[data-anim-scroll-group]").forEach(e=>this.createScrollGroup(e)),
        document.querySelectorAll("[data-anim-time-group]").forEach(e=>this.createTimeGroup(e)),
        this.trigger(n.EVENTS.ON_DOM_GROUPS_CREATED, this.groups)
      }
      createDOMKeyframes() {
        let e = [];
        ["data-anim-keyframe", r.DATA_ATTRIBUTE, a.DATA_ATTRIBUTE, o.DATA_ATTRIBUTE].forEach((function(t) {
          for (let i = 0; i < 12; i++)
            e.push(t + (0 === i ? "" : "-" + (i - 1)))
        }
        ));
        for (let t = 0; t < e.length; t++) {
          let i = e[t]
            , s = document.querySelectorAll("[" + i + "]");
          for (let e = 0; e < s.length; e++) {
            const t = s[e]
              , n = JSON.parse(t.getAttribute(i));
            this.addKeyframe(t, n)
          }
        }
        u.update(()=>{
          null !== this.groups && (this.groups.forEach(e=>e.onKeyframesDirty({
            silent: !0
          })),
          this.groups.forEach(e=>e.trigger(n.EVENTS.ON_DOM_KEYFRAMES_CREATED, e)),
          this.trigger(n.EVENTS.ON_DOM_KEYFRAMES_CREATED, this),
          this.groups.forEach(e=>{
            e.forceUpdate({
              waitForNextUpdate: !1,
              silent: !0
            }),
            e.reconcile()
          }
          ),
          this.onScroll())
        }
        , !0)
      }
      initializeResizeFilter() {
        if (n.cssDimensionsTracker)
          return;
        const e = document.querySelector(".cssDimensionsTracker") || document.createElement("div");
        e.setAttribute("cssDimensionsTracker", "true"),
        e.style.position = "fixed",
        e.style.top = "0",
        e.style.width = "100%",
        e.style.height = "100vh",
        e.style.pointerEvents = "none",
        e.style.visibility = "hidden",
        e.style.zIndex = "-1",
        document.documentElement.appendChild(e),
        n.cssDimensionsTracker = e
      }
      initializeModel() {
        n.pageMetrics.windowHeight = n.cssDimensionsTracker.clientHeight,
        n.pageMetrics.windowWidth = n.cssDimensionsTracker.clientWidth,
        n.pageMetrics.scrollY = window.scrollY || window.pageYOffset,
        n.pageMetrics.scrollX = window.scrollX || window.pageXOffset,
        n.pageMetrics.breakpoint = n.getBreakpoint();
        let e = document.documentElement.getBoundingClientRect();
        n.pageMetrics.documentOffsetX = e.left + n.pageMetrics.scrollX,
        n.pageMetrics.documentOffsetY = e.top + n.pageMetrics.scrollY
      }
      setupEvents() {
        window.removeEventListener("scroll", this.onScroll),
        window.addEventListener("scroll", this.onScroll),
        window.removeEventListener("resize", this.onResizeImmediate),
        window.addEventListener("resize", this.onResizeImmediate)
      }
      onScroll() {
        n.pageMetrics.scrollY = window.scrollY || window.pageYOffset,
        n.pageMetrics.scrollX = window.scrollX || window.pageXOffset;
        for (let e = 0, t = this.scrollSystems.length; e < t; e++)
          this.scrollSystems[e].updateTimeline();
        this.trigger(n.PageEvents.ON_SCROLL, n.pageMetrics)
      }
      onResizeImmediate() {
        let e = n.cssDimensionsTracker.clientWidth
          , t = n.cssDimensionsTracker.clientHeight;
        if (e === n.pageMetrics.windowWidth && t === n.pageMetrics.windowHeight)
          return;
        n.pageMetrics.windowWidth = e,
        n.pageMetrics.windowHeight = t,
        n.pageMetrics.scrollY = window.scrollY || window.pageYOffset,
        n.pageMetrics.scrollX = window.scrollX || window.pageXOffset;
        let i = document.documentElement.getBoundingClientRect();
        n.pageMetrics.documentOffsetX = i.left + n.pageMetrics.scrollX,
        n.pageMetrics.documentOffsetY = i.top + n.pageMetrics.scrollY,
        window.clearTimeout(n.RESIZE_TIMEOUT),
        n.RESIZE_TIMEOUT = window.setTimeout(this.onResizedDebounced, 250),
        this.trigger(n.PageEvents.ON_RESIZE_IMMEDIATE, n.pageMetrics)
      }
      onResizedDebounced() {
        u.update(()=>{
          let e = n.pageMetrics.breakpoint
            , t = n.getBreakpoint();
          if (t !== e) {
            n.pageMetrics.previousBreakpoint = e,
            n.pageMetrics.breakpoint = t;
            for (let e = 0, t = this.groups.length; e < t; e++)
              this.groups[e]._onBreakpointChange();
            this.trigger(n.PageEvents.ON_BREAKPOINT_CHANGE, n.pageMetrics)
          }
          for (let e = 0, t = this.groups.length; e < t; e++)
            this.groups[e].forceUpdate({
              waitForNextUpdate: !1
            });
          this.trigger(n.PageEvents.ON_RESIZE_DEBOUNCED, n.pageMetrics)
        }
        , !0)
      }
      forceUpdate({waitForNextUpdate: e=!0, silent: t=!1}={}) {
        -1 !== this._forceUpdateRAFId && u.cancelUpdate(this._forceUpdateRAFId);
        let i = ()=>{
          for (let e = 0, i = this.groups.length; e < i; e++) {
            this.groups[e].forceUpdate({
              waitForNextUpdate: !1,
              silent: t
            })
          }
          return -1
        }
        ;
        this._forceUpdateRAFId = e ? u.update(i, !0) : i()
      }
      addKeyframe(e, t) {
        let i = this.getGroupForTarget(e);
        return i = i || this.getGroupForTarget(document.body),
        i.addKeyframe(e, t)
      }
      addEvent(e, t) {
        let i = this.getGroupForTarget(e);
        return i = i || this.getGroupForTarget(document.body),
        i.addEvent(e, t)
      }
      getTimeGroupForTarget(e) {
        return this._getGroupForTarget(e, e=>e instanceof l)
      }
      getScrollGroupForTarget(e) {
        return this._getGroupForTarget(e, e=>!(e instanceof l))
      }
      getGroupForTarget(e) {
        return this._getGroupForTarget(e, ()=>!0)
      }
      _getGroupForTarget(e, t) {
        if (e._animInfo && e._animInfo.group && t(e._animInfo.group))
          return e._animInfo.group;
        let i = e;
        for (; i; ) {
          if (i._animInfo && i._animInfo.isGroup && t(i._animInfo.group))
            return i._animInfo.group;
          i = i.parentElement
        }
      }
      getControllerForTarget(e) {
        return e._animInfo && e._animInfo.controller ? e._animInfo.controller : null
      }
      addTween(e, t) {
        return this.tweenGroup.addKeyframe(e, t)
      }
    }
    t.exports = "undefined" == typeof window ? new p : window.AC.SharedInstance.share("AnimSystem", d.major, p),
    t.exports.default = t.exports
  }
  , {
    25: 25,
    38: 38,
    39: 39,
    40: 40,
    43: 43,
    51: 51,
    54: 54,
    55: 55,
    57: 57,
    59: 59,
    74: 74,
    75: 75,
    76: 76
  }],
  53: [function(e, t, i) {
    "use strict";
    const s = e(59);
    class n {
      constructor(e, t) {
        this._index = 0,
        this.keyframe = e,
        t && (this.name = t)
      }
      get start() {
        return this.keyframe.jsonProps.start
      }
      set index(e) {
        this._index = e
      }
      get index() {
        return this._index
      }
    }
    t.exports = class {
      constructor(e) {
        this.timeGroup = e,
        this.chapters = [],
        this.chapterNames = {},
        this.currentChapter = null,
        this.clip = null
      }
      addChapter(e) {
        const {position: t, name: i} = e;
        if (void 0 === t)
          throw ReferenceError("Cannot add chapter without target position.");
        e._impIsFirst || 0 !== this.chapters.length || this.addChapter({
          position: 0,
          _impIsFirst: !0
        });
        let s = this.timeGroup.addKeyframe(this, {
          start: t,
          end: t,
          event: "Chapter"
        });
        this.timeGroup.forceUpdate({
          waitForNextFrame: !1,
          silent: !0
        });
        const r = new n(s,i);
        if (this.chapters.push(r),
        i) {
          if (this.chapterNames.hasOwnProperty(i))
            throw ReferenceError('Duplicate chapter name assigned - "'.concat(i, '" is already in use'));
          this.chapterNames[i] = r
        }
        return this.chapters.sort((e,t)=>e.start - t.start).forEach((e,t)=>e.index = t),
        this.currentChapter = this.currentChapter || this.chapters[0],
        r
      }
      playToChapter(e) {
        let t;
        if (e.hasOwnProperty("index"))
          t = this.chapters[e.index];
        else {
          if (!e.hasOwnProperty("name"))
            throw ReferenceError("Cannot play to chapter without target index or name");
          t = this.chapterNames[e.name]
        }
        if (!t || this.currentChapter === t && !0 !== e.force)
          return;
        let i = e.ease || "easeInOutCubic";
        this.clip && (this.clip.destroy(),
        i = "easeOutQuint"),
        this.timeGroup.timeScale(e.timeScale || 1);
        const n = void 0 !== e.duration ? e.duration : this.getDurationToChapter(t)
          , r = this.timeGroup.time()
          , a = t.start;
        let o = !1;
        this.tween = this.timeGroup.anim.addTween({
          time: r
        }, {
          easeFunction: i,
          duration: n,
          time: [r, a],
          onStart: ()=>this.timeGroup.trigger(s.EVENTS.ON_CHAPTER_INITIATED, {
            player: this,
            next: t
          }),
          onDraw: e=>{
            let i = e.tweenProps.time.current;
            this.timeGroup.time(i),
            e.keyframe.curvedT > .5 && !o && (o = !0,
            this.currentIndex = t.index,
            this.currentChapter = t,
            this.timeGroup.trigger(s.EVENTS.ON_CHAPTER_OCCURRED, {
              player: this,
              current: t
            }))
          }
          ,
          onComplete: ()=>{
            this.timeGroup.trigger(s.EVENTS.ON_CHAPTER_COMPLETED, {
              player: this,
              current: t
            }),
            this.timeGroup.paused(!0),
            this.clip = null
          }
        })
      }
      getDurationToChapter(e) {
        const t = this.chapters[e.index - 1] || this.chapters[e.index + 1];
        return Math.abs(t.start - e.start)
      }
    }
  }
  , {
    59: 59
  }],
  54: [function(e, t, i) {
    "use strict";
    const s = e(59)
      , n = e(67)
      , r = e(60)
      , a = e(146)
      , o = e(61)
      , h = e(70)
      , l = e(66)
      , c = e(77)
      , d = e(78)
      , u = e(69);
    class m {
      constructor(e, t) {
        this.controller = e,
        this.anchors = [],
        this.jsonProps = t,
        this.ease = e.group.defaultEase,
        this.easeFunction = o.linear,
        this.start = 0,
        this.end = 0,
        this.localT = 0,
        this.curvedT = 0,
        this.id = 0,
        this.event = "",
        this.needsEventDispatch = !1,
        this.snapAtCreation = !1,
        this.isEnabled = !1,
        this.animValues = {},
        this.breakpointMask = "SMLX",
        this.disabledWhen = [],
        this.keyframeType = s.KeyframeTypes.Interpolation,
        this.hold = !1,
        this.preserveState = !1,
        this.markedForRemoval = !1;
        let i = !1;
        Object.defineProperty(this, "hidden", {
          get: ()=>i,
          set(t) {
            i = t,
            e.group.keyframesDirty = !0
          }
        }),
        this.uuid = u(),
        this.destroyed = !1
      }
      destroy() {
        this.destroyed = !0,
        this.controller = null,
        this.disabledWhen = null,
        this.anchors = null,
        this.jsonProps = null,
        this.easeFunction = null,
        this.animValues = null
      }
      remove() {
        return this.controller.removeKeyframe(this)
      }
      parseOptions(e) {
        this.jsonProps = e,
        e.relativeTo && console.error("KeyframeError: relativeTo has been removed. Use 'anchors' property instead. Found 'relativeTo':\"".concat(e.relativeTo, '"')),
        void 0 === e.end && void 0 === e.duration && (e.end = e.start),
        "" !== e.anchors && e.anchors ? (this.anchors = [],
        e.anchors = Array.isArray(e.anchors) ? e.anchors : [e.anchors],
        e.anchors.forEach((t,i)=>{
          let s = d(t, this.controller.group.element);
          if (!s) {
            let s = "";
            return "string" == typeof t && (s = " Provided value was a string, so a failed attempt was made to find anchor with the provided querystring in group.element, or in the document."),
            void console.warn("Keyframe on", this.controller.element, " failed to find anchor at index ".concat(i, " in array"), e.anchors, ". Anchors must be JS Object references, Elements references, or valid query selector strings. ".concat(s))
          }
          this.anchors.push(s),
          this.controller.group.metrics.add(s)
        }
        )) : (this.anchors = [],
        e.anchors = []),
        e.ease ? this.ease = parseFloat(e.ease) : e.ease = this.ease,
        e.hasOwnProperty("snapAtCreation") ? this.snapAtCreation = e.snapAtCreation : e.snapAtCreation = this.snapAtCreation,
        e.easeFunction || (e.easeFunction = s.KeyframeDefaults.easeFunctionString),
        e.breakpointMask ? this.breakpointMask = e.breakpointMask : e.breakpointMask = this.breakpointMask,
        e.disabledWhen ? this.disabledWhen = Array.isArray(e.disabledWhen) ? e.disabledWhen : [e.disabledWhen] : e.disabledWhen = this.disabledWhen,
        e.hasOwnProperty("hold") ? this.hold = e.hold : e.hold = this.hold,
        e.hasOwnProperty("preserveState") ? this.preserveState = e.preserveState : e.preserveState = s.KeyframeDefaults.preserveState,
        this.easeFunction = o[e.easeFunction],
        o.hasOwnProperty(e.easeFunction) || (e.easeFunction.includes("bezier") ? this.easeFunction = h.fromCSSString(e.easeFunction) : e.easeFunction.includes("spring") ? this.easeFunction = l.fromCSSString(e.easeFunction) : console.error("Keyframe parseOptions cannot find 'easeFunction' named '" + e.easeFunction + "'"));
        for (let t in e) {
          if (-1 !== s.KeyframeJSONReservedWords.indexOf(t))
            continue;
          let i = e[t];
          if (!Array.isArray(i))
            continue;
          if (1 === i.length && (i[0] = null,
          i[1] = i[0]),
          this.animValues[t] = this.controller.group.expressionParser.parseArray(this, i),
          void 0 === this.controller.tweenProps[t] || !this.controller._ownerIsElement) {
            let a = 0;
            this.controller._ownerIsElement || (a = this.controller.element[t] || 0);
            let o = null;
            if (this.controller._ownerIsElement && t.startsWith("--")) {
              const n = i[2];
              o = new r(a,s.KeyframeDefaults.epsilon,this.snapAtCreation,t,e.round,n),
              this.controller.cssAttributes.push(o)
            } else
              o = new n(a,s.KeyframeDefaults.epsilon,this.snapAtCreation);
            this.controller.tweenProps[t] = o
          }
          let a = this.controller.tweenProps[t];
          if (e.epsilon)
            a.epsilon = e.epsilon;
          else {
            let e = Math.abs(this.animValues[t][0] - this.animValues[t][1])
              , i = Math.min(.001 * e, a.epsilon, s.KeyframeDefaults.epsilon);
            a.epsilon = Math.max(i, 1e-4)
          }
        }
        this.keyframeType = this.hold ? s.KeyframeTypes.InterpolationForward : s.KeyframeTypes.Interpolation,
        e.event && (this.event = e.event)
      }
      overwriteProps(e) {
        this.animValues = {};
        let t = Object.assign({}, this.jsonProps, e);
        this.controller.updateKeyframe(this, t)
      }
      updateLocalProgress(e) {
        if (this.start === this.end || e < this.start || e > this.end)
          return this.localT = e < this.start ? this.hold ? this.localT : 0 : e > this.end ? 1 : 0,
          void (this.curvedT = this.easeFunction(this.localT));
        const t = (e - this.start) / (this.end - this.start)
          , i = this.hold ? this.localT : 0;
        this.localT = a.clamp(t, i, 1),
        this.curvedT = this.easeFunction(this.localT)
      }
      reconcile(e) {
        let t = this.animValues[e]
          , i = this.controller.tweenProps[e];
        i.initialValue = t[0],
        i.target = t[0] + this.curvedT * (t[1] - t[0]),
        i.current !== i.target && (i.current = i.target,
        this.needsEventDispatch || (this.needsEventDispatch = !0,
        this.controller.keyframesRequiringDispatch.push(this)))
      }
      reset(e) {
        this.localT = e || 0;
        var t = this.ease;
        this.ease = 1;
        for (let e in this.animValues)
          this.reconcile(e);
        this.ease = t
      }
      onDOMRead(e) {
        let t = this.animValues[e]
          , i = this.controller.tweenProps[e];
        i.target = t[0] + this.curvedT * (t[1] - t[0]);
        let s = i.current;
        i.current += (i.target - i.current) * this.ease;
        let n = i.current - i.target;
        n < i.epsilon && n > -i.epsilon && (i.current = i.target,
        n = 0),
        "" === this.event || this.needsEventDispatch || (n > i.epsilon || n < -i.epsilon || 0 === n && s !== i.current) && (this.needsEventDispatch = !0,
        this.controller.keyframesRequiringDispatch.push(this))
      }
      isInRange(e) {
        return e >= this.start && e <= this.end
      }
      setEnabled(e) {
        e = e || c(Array.from(document.documentElement.classList));
        let t = -1 !== this.breakpointMask.indexOf(s.pageMetrics.breakpoint)
          , i = !1;
        return this.disabledWhen.length > 0 && (i = this.disabledWhen.some(t=>void 0 !== e[t])),
        this.isEnabled = t && !i,
        this.isEnabled
      }
      evaluateConstraints() {
        this.start = this.controller.group.expressionParser.parseTimeValue(this, this.jsonProps.start),
        this.end = this.controller.group.expressionParser.parseTimeValue(this, this.jsonProps.end),
        this.evaluateInterpolationConstraints()
      }
      evaluateInterpolationConstraints() {
        for (let e in this.animValues) {
          let t = this.jsonProps[e];
          this.animValues[e] = this.controller.group.expressionParser.parseArray(this, t)
        }
      }
    }
    m.DATA_ATTRIBUTE = "data-anim-tween",
    t.exports = m
  }
  , {
    146: 146,
    59: 59,
    60: 60,
    61: 61,
    66: 66,
    67: 67,
    69: 69,
    70: 70,
    77: 77,
    78: 78
  }],
  55: [function(e, t, i) {
    "use strict";
    const s = e(54)
      , n = e(59)
      , r = e(67);
    class a extends s {
      constructor(e, t) {
        super(e, t),
        this.keyframeType = n.KeyframeTypes.CSSClass,
        this._triggerType = a.TRIGGER_TYPE_CSS_CLASS,
        this.cssClass = "",
        this.friendlyName = "",
        this.style = {
          on: null,
          off: null
        },
        this.toggle = !1,
        this.isApplied = !1
      }
      parseOptions(e) {
        if (!this.controller._ownerIsElement)
          throw new TypeError("CSS Keyframes cannot be applied to JS Objects");
        if (e.x = void 0,
        e.y = void 0,
        e.z = void 0,
        e.scale = void 0,
        e.scaleX = void 0,
        e.scaleY = void 0,
        e.rotationX = void 0,
        e.rotationY = void 0,
        e.rotationZ = void 0,
        e.rotation = void 0,
        e.opacity = void 0,
        e.hold = void 0,
        void 0 !== e.toggle && (this.toggle = e.toggle),
        void 0 !== e.cssClass)
          this._triggerType = a.TRIGGER_TYPE_CSS_CLASS,
          this.cssClass = e.cssClass,
          this.friendlyName = "." + this.cssClass,
          void 0 === this.controller.tweenProps.targetClasses && (this.controller.tweenProps.targetClasses = {
            add: [],
            remove: []
          });
        else {
          if (void 0 === e.style || !this.isValidStyleProperty(e.style))
            throw new TypeError("KeyframeCSSClass no 'cssClass` property found. If using `style` property its also missing or invalid");
          if (this._triggerType = a.TRIGGER_TYPE_STYLE_PROPERTY,
          this.style = e.style,
          this.friendlyName = "style",
          this.toggle = void 0 !== this.style.off || this.toggle,
          this.toggle && void 0 === this.style.off) {
            this.style.off = {};
            for (let e in this.style.on)
              this.style.off[e] = ""
          }
          void 0 === this.controller.tweenProps.targetStyles && (this.controller.tweenProps.targetStyles = {})
        }
        if (void 0 === e.end && (e.end = e.start),
        e.toggle = this.toggle,
        this._triggerType === a.TRIGGER_TYPE_CSS_CLASS)
          this.isApplied = this.controller.element.classList.contains(this.cssClass);
        else {
          let e = getComputedStyle(this.controller.element);
          this.isApplied = !0;
          for (let t in this.style.on)
            if (e[t] !== this.style.on[t]) {
              this.isApplied = !1;
              break
            }
        }
        s.prototype.parseOptions.call(this, e),
        this.animValues[this.friendlyName] = [0, 0],
        void 0 === this.controller.tweenProps[this.friendlyName] && (this.controller.tweenProps[this.friendlyName] = new r(0,1,!1)),
        this.keyframeType = n.KeyframeTypes.CSSClass
      }
      updateLocalProgress(e) {
        this.isApplied && !this.toggle || (this.start !== this.end ? !this.isApplied && e >= this.start && e <= this.end ? this._apply() : this.isApplied && this.toggle && (e < this.start || e > this.end) && this._unapply() : !this.isApplied && e >= this.start ? this._apply() : this.isApplied && this.toggle && e < this.start && this._unapply())
      }
      _apply() {
        if (this._triggerType === a.TRIGGER_TYPE_CSS_CLASS)
          this.controller.tweenProps.targetClasses.add.push(this.cssClass),
          this.controller.needsClassUpdate = !0;
        else {
          for (let e in this.style.on)
            this.controller.tweenProps.targetStyles[e] = this.style.on[e];
          this.controller.needsStyleUpdate = !0
        }
        this.isApplied = !0
      }
      _unapply() {
        if (this._triggerType === a.TRIGGER_TYPE_CSS_CLASS)
          this.controller.tweenProps.targetClasses.remove.push(this.cssClass),
          this.controller.needsClassUpdate = !0;
        else {
          for (let e in this.style.off)
            this.controller.tweenProps.targetStyles[e] = this.style.off[e];
          this.controller.needsStyleUpdate = !0
        }
        this.isApplied = !1
      }
      isValidStyleProperty(e) {
        if (!e.hasOwnProperty("on"))
          return !1;
        if ("object" != typeof e.on)
          throw new TypeError("KeyframeCSSClass `style` property should be in the form of: {on:{visibility:'hidden', otherProperty: 'value'}}");
        if (this.toggle && e.hasOwnProperty("off") && "object" != typeof e.off)
          throw new TypeError("KeyframeCSSClass `style` property should be in the form of: {on:{visibility:'hidden', otherProperty: 'value'}}");
        return !0
      }
      reconcile(e) {}
      onDOMRead(e) {}
      evaluateInterpolationConstraints() {}
    }
    a.TRIGGER_TYPE_CSS_CLASS = 0,
    a.TRIGGER_TYPE_STYLE_PROPERTY = 1,
    a.DATA_ATTRIBUTE = "data-anim-classname",
    t.exports = a
  }
  , {
    54: 54,
    59: 59,
    67: 67
  }],
  56: [function(e, t, i) {
    "use strict";
    const s = e(59)
      , n = e(67)
      , r = e(60)
      , a = e(63)
      , o = e(58)
      , h = (e(54),
    e(55))
      , l = e(64)
      , c = e(77)
      , d = e(69)
      , u = e(25).EventEmitterMicro
      , m = e(82)
      , p = {};
    "undefined" != typeof window && (p.update = e(43),
    p.external = e(40),
    p.draw = e(39));
    const f = Math.PI / 180
      , y = ["x", "y", "z", "scale", "scaleX", "scaleY", "rotation", "rotationX", "rotationY", "rotationZ"]
      , g = ["borderRadius", "bottom", "fontSize", "fontWeight", "height", "left", "lineHeight", "marginBottom", "marginLeft", "marginRight", "marginTop", "maxHeight", "maxWidth", "opacity", "paddingBottom", "paddingLeft", "paddingRight", "paddingTop", "right", "top", "width", "zIndex", "strokeDashoffset"]
      , _ = ["currentTime", "scrollLeft", "scrollTop"]
      , v = {
      create: e(154),
      rotateX: e(155),
      rotateY: e(156),
      rotateZ: e(157),
      scale: e(158)
    };
    t.exports = class extends u {
      constructor(e, t) {
        super(),
        this._events.draw = [],
        this.uuid = d(),
        this.group = e,
        this.element = t,
        this._ownerIsElement = this.element instanceof Element,
        this._ownerIsElement ? this.friendlyName = this.element.tagName + "." + Array.from(this.element.classList).join(".") : this.friendlyName = this.element.friendlyName || this.uuid,
        this.element._animInfo = this.element._animInfo || new o(e,this),
        this.element._animInfo.controller = this,
        this.element._animInfo.group = this.group,
        this.element._animInfo.controllers.push(this),
        this.tweenProps = this.element._animInfo.tweenProps,
        this.eventObject = new a(this),
        this.needsStyleUpdate = !1,
        this.needsClassUpdate = !1,
        this.elementMetrics = this.group.metrics.add(this.element),
        this.attributes = [],
        this.cssAttributes = [],
        this.domAttributes = [],
        this.keyframes = {},
        this._allKeyframes = [],
        this._activeKeyframes = [],
        this.keyframesRequiringDispatch = [],
        this.updateCachedValuesFromElement(),
        this.boundsMin = 0,
        this.boundsMax = 0,
        this.mat2d = new Float32Array(6),
        this.mat4 = v.create(),
        this.needsWrite = !0,
        this.onDOMWriteImp = this._ownerIsElement ? this.onDOMWriteForElement : this.onDOMWriteForObject
      }
      destroy() {
        if (this.element._animInfo) {
          this.element._animInfo.controller === this && (this.element._animInfo.controller = null);
          let e = this.element._animInfo.controllers.indexOf(this);
          if (-1 !== e && this.element._animInfo.controllers.splice(e, 1),
          0 === this.element._animInfo.controllers.length)
            this.element._animInfo = null;
          else {
            let e = this.element._animInfo.controllers.find(e=>e.group !== e.group.anim.tweenGroup);
            e && (this.element._animInfo.controller = e,
            this.element._animInfo.group = e.group)
          }
        }
        this.eventObject.controller = null,
        this.eventObject.element = null,
        this.eventObject.keyframe = null,
        this.eventObject.tweenProps = null,
        this.eventObject = null,
        this.elementMetrics = null,
        this.group = null,
        this.keyframesRequiringDispatch = null;
        for (let e = 0; e < this._allKeyframes.length; e++)
          this._allKeyframes[e].destroy();
        this._allKeyframes = null,
        this._activeKeyframes = null,
        this.attributes = null,
        this.keyframes = null,
        this.element = null,
        this.tweenProps = null,
        this.destroyed = !0,
        super.destroy()
      }
      remove() {
        return this.group.removeKeyframeController(this)
      }
      updateCachedValuesFromElement() {
        if (!this._ownerIsElement)
          return;
        const e = getComputedStyle(this.element);
        let t = new DOMMatrix(e.getPropertyValue("transform"))
          , i = m(t)
          , a = s.KeyframeDefaults.epsilon;
        ["x", "y", "z"].forEach((e,t)=>{
          this.tweenProps[e] = new n(i.translation[t],a,!1)
        }
        ),
        this.tweenProps.rotation = new n(i.rotation[2],a,!1),
        ["rotationX", "rotationY", "rotationZ"].forEach((e,t)=>{
          this.tweenProps[e] = new n(i.rotation[t],a,!1)
        }
        ),
        this.tweenProps.scale = new n(i.scale[0],a,!1),
        ["scaleX", "scaleY", "scaleZ"].forEach((e,t)=>{
          this.tweenProps[e] = new n(i.scale[t],a,!1)
        }
        ),
        g.forEach(t=>{
          let i = ["zIndex"].includes(t)
            , s = ["opacity", "zIndex", "fontWeight"].includes(t) ? void 0 : "px"
            , n = parseFloat(e[t]);
          isNaN(n) && (n = 0),
          this.tweenProps[t] = new r(n,a,!1,t,i,s)
        }
        ),
        _.forEach(e=>{
          let t = isNaN(this.element[e]) ? 0 : this.element[e];
          this.tweenProps[e] = new r(t,a,!1,e,!1)
        }
        )
      }
      addKeyframe(e) {
        let t = l(e);
        if (!t)
          throw new Error("AnimSystem Cannot create keyframe for from options `" + e + "`");
        let i = new t(this,e);
        return i.parseOptions(e),
        i.id = this._allKeyframes.length,
        this._allKeyframes.push(i),
        i
      }
      needsUpdate() {
        for (let e = 0, t = this.attributes.length; e < t; e++) {
          let t = this.attributes[e]
            , i = this.tweenProps[t];
          if (Math.abs(i.current - i.target) > i.epsilon)
            return !0
        }
        return !1
      }
      updateLocalProgress(e) {
        for (let t = 0, i = this.attributes.length; t < i; t++) {
          let i = this.attributes[t]
            , s = this.keyframes[this.attributes[t]];
          if (1 === s.length) {
            s[0].updateLocalProgress(e);
            continue
          }
          let n = this.getNearestKeyframeForAttribute(i, e);
          n && n.updateLocalProgress(e)
        }
      }
      reconcile() {
        for (let e = 0, t = this.attributes.length; e < t; e++) {
          let t = this.attributes[e]
            , i = this.getNearestKeyframeForAttribute(t, this.group.position.local);
          i.updateLocalProgress(this.group.position.local),
          i.snapAtCreation && i.reconcile(t)
        }
      }
      determineActiveKeyframes(e) {
        e = e || c(Array.from(document.documentElement.classList));
        let t = this._activeKeyframes
          , i = this.attributes
          , s = {};
        this._activeKeyframes = [],
        this.attributes = [],
        this.keyframes = {};
        for (let t = 0; t < this._allKeyframes.length; t++) {
          let i = this._allKeyframes[t];
          if (i.markedForRemoval || i.hidden || !i.setEnabled(e))
            for (let e in i.animValues)
              this.tweenProps[e].isActive = i.preserveState,
              i.preserveState && (s[e] = !0);
          else {
            this._activeKeyframes.push(i);
            for (let e in i.animValues)
              this.keyframes[e] = this.keyframes[e] || [],
              this.keyframes[e].push(i),
              -1 === this.attributes.indexOf(e) && (s[e] = !0,
              this.attributes.push(e),
              this.tweenProps[e].isActive = !0)
          }
        }
        this.attributes.forEach(e=>this.tweenProps[e].isActive = !0),
        this.cssAttributes = this.attributes.filter(e=>g.includes(e) || e.startsWith("--")).map(e=>this.tweenProps[e]),
        this.domAttributes = this.attributes.filter(e=>_.includes(e)).map(e=>this.tweenProps[e]);
        let n = t.filter(e=>-1 === this._activeKeyframes.indexOf(e));
        if (0 === n.length)
          return;
        let r = i.filter(e=>-1 === this.attributes.indexOf(e) && !s.hasOwnProperty(e));
        if (0 !== r.length)
          if (this.needsWrite = !0,
          this._ownerIsElement)
            p.external(()=>{
              let e = r.some(e=>y.includes(e))
                , t = e && Object.keys(s).some(e=>y.includes(e));
              e && !t && this.element.style.removeProperty("transform");
              for (let e = 0, t = r.length; e < t; ++e) {
                let t = r[e]
                  , i = this.tweenProps[t]
                  , s = i.isActive ? i.target : i.initialValue;
                i.current = i.target = s,
                !i.isActive && g.includes(t) && (this.element.style[t] = null)
              }
              for (let e = 0, t = n.length; e < t; ++e) {
                let t = n[e];
                t instanceof h && !t.preserveState && t._unapply()
              }
            }
            , !0);
          else
            for (let e = 0, t = r.length; e < t; ++e) {
              let t = this.tweenProps[r[e]];
              t.current = t.target,
              t.isActive = !1
            }
      }
      onDOMRead(e) {
        for (let t = 0, i = this.attributes.length; t < i; t++) {
          let i = this.attributes[t];
          this.tweenProps[i].previousValue = this.tweenProps[i].current;
          let s = this.getNearestKeyframeForAttribute(i, e);
          s && s.onDOMRead(i),
          this.tweenProps[i].previousValue !== this.tweenProps[i].current && (this.needsWrite = !0)
        }
      }
      onDOMWrite() {
        (this.needsWrite || this.needsClassUpdate || this.needsStyleUpdate) && (this.needsWrite = !1,
        this.onDOMWriteImp(),
        this.handleEventDispatch())
      }
      onDOMWriteForObject() {
        for (let e = 0, t = this.attributes.length; e < t; e++) {
          let t = this.attributes[e];
          this.element[t] = this.tweenProps[t].current
        }
      }
      onDOMWriteForElement(e=this.element.style) {
        this.handleStyleTransform(e);
        for (let t = 0, i = this.cssAttributes.length; t < i; t++)
          this.cssAttributes[t].set(e);
        for (let e = 0, t = this.domAttributes.length; e < t; e++)
          this.domAttributes[e].set(this.element);
        if (this.needsStyleUpdate) {
          for (let e in this.tweenProps.targetStyles)
            null !== this.tweenProps.targetStyles[e] && (this.element.style[e] = this.tweenProps.targetStyles[e]),
            this.tweenProps.targetStyles[e] = null;
          this.needsStyleUpdate = !1
        }
        this.needsClassUpdate && (this.tweenProps.targetClasses.add.length > 0 && this.element.classList.add.apply(this.element.classList, this.tweenProps.targetClasses.add),
        this.tweenProps.targetClasses.remove.length > 0 && this.element.classList.remove.apply(this.element.classList, this.tweenProps.targetClasses.remove),
        this.tweenProps.targetClasses.add.length = 0,
        this.tweenProps.targetClasses.remove.length = 0,
        this.needsClassUpdate = !1)
      }
      handleStyleTransform(e=this.element.style) {
        let t = this.tweenProps;
        if (t.z.isActive || t.rotationX.isActive || t.rotationY.isActive) {
          const i = this.mat4;
          i[0] = 1,
          i[1] = 0,
          i[2] = 0,
          i[3] = 0,
          i[4] = 0,
          i[5] = 1,
          i[6] = 0,
          i[7] = 0,
          i[8] = 0,
          i[9] = 0,
          i[10] = 1,
          i[11] = 0,
          i[12] = 0,
          i[13] = 0,
          i[14] = 0,
          i[15] = 1;
          const s = t.x.current
            , n = t.y.current
            , r = t.z.current;
          if (i[12] = i[0] * s + i[4] * n + i[8] * r + i[12],
          i[13] = i[1] * s + i[5] * n + i[9] * r + i[13],
          i[14] = i[2] * s + i[6] * n + i[10] * r + i[14],
          i[15] = i[3] * s + i[7] * n + i[11] * r + i[15],
          0 !== t.rotation.current || 0 !== t.rotationZ.current) {
            const e = (t.rotation.current || t.rotationZ.current) * f;
            v.rotateZ(i, i, e)
          }
          if (0 !== t.rotationX.current) {
            const e = t.rotationX.current * f;
            v.rotateX(i, i, e)
          }
          if (0 !== t.rotationY.current) {
            const e = t.rotationY.current * f;
            v.rotateY(i, i, e)
          }
          1 === t.scale.current && 1 === t.scaleX.current && 1 === t.scaleY.current || v.scale(i, i, [t.scale.current, t.scale.current, 1]),
          e.transform = "matrix3d(" + i[0] + "," + i[1] + "," + i[2] + "," + i[3] + "," + i[4] + "," + i[5] + "," + i[6] + "," + i[7] + "," + i[8] + "," + i[9] + "," + i[10] + "," + i[11] + "," + i[12] + "," + i[13] + "," + i[14] + "," + i[15] + ")"
        } else if (t.x.isActive || t.y.isActive || t.rotation.isActive || t.rotationZ.isActive || t.scale.isActive || t.scaleX.isActive || t.scaleY.isActive) {
          const i = this.mat2d;
          i[0] = 1,
          i[1] = 0,
          i[2] = 0,
          i[3] = 1,
          i[4] = 0,
          i[5] = 0;
          const s = t.x.current
            , n = t.y.current
            , r = i[0]
            , a = i[1]
            , o = i[2]
            , h = i[3]
            , l = i[4]
            , c = i[5];
          if (i[0] = r,
          i[1] = a,
          i[2] = o,
          i[3] = h,
          i[4] = r * s + o * n + l,
          i[5] = a * s + h * n + c,
          0 !== t.rotation.current || 0 !== t.rotationZ.current) {
            const e = (t.rotation.current || t.rotationZ.current) * f
              , s = i[0]
              , n = i[1]
              , r = i[2]
              , a = i[3]
              , o = i[4]
              , h = i[5]
              , l = Math.sin(e)
              , c = Math.cos(e);
            i[0] = s * c + r * l,
            i[1] = n * c + a * l,
            i[2] = s * -l + r * c,
            i[3] = n * -l + a * c,
            i[4] = o,
            i[5] = h
          }
          t.scaleX.isActive || t.scaleY.isActive ? (i[0] = i[0] * t.scaleX.current,
          i[1] = i[1] * t.scaleX.current,
          i[2] = i[2] * t.scaleY.current,
          i[3] = i[3] * t.scaleY.current) : (i[0] = i[0] * t.scale.current,
          i[1] = i[1] * t.scale.current,
          i[2] = i[2] * t.scale.current,
          i[3] = i[3] * t.scale.current),
          e.transform = "matrix(" + i[0] + ", " + i[1] + ", " + i[2] + ", " + i[3] + ", " + i[4] + ", " + i[5] + ")"
        }
      }
      handleEventDispatch() {
        if (0 !== this.keyframesRequiringDispatch.length) {
          for (let e = 0, t = this.keyframesRequiringDispatch.length; e < t; e++) {
            let t = this.keyframesRequiringDispatch[e];
            t.needsEventDispatch = !1,
            this.eventObject.keyframe = t,
            this.eventObject.pageMetrics = s.pageMetrics,
            this.eventObject.event = t.event,
            this.trigger(t.event, this.eventObject)
          }
          this.keyframesRequiringDispatch.length = 0
        }
        if (0 !== this._events.draw.length) {
          this.eventObject.keyframe = null,
          this.eventObject.event = "draw";
          for (var e = this._events.draw.length - 1; e >= 0; e--)
            this._events.draw[e](this.eventObject)
        }
      }
      updateAnimationConstraints() {
        for (let e = 0, t = this._activeKeyframes.length; e < t; e++)
          this._activeKeyframes[e].evaluateConstraints();
        this.attributes.forEach(e=>{
          1 !== this.keyframes[e].length && this.keyframes[e].sort(s.KeyframeComparison)
        }
        ),
        this.updateDeferredPropertyValues()
      }
      refreshMetrics() {
        let e = new Set([this.element]);
        this._allKeyframes.forEach(t=>t.anchors.forEach(t=>e.add(t))),
        this.group.metrics.refreshCollection(e),
        this.group.keyframesDirty = !0
      }
      updateDeferredPropertyValues() {
        for (let e = 0, t = this.attributes.length; e < t; e++) {
          let t = this.attributes[e]
            , i = this.keyframes[t];
          if (!(i[0].keyframeType > s.KeyframeTypes.InterpolationForward))
            for (let e = 0, s = i.length; e < s; e++) {
              let n = i[e];
              null === n.jsonProps[t][0] && (0 === e ? n.jsonProps[t][0] = n.animValues[t][0] = this.tweenProps[t].current : n.animValues[t][0] = i[e - 1].animValues[t][1]),
              null === n.jsonProps[t][1] && (n.animValues[t][1] = e === s - 1 ? this.tweenProps[t].current : i[e + 1].animValues[t][0]),
              n.snapAtCreation && (n.jsonProps[t][0] = n.animValues[t][0],
              n.jsonProps[t][1] = n.animValues[t][1])
            }
        }
      }
      getBounds(e) {
        this.boundsMin = Number.MAX_VALUE,
        this.boundsMax = -Number.MAX_VALUE;
        for (let t = 0, i = this.attributes.length; t < i; t++) {
          let i = this.keyframes[this.attributes[t]];
          for (let t = 0; t < i.length; t++) {
            let s = i[t];
            this.boundsMin = Math.min(s.start, this.boundsMin),
            this.boundsMax = Math.max(s.end, this.boundsMax),
            e.min = Math.min(s.start, e.min),
            e.max = Math.max(s.end, e.max)
          }
        }
      }
      getNearestKeyframeForAttribute(e, t) {
        t = void 0 !== t ? t : this.group.position.local;
        let i = null
          , s = Number.POSITIVE_INFINITY
          , n = this.keyframes[e];
        if (void 0 === n)
          return null;
        let r = n.length;
        if (0 === r)
          return null;
        if (1 === r)
          return n[0];
        for (let e = 0; e < r; e++) {
          let r = n[e];
          if (r.isInRange(t)) {
            i = r;
            break
          }
          let a = Math.min(Math.abs(t - r.start), Math.abs(t - r.end));
          a < s && (s = a,
          i = r)
        }
        return i
      }
      getAllKeyframesForAttribute(e) {
        return this.keyframes[e]
      }
      updateKeyframe(e, t) {
        e.parseOptions(t),
        e.evaluateConstraints(),
        this.group.keyframesDirty = !0,
        p.update(()=>{
          this.trigger(s.EVENTS.ON_KEYFRAME_UPDATED, e),
          this.group.trigger(s.EVENTS.ON_KEYFRAME_UPDATED, e)
        }
        , !0)
      }
      removeKeyframe(e) {
        return e.controller !== this ? Promise.resolve(null) : (e.markedForRemoval = !0,
        this.group.keyframesDirty = !0,
        new Promise(t=>{
          this.group.rafEmitter.executor.eventEmitter.once("before:draw", ()=>{
            t(e),
            e.destroy();
            let i = this._allKeyframes.indexOf(e);
            -1 !== i && this._allKeyframes.splice(i, 1)
          }
          )
        }
        ))
      }
      updateAnimation(e, t) {
        return this.group.gui && console.warn("KeyframeController.updateAnimation(keyframe,props) has been deprecated. Please use updateKeyframe(keyframe,props)"),
        this.updateKeyframe(e, t)
      }
    }
  }
  , {
    154: 154,
    155: 155,
    156: 156,
    157: 157,
    158: 158,
    25: 25,
    39: 39,
    40: 40,
    43: 43,
    54: 54,
    55: 55,
    58: 58,
    59: 59,
    60: 60,
    63: 63,
    64: 64,
    67: 67,
    69: 69,
    77: 77,
    82: 82
  }],
  57: [function(e, t, i) {
    "use strict";
    const s = e(54)
      , n = e(59)
      , r = e(67);
    class a extends s {
      constructor(e, t) {
        super(e, t),
        this.keyframeType = n.KeyframeTypes.Event,
        this.isApplied = !1,
        this.hasDuration = !1,
        this.isCurrentlyInRange = !1
      }
      parseOptions(e) {
        e.x = void 0,
        e.y = void 0,
        e.scale = void 0,
        e.scaleX = void 0,
        e.scaleY = void 0,
        e.rotation = void 0,
        e.style = void 0,
        e.cssClass = void 0,
        e.rotation = void 0,
        e.opacity = void 0,
        e.hold = void 0,
        this.event = e.event,
        this.animValues[this.event] = [0, 0],
        void 0 === this.controller.tweenProps[this.event] && (this.controller.tweenProps[this.event] = new r(0,1,!1)),
        super.parseOptions(e),
        this.keyframeType = n.KeyframeTypes.Event
      }
      updateLocalProgress(e) {
        if (this.hasDuration) {
          let t = this.isCurrentlyInRange
            , i = e >= this.start && e <= this.end;
          if (t === i)
            return;
          return this.isCurrentlyInRange = i,
          void (i && !t ? this._trigger(this.event + ":enter") : t && !i && this._trigger(this.event + ":exit"))
        }
        !this.isApplied && e >= this.start ? (this.isApplied = !0,
        this._trigger(this.event)) : this.isApplied && e < this.start && (this.isApplied = !1,
        this._trigger(this.event + ":reverse"))
      }
      _trigger(e) {
        this.controller.eventObject.event = e,
        this.controller.eventObject.keyframe = this,
        this.controller.trigger(e, this.controller.eventObject)
      }
      evaluateConstraints() {
        super.evaluateConstraints(),
        this.hasDuration = this.start !== this.end
      }
      reset(e) {
        this.isApplied = !1,
        this.isCurrentlyInRange = !1,
        super.reset(e)
      }
      onDOMRead(e) {}
      reconcile(e) {}
      evaluateInterpolationConstraints() {}
    }
    a.DATA_ATTRIBUTE = "data-anim-event",
    t.exports = a
  }
  , {
    54: 54,
    59: 59,
    67: 67
  }],
  58: [function(e, t, i) {
    "use strict";
    const s = e(68);
    t.exports = class {
      constructor(e, t, i=!1) {
        this.isGroup = i,
        this.group = e,
        this.controller = t,
        this.controllers = [],
        this.tweenProps = new s
      }
    }
  }
  , {
    68: 68
  }],
  59: [function(e, t, i) {
    "use strict";
    const s = {
      GUI_INSTANCE: null,
      ANIM_INSTANCE: null,
      VIEWPORT_EMITTER_ELEMENT: void 0,
      LOCAL_STORAGE_KEYS: {
        GuiPosition: "anim-ui.position",
        GroupCollapsedStates: "anim-ui.group-collapsed-states",
        scrollY: "anim-ui.scrollY-position",
        path: "anim-ui.path"
      },
      RESIZE_TIMEOUT: -1,
      BREAKPOINTS: [{
        name: "S",
        mediaQuery: "only screen and (max-width: 734px)"
      }, {
        name: "M",
        mediaQuery: "only screen and (max-width: 1068px)"
      }, {
        name: "L",
        mediaQuery: "only screen and (min-width: 1069px)"
      }],
      getBreakpoint: function() {
        for (let e = 0; e < s.BREAKPOINTS.length; e++) {
          let t = s.BREAKPOINTS[e];
          if (window.matchMedia(t.mediaQuery).matches)
            return t.name
        }
      },
      KeyframeDefaults: {
        ease: 1,
        epsilon: .05,
        preserveState: !1,
        easeFunctionString: "linear",
        easeFunction: "linear",
        hold: !1,
        snapAtCreation: !1,
        toggle: !1,
        breakpointMask: "SMLX",
        event: "",
        disabledWhen: [],
        cssClass: ""
      },
      KeyframeTypes: {
        Interpolation: 0,
        InterpolationForward: 1,
        CSSClass: 2,
        Event: 3
      },
      EVENTS: {
        ON_DOM_KEYFRAMES_CREATED: "ON_DOM_KEYFRAMES_CREATED",
        ON_DOM_GROUPS_CREATED: "ON_DOM_GROUPS_CREATED",
        ON_GROUP_CREATED: "ON_GROUP_CREATED",
        ON_KEYFRAME_UPDATED: "ON_KEYFRAME_UPDATED",
        ON_TIMELINE_START: "ON_TIMELINE_START",
        ON_TIMELINE_UPDATE: "ON_TIMELINE_UPDATE",
        ON_TIMELINE_COMPLETE: "ON_TIMELINE_COMPLETE",
        ON_CHAPTER_INITIATED: "ON_CHAPTER_INITIATED",
        ON_CHAPTER_OCCURRED: "ON_CHAPTER_OCCURRED",
        ON_CHAPTER_COMPLETED: "ON_CHAPTER_COMPLETED"
      },
      PageEvents: {
        ON_SCROLL: "ON_SCROLL",
        ON_RESIZE_IMMEDIATE: "ON_RESIZE_IMMEDIATE",
        ON_RESIZE_DEBOUNCED: "ON_RESIZE_DEBOUNCED",
        ON_BREAKPOINT_CHANGE: "ON_BREAKPOINT_CHANGE"
      },
      KeyframeJSONReservedWords: ["event", "cssClass", "style", "anchors", "start", "end", "epsilon", "easeFunction", "ease", "breakpointMask", "disabledWhen"],
      TweenProps: e(68),
      TargetValue: e(67),
      CSSTargetValue: e(60),
      pageMetrics: new function() {
        this.scrollX = 0,
        this.scrollY = 0,
        this.windowWidth = 0,
        this.windowHeight = 0,
        this.documentOffsetX = 0,
        this.documentOffsetY = 0,
        this.previousBreakpoint = "",
        this.breakpoint = ""
      }
      ,
      KeyframeComparison: function(e, t) {
        return e.start < t.start ? -1 : e.start > t.start ? 1 : 0
      }
    };
    t.exports = s
  }
  , {
    60: 60,
    67: 67,
    68: 68
  }],
  60: [function(e, t, i) {
    "use strict";
    const s = e(67);
    t.exports = class extends s {
      constructor(e, t, i, s, n=!1, r) {
        super(e, t, i),
        this.key = s,
        this.key.startsWith("--") || (this.key = this.key.replace(/[A-Z]/g, e=>"-" + e.toLowerCase())),
        this.round = n,
        this.suffix = r
      }
      set(e) {
        let t = this.current;
        this.round && (t = Math.round(t)),
        this.suffix && (t += this.suffix),
        e.setProperty(this.key, t)
      }
    }
  }
  , {
    67: 67
  }],
  61: [function(e, t, i) {
    "use strict";
    t.exports = new class {
      constructor() {
        this.linear = function(e) {
          return e
        }
        ,
        this.easeInQuad = function(e) {
          return e * e
        }
        ,
        this.easeOutQuad = function(e) {
          return e * (2 - e)
        }
        ,
        this.easeInOutQuad = function(e) {
          return e < .5 ? 2 * e * e : (4 - 2 * e) * e - 1
        }
        ,
        this.easeInSin = function(e) {
          return 1 + Math.sin(Math.PI / 2 * e - Math.PI / 2)
        }
        ,
        this.easeOutSin = function(e) {
          return Math.sin(Math.PI / 2 * e)
        }
        ,
        this.easeInOutSin = function(e) {
          return (1 + Math.sin(Math.PI * e - Math.PI / 2)) / 2
        }
        ,
        this.easeInElastic = function(e) {
          return 0 === e ? e : (.04 - .04 / e) * Math.sin(25 * e) + 1
        }
        ,
        this.easeOutElastic = function(e) {
          return .04 * e / --e * Math.sin(25 * e)
        }
        ,
        this.easeInOutElastic = function(e) {
          return (e -= .5) < 0 ? (.02 + .01 / e) * Math.sin(50 * e) : (.02 - .01 / e) * Math.sin(50 * e) + 1
        }
        ,
        this.easeOutBack = function(e) {
          return (e -= 1) * e * (2.70158 * e + 1.70158) + 1
        }
        ,
        this.easeInCubic = function(e) {
          return e * e * e
        }
        ,
        this.easeOutCubic = function(e) {
          return --e * e * e + 1
        }
        ,
        this.easeInOutCubic = function(e) {
          return e < .5 ? 4 * e * e * e : (e - 1) * (2 * e - 2) * (2 * e - 2) + 1
        }
        ,
        this.easeInQuart = function(e) {
          return e * e * e * e
        }
        ,
        this.easeOutQuart = function(e) {
          return 1 - --e * e * e * e
        }
        ,
        this.easeInOutQuart = function(e) {
          return e < .5 ? 8 * e * e * e * e : 1 - 8 * --e * e * e * e
        }
        ,
        this.easeInQuint = function(e) {
          return e * e * e * e * e
        }
        ,
        this.easeOutQuint = function(e) {
          return 1 + --e * e * e * e * e
        }
        ,
        this.easeInOutQuint = function(e) {
          return e < .5 ? 16 * e * e * e * e * e : 1 + 16 * --e * e * e * e * e
        }
      }
    }
  }
  , {}],
  62: [function(e, t, i) {
    "use strict";
    const s = e(59)
      , n = (e,t)=>null == e ? t : e;
    class r {
      constructor(e) {
        this.top = 0,
        this.bottom = 0,
        this.left = 0,
        this.right = 0,
        this.height = 0,
        this.width = 0
      }
      toString() {
        return "top:".concat(this.top, ", bottom:").concat(this.bottom, ", left:").concat(this.left, ", right:").concat(this.right, ", height:").concat(this.height, ", width:").concat(this.width)
      }
      toObject() {
        return {
          top: this.top,
          bottom: this.bottom,
          left: this.left,
          right: this.right,
          height: this.height,
          width: this.width
        }
      }
    }
    t.exports = class {
      constructor() {
        this.clear()
      }
      clear() {
        this._metrics = new WeakMap
      }
      destroy() {
        this._metrics = null
      }
      add(e) {
        let t = this._metrics.get(e);
        if (t)
          return t;
        let i = new r(e);
        return this._metrics.set(e, i),
        this._refreshMetrics(e, i)
      }
      get(e) {
        return this._metrics.get(e)
      }
      refreshCollection(e) {
        e.forEach(e=>this._refreshMetrics(e, null))
      }
      refreshMetrics(e) {
        return this._refreshMetrics(e)
      }
      _refreshMetrics(e, t) {
        if (t = t || this._metrics.get(e),
        !(e instanceof Element))
          return t.width = n(e.width, 0),
          t.height = n(e.height, 0),
          t.top = n(e.top, n(e.y, 0)),
          t.left = n(e.left, n(e.x, 0)),
          t.right = t.left + t.width,
          t.bottom = t.top + t.height,
          t;
        if (void 0 === e.offsetWidth) {
          let i = e.getBoundingClientRect();
          return t.width = i.width,
          t.height = i.height,
          t.top = s.pageMetrics.scrollY + i.top,
          t.left = s.pageMetrics.scrollX + i.left,
          t.right = t.left + t.width,
          t.bottom = t.top + t.height,
          t
        }
        t.width = e.offsetWidth,
        t.height = e.offsetHeight,
        t.top = s.pageMetrics.documentOffsetY,
        t.left = s.pageMetrics.documentOffsetX;
        let i = e;
        for (; i; )
          t.top += i.offsetTop,
          t.left += i.offsetLeft,
          i = i.offsetParent;
        return t.right = t.left + t.width,
        t.bottom = t.top + t.height,
        t
      }
    }
  }
  , {
    59: 59
  }],
  63: [function(e, t, i) {
    "use strict";
    t.exports = class {
      constructor(e) {
        this.controller = e,
        this.element = this.controller.element,
        this.keyframe = null,
        this.event = "",
        this.tweenProps = this.controller.tweenProps
      }
    }
  }
  , {}],
  64: [function(e, t, i) {
    "use strict";
    const s = e(59)
      , n = e(54)
      , r = e(57)
      , a = e(55)
      , o = function(e) {
      for (let t in e) {
        let i = e[t];
        if (-1 === s.KeyframeJSONReservedWords.indexOf(t) && Array.isArray(i))
          return !0
      }
      return !1
    };
    t.exports = function(e) {
      if (void 0 !== e.cssClass || void 0 !== e.style) {
        if (o(e))
          throw "CSS Keyframes cannot tween values, please use multiple keyframes instead";
        return a
      }
      if (o(e))
        return n;
      if (e.event)
        return r;
      throw delete e.anchors,
      "Could not determine tween type based on ".concat(JSON.stringify(e))
    }
  }
  , {
    54: 54,
    55: 55,
    57: 57,
    59: 59
  }],
  65: [function(e, t, i) {
    "use strict";
    t.exports = class {
      constructor() {
        this.local = 0,
        this.localUnclamped = 0,
        this.lastPosition = 0
      }
    }
  }
  , {}],
  66: [function(e, t, i) {
    "use strict";
    const {map: s} = e(146)
      , n = {};
    class r {
      constructor(e, t, i, s) {
        this.mass = e,
        this.stiffness = t,
        this.damping = i,
        this.initialVelocity = s,
        this.m_w0 = Math.sqrt(this.stiffness / this.mass),
        this.m_zeta = this.damping / (2 * Math.sqrt(this.stiffness * this.mass)),
        this.m_zeta < 1 ? (this.m_wd = this.m_w0 * Math.sqrt(1 - this.m_zeta * this.m_zeta),
        this.m_A = 1,
        this.m_B = (this.m_zeta * this.m_w0 - this.initialVelocity) / this.m_wd) : (this.m_wd = 0,
        this.m_A = 1,
        this.m_B = -this.initialVelocity + this.m_w0)
      }
      solve(e) {
        return 1 - (e = this.m_zeta < 1 ? Math.exp(-e * this.m_zeta * this.m_w0) * (this.m_A * Math.cos(this.m_wd * e) + this.m_B * Math.sin(this.m_wd * e)) : (this.m_A + this.m_B * e) * Math.exp(-e * this.m_w0))
      }
    }
    const a = /\d*\.?\d+/g;
    r.fromCSSString = function(e) {
      let t = e.match(a);
      if (4 !== t.length)
        throw "SpringEasing could not convert ".concat(cssString, " to spring params");
      let i = t.map(Number)
        , o = new r(...i);
      const h = o.solve.bind(o);
      let l = 0;
      let c = function() {
        if (n[e])
          return n[e];
        let t, i = 0;
        for (; ; ) {
          l += 1 / 6;
          if (1 === h(l)) {
            if (i++,
            i >= 16) {
              t = l * (1 / 6);
              break
            }
          } else
            i = 0
        }
        return n[e] = t,
        n[e]
      }();
      return function(e) {
        return 0 === e || 1 === e ? e : h(s(e, 0, 1, 0, c))
      }
    }
    ,
    t.exports = r
  }
  , {
    146: 146
  }],
  67: [function(e, t, i) {
    "use strict";
    t.exports = class {
      constructor(e, t, i) {
        this.epsilon = parseFloat(t),
        this.snapAtCreation = i,
        this.initialValue = e,
        this.target = e,
        this.current = e,
        this.previousValue = e,
        this.isActive = !1
      }
    }
  }
  , {}],
  68: [function(e, t, i) {
    "use strict";
    t.exports = class {
    }
  }
  , {}],
  69: [function(e, t, i) {
    "use strict";
    t.exports = ()=>Math.random().toString(16).slice(-4)
  }
  , {}],
  70: [function(e, t, i) {
    "use strict";
    const s = Math.abs;
    class n {
      constructor(e, t, i, s) {
        this.cp = new Float32Array(6),
        this.cp[0] = 3 * e,
        this.cp[1] = 3 * (i - e) - this.cp[0],
        this.cp[2] = 1 - this.cp[0] - this.cp[1],
        this.cp[3] = 3 * t,
        this.cp[4] = 3 * (s - t) - this.cp[3],
        this.cp[5] = 1 - this.cp[3] - this.cp[4]
      }
      sampleCurveX(e) {
        return ((this.cp[2] * e + this.cp[1]) * e + this.cp[0]) * e
      }
      sampleCurveY(e) {
        return ((this.cp[5] * e + this.cp[4]) * e + this.cp[3]) * e
      }
      sampleCurveDerivativeX(e) {
        return (3 * this.cp[2] * e + 2 * this.cp[1]) * e + this.cp[0]
      }
      solveCurveX(e) {
        var t, i, n, r, a, o;
        for (n = e,
        o = 0; o < 5; o++) {
          if (r = this.sampleCurveX(n) - e,
          s(r) < 1e-5)
            return n;
          if (a = this.sampleCurveDerivativeX(n),
          s(a) < 1e-5)
            break;
          n -= r / a
        }
        if ((n = e) < (t = 0))
          return t;
        if (n > (i = 1))
          return i;
        for (; t < i; ) {
          if (r = this.sampleCurveX(n),
          s(r - e) < 1e-5)
            return n;
          e > r ? t = n : i = n,
          n = .5 * (i - t) + t
        }
        return n
      }
      solve(e) {
        return this.sampleCurveY(this.solveCurveX(e))
      }
    }
    const r = /\d*\.?\d+/g;
    n.fromCSSString = function(e) {
      let t = e.match(r);
      if (4 !== t.length)
        throw "UnitBezier could not convert ".concat(e, " to cubic-bezier");
      let i = t.map(Number)
        , s = new n(i[0],i[1],i[2],i[3]);
      return s.solve.bind(s)
    }
    ,
    t.exports = n
  }
  , {}],
  71: [function(e, t, i) {
    "use strict";
    t.exports = class {
      constructor(e, t) {
        this.a = e.top - t,
        this.a < 0 && (this.a = e.top),
        this.b = e.top,
        this.d = e.bottom,
        this.c = Math.max(this.d - t, this.b)
      }
    }
  }
  , {}],
  72: [function(e, t, i) {
    "use strict";
    const s = e(73)
      , n = new (e(62));
    class r {
      constructor(e) {
        this.group = e,
        this.data = {
          target: null,
          anchors: null,
          metrics: this.group.metrics
        }
      }
      parseArray(e, t) {
        return [this.parseExpression(e, t[0]), this.parseExpression(e, t[1])]
      }
      parseExpression(e, t) {
        if (!t)
          return null;
        if ("number" == typeof t)
          return t;
        if ("string" != typeof t)
          throw "Expression must be a string, received ".concat(typeof t, ": ").concat(t);
        return this.data.target = e.controller.element,
        this.data.anchors = e.anchors,
        this.data.keyframe = e.keyframe,
        r._parse(t, this.data)
      }
      parseTimeValue(e, t) {
        if ("number" == typeof t)
          return t;
        let i = this.group.expressionParser.parseExpression(e, t);
        return this.group.convertScrollPositionToTValue(i)
      }
      destroy() {
        this.group = null
      }
      static parse(e, t) {
        return (t = t || {}) && (n.clear(),
        t.target && n.add(t.target),
        t.anchors && t.anchors.forEach(e=>n.add(e))),
        t.metrics = n,
        r._parse(e, t)
      }
      static _parse(e, t) {
        return s.Parse(e).execute(t)
      }
    }
    r.programs = s.programs,
    "undefined" != typeof window && (window.ExpressionParser = r),
    t.exports = r
  }
  , {
    62: 62,
    73: 73
  }],
  73: [function(e, t, i) {
    "use strict";
    const s = e(59)
      , n = e(146)
      , r = {}
      , a = {
      smoothstep: (e,t,i)=>(i = a.clamp((i - e) / (t - e), 0, 1)) * i * (3 - 2 * i),
      deg: e=>180 * e / Math.PI,
      rad: e=>e * Math.PI / 180,
      random: (e,t)=>Math.random() * (t - e) + e,
      atan: Math.atan2
    };
    Object.getOwnPropertyNames(Math).forEach(e=>a[e] ? null : a[e.toLowerCase()] = Math[e]),
    Object.getOwnPropertyNames(n).forEach(e=>a[e] ? null : a[e.toLowerCase()] = n[e]);
    let o = null;
    const h = "a"
      , l = "ALPHA"
      , c = "("
      , d = ")"
      , u = "PLUS"
      , m = "MINUS"
      , p = "MUL"
      , f = "DIV"
      , y = "INTEGER_CONST"
      , g = "FLOAT_CONST"
      , _ = ","
      , v = "EOF"
      , b = {
      NUMBERS: /\d|\d\.\d/,
      DIGIT: /\d/,
      OPERATOR: /[-+*/]/,
      PAREN: /[()]/,
      WHITE_SPACE: /\s/,
      ALPHA: /[a-zA-Z]|%/,
      ALPHANUMERIC: /[a-zA-Z0-9]/,
      OBJECT_UNIT: /^(t|l|b|r|%w|%h|%|h|w)$/,
      GLOBAL_METRICS_UNIT: /^(px|vh|vw)$/,
      ANY_UNIT: /^(t|l|b|r|%w|%h|%|h|w|px|vh|vw)$/,
      MATH_FUNCTION: new RegExp("\\b(".concat(Object.keys(a).join("|"), ")\\b"),"i")
    }
      , E = function(e, t, i, s="") {
      let n = t.slice(Math.max(i, 0), Math.min(t.length, i + 3))
        , r = new Error("Expression Error. ".concat(e, ' in expression "').concat(t, '", near "').concat(n, '"'));
      throw console.error(r.message, o ? o.keyframe || o.target : ""),
      r
    }
      , S = {
      round: 1,
      clamp: 3,
      lerp: 3,
      random: 2,
      atan: 2,
      floor: 1,
      ceil: 1,
      abs: 1,
      cos: 1,
      sin: 1,
      smoothstep: 3,
      rad: 1,
      deg: 1,
      pow: 2,
      calc: 1
    };
    class x {
      constructor(e, t) {
        this.type = e,
        this.value = t
      }
    }
    x.ONE = new x("100",100),
    x.EOF = new x(v,null);
    class w {
      constructor(e) {
        this.type = e
      }
    }
    class T extends w {
      constructor(e, t) {
        super("UnaryOp"),
        this.token = this.op = e,
        this.expr = t
      }
    }
    class O extends w {
      constructor(e, t, i) {
        super("BinOp"),
        this.left = e,
        this.op = t,
        this.right = i
      }
    }
    class A extends w {
      constructor(e, t) {
        if (super("MathOp"),
        this.op = e,
        this.list = t,
        S[e.value] && t.length !== S[e.value])
          throw new Error("Incorrect number of arguments for '".concat(e.value, "'. Received ").concat(t.length, ", expected ").concat(S[e.value]))
      }
    }
    class P extends w {
      constructor(e) {
        super("Num"),
        this.token = e,
        this.value = e.value
      }
    }
    class R extends w {
      constructor(e, t, i) {
        super("RefValue"),
        this.num = e,
        this.ref = t,
        this.unit = i
      }
    }
    class k extends w {
      constructor(e, t) {
        super("CSSValue"),
        this.ref = e,
        this.propertyName = t
      }
    }
    class C extends w {
      constructor(e, t) {
        super("PropValue"),
        this.ref = e,
        this.propertyName = t
      }
    }
    class I {
      constructor(e) {
        let t;
        for (this.text = e,
        this.pos = 0,
        this.char = this.text[this.pos],
        this.tokens = []; (t = this.getNextToken()) && t !== x.EOF; )
          this.tokens.push(t);
        this.tokens.push(t)
      }
      advance() {
        this.char = this.text[++this.pos]
      }
      skipWhiteSpace() {
        for (; null != this.char && b.WHITE_SPACE.test(this.char); )
          this.advance()
      }
      name() {
        let e = "";
        for (; null != this.char && b.ALPHA.test(this.char); )
          e += this.char,
          this.advance();
        return new x(l,e)
      }
      number() {
        let e = "";
        for ("." === this.char && (e += this.char,
        this.advance()); null != this.char && b.DIGIT.test(this.char); )
          e += this.char,
          this.advance();
        if (null != this.char && "." === this.char)
          for (e.includes(".") && E("Number appears to contain 2 decimal points", this.text, this.pos),
          e += this.char,
          this.advance(); null != this.char && b.DIGIT.test(this.char); )
            e += this.char,
            this.advance();
        return "." === e && E("Attempted to parse a number, but found only a decimal point", this.text, this.pos),
        e.includes(".") ? new x(g,parseFloat(e)) : new x(y,parseInt(e))
      }
      getNextToken() {
        for (; null != this.char; )
          if (b.WHITE_SPACE.test(this.char))
            this.skipWhiteSpace();
          else {
            if ("." === this.char || b.DIGIT.test(this.char))
              return this.number();
            if ("," === this.char)
              return this.advance(),
              new x(_,",");
            if (b.OPERATOR.test(this.char)) {
              let e = ""
                , t = this.char;
              switch (t) {
              case "+":
                e = u;
                break;
              case "-":
                e = m;
                break;
              case "*":
                e = p;
                break;
              case "/":
                e = f
              }
              return this.advance(),
              new x(e,t)
            }
            if (b.PAREN.test(this.char)) {
              let e = ""
                , t = this.char;
              switch (t) {
              case "(":
                e = c;
                break;
              case ")":
                e = d
              }
              return this.advance(),
              new x(e,t)
            }
            if (b.ALPHA.test(this.char))
              return this.name();
            E('Unexpected character "'.concat(this.char, '"'), this.text, this.pos)
          }
        return x.EOF
      }
    }
    class D {
      constructor(e) {
        this.lexer = e,
        this.pos = 0
      }
      get currentToken() {
        return this.lexer.tokens[this.pos]
      }
      error(e, t="") {
        E(e, t, this.lexer.text, this.pos)
      }
      consume(e) {
        let t = this.currentToken;
        return t.type === e ? this.pos += 1 : this.error("Invalid token ".concat(this.currentToken.value, ", expected ").concat(e)),
        t
      }
      consumeList(e) {
        e.includes(this.currentToken) ? this.pos += 1 : this.error("Invalid token ".concat(this.currentToken.value, ", expected ").concat(tokenType))
      }
      expr() {
        let e = this.term();
        for (; this.currentToken.type === u || this.currentToken.type === m; ) {
          const t = this.currentToken;
          switch (t.value) {
          case "+":
            this.consume(u);
            break;
          case "-":
            this.consume(m)
          }
          e = new O(e,t,this.term())
        }
        return e
      }
      term() {
        let e = this.factor();
        for (; this.currentToken.type === p || this.currentToken.type === f; ) {
          const t = this.currentToken;
          switch (t.value) {
          case "*":
            this.consume(p);
            break;
          case "/":
            this.consume(f)
          }
          e = new O(e,t,this.factor())
        }
        return e
      }
      factor() {
        if (this.currentToken.type === u)
          return new T(this.consume(u),this.factor());
        if (this.currentToken.type === m)
          return new T(this.consume(m),this.factor());
        if (this.currentToken.type === y || this.currentToken.type === g) {
          let e = new P(this.currentToken);
          if (this.pos += 1,
          b.OPERATOR.test(this.currentToken.value) || this.currentToken.type === d || this.currentToken.type === _ || this.currentToken.type === v)
            return e;
          if (this.currentToken.type === l && this.currentToken.value === h)
            return this.consume(l),
            new R(e,this.anchorIndex(),this.unit(b.ANY_UNIT));
          if (this.currentToken.type === l)
            return "%a" === this.currentToken.value && this.error("%a is invalid, try removing the %"),
            new R(e,null,this.unit());
          this.error("Expected a scaling unit type", "Such as 'h' / 'w'")
        } else {
          if (b.OBJECT_UNIT.test(this.currentToken.value))
            return new R(new P(x.ONE),null,this.unit());
          if (this.currentToken.value === h) {
            this.consume(l);
            const e = this.anchorIndex();
            if (b.OBJECT_UNIT.test(this.currentToken.value))
              return new R(new P(x.ONE),e,this.unit())
          } else if (this.currentToken.type === l) {
            if ("calc" === this.currentToken.value)
              return this.consume(l),
              this.expr();
            if ("css" === this.currentToken.value || "var" === this.currentToken.value || "prop" === this.currentToken.value) {
              const e = "prop" !== this.currentToken.value ? k : C;
              this.consume(l),
              this.consume(c);
              const t = this.propertyName();
              let i = null;
              return this.currentToken.type === _ && (this.consume(_),
              this.consume(l),
              i = this.anchorIndex()),
              this.consume(d),
              new e(i,t)
            }
            if (b.MATH_FUNCTION.test(this.currentToken.value)) {
              const e = this.currentToken.value.toLowerCase();
              if ("number" == typeof a[e])
                return this.consume(l),
                new P(new x(l,a[e]));
              const t = x[e] || new x(e,e)
                , i = [];
              this.consume(l),
              this.consume(c);
              let s = null;
              do {
                this.currentToken.value === _ && this.consume(_),
                s = this.expr(),
                i.push(s)
              } while (this.currentToken.value === _);
              return this.consume(d),
              new A(t,i)
            }
          } else if (this.currentToken.type === c) {
            this.consume(c);
            let e = this.expr();
            return this.consume(d),
            e
          }
        }
        this.error("Unexpected token ".concat(this.currentToken.value))
      }
      propertyName() {
        let e = "";
        for (; this.currentToken.type === l || this.currentToken.type === m; )
          e += this.currentToken.value,
          this.pos += 1;
        return e
      }
      unit(e=b.ANY_UNIT) {
        const t = this.currentToken;
        if (t.type === l && e.test(t.value))
          return this.consume(l),
          new x(l,t.value = t.value.replace(/%(h|w)/, "$1").replace("%", "h"));
        this.error("Expected unit type")
      }
      anchorIndex() {
        const e = this.currentToken;
        if (e.type === y)
          return this.consume(y),
          new P(e);
        this.error("Invalid anchor reference", ". Should be something like a0, a1, a2")
      }
      parse() {
        const e = this.expr();
        return this.currentToken !== x.EOF && this.error("Unexpected token ".concat(this.currentToken.value)),
        e
      }
    }
    class M {
      constructor(e) {
        this.parser = e,
        this.root = e.parse()
      }
      visit(e) {
        let t = this[e.type];
        if (!t)
          throw new Error("No visit method named, ".concat(t));
        return t.call(this, e)
      }
      BinOp(e) {
        switch (e.op.type) {
        case u:
          return this.visit(e.left) + this.visit(e.right);
        case m:
          return this.visit(e.left) - this.visit(e.right);
        case p:
          return this.visit(e.left) * this.visit(e.right);
        case f:
          return this.visit(e.left) / this.visit(e.right)
        }
      }
      RefValue(e) {
        let t = this.unwrapReference(e)
          , i = e.unit.value
          , n = e.num.value;
        const r = o.metrics.get(t);
        switch (i) {
        case "h":
          return .01 * n * r.height;
        case "t":
          return .01 * n * r.top;
        case "vh":
          return .01 * n * s.pageMetrics.windowHeight;
        case "vw":
          return .01 * n * s.pageMetrics.windowWidth;
        case "px":
          return n;
        case "w":
          return .01 * n * r.width;
        case "b":
          return .01 * n * r.bottom;
        case "l":
          return .01 * n * r.left;
        case "r":
          return .01 * n * r.right
        }
      }
      PropValue(e) {
        return (null === e.ref ? o.target : o.anchors[e.ref.value])[e.propertyName]
      }
      CSSValue(e) {
        let t = this.unwrapReference(e);
        const i = getComputedStyle(t).getPropertyValue(e.propertyName);
        return "" === i ? 0 : M.Parse(i).execute(o)
      }
      Num(e) {
        return e.value
      }
      UnaryOp(e) {
        return e.op.type === u ? +this.visit(e.expr) : e.op.type === m ? -this.visit(e.expr) : void 0
      }
      MathOp(e) {
        let t = e.list.map(e=>this.visit(e));
        return a[e.op.value].apply(null, t)
      }
      unwrapReference(e) {
        return null === e.ref ? o.target : (e.ref.value >= o.anchors.length && console.error("Not enough anchors supplied for expression ".concat(this.parser.lexer.text), o.target),
        o.anchors[e.ref.value])
      }
      execute(e) {
        return o = e,
        this.visit(this.root)
      }
      static Parse(e) {
        return r[e] || (r[e] = new M(new D(new I(e))))
      }
    }
    M.programs = r,
    t.exports = M
  }
  , {
    146: 146,
    59: 59
  }],
  74: [function(e, t, i) {
    "use strict";
    const s = e(25).EventEmitterMicro
      , n = e(146)
      , r = e(77)
      , a = e(59)
      , o = e(58)
      , h = e(65)
      , l = e(71)
      , c = e(62)
      , d = e(72)
      , u = e(56)
      , m = {};
    "undefined" != typeof window && (m.create = e(33),
    m.update = e(43),
    m.draw = e(39));
    let p = 0;
    t.exports = class extends s {
      constructor(e, t) {
        super(),
        this.anim = t,
        this.element = e,
        this.name = this.name || e.getAttribute("data-anim-scroll-group"),
        this.isEnabled = !0,
        this.position = new h,
        this.metrics = new c,
        this.metrics.add(this.element),
        this.expressionParser = new d(this),
        this.boundsMin = 0,
        this.boundsMax = 0,
        this.timelineUpdateRequired = !1,
        this._keyframesDirty = !1,
        this.viewableRange = this.createViewableRange(),
        this.defaultEase = a.KeyframeDefaults.ease,
        this.keyframeControllers = [],
        this.updateProgress(this.getPosition()),
        this.onDOMRead = this.onDOMRead.bind(this),
        this.onDOMWrite = this.onDOMWrite.bind(this),
        this.gui = null,
        this.finalizeInit()
      }
      finalizeInit() {
        this.element._animInfo = new o(this,null,!0),
        this.setupRAFEmitter()
      }
      destroy() {
        this.destroyed = !0,
        this.expressionParser.destroy(),
        this.expressionParser = null;
        for (let e = 0, t = this.keyframeControllers.length; e < t; e++)
          this.keyframeControllers[e].destroy();
        this.keyframeControllers = null,
        this.position = null,
        this.viewableRange = null,
        this.gui && (this.gui.destroy(),
        this.gui = null),
        this.metrics.destroy(),
        this.metrics = null,
        this.rafEmitter.destroy(),
        this.rafEmitter = null,
        this.anim = null,
        this.element._animInfo && this.element._animInfo.group === this && (this.element._animInfo.group = null,
        this.element._animInfo = null),
        this.element = null,
        this.isEnabled = !1,
        super.destroy()
      }
      removeKeyframeController(e) {
        return this.keyframeControllers.includes(e) ? (e._allKeyframes.forEach(e=>e.markedForRemoval = !0),
        this.keyframesDirty = !0,
        new Promise(t=>{
          m.draw(()=>{
            const i = this.keyframeControllers.indexOf(e);
            -1 !== i ? (this.keyframeControllers.splice(i, 1),
            e.onDOMWrite(),
            e.destroy(),
            this.gui && this.gui.create(),
            t()) : t()
          }
          )
        }
        )) : Promise.resolve()
      }
      remove() {
        return this.anim.removeGroup(this)
      }
      clear() {
        return Promise.all(this.keyframeControllers.map(e=>this.removeKeyframeController(e)))
      }
      setupRAFEmitter(e) {
        this.rafEmitter && this.rafEmitter.destroy(),
        this.rafEmitter = e || new m.create,
        this.rafEmitter.on("update", this.onDOMRead),
        this.rafEmitter.on("draw", this.onDOMWrite),
        this.rafEmitter.once("external", ()=>this.reconcile())
      }
      requestDOMChange() {
        return !!this.isEnabled && this.rafEmitter.run()
      }
      onDOMRead() {
        this.keyframesDirty && this.onKeyframesDirty();
        for (let e = 0, t = this.keyframeControllers.length; e < t; e++)
          this.keyframeControllers[e].onDOMRead(this.position.local)
      }
      onDOMWrite() {
        for (let e = 0, t = this.keyframeControllers.length; e < t; e++)
          this.keyframeControllers[e].onDOMWrite();
        this.needsUpdate() && this.requestDOMChange()
      }
      needsUpdate() {
        if (this._keyframesDirty)
          return !0;
        for (let e = 0, t = this.keyframeControllers.length; e < t; e++)
          if (this.keyframeControllers[e].needsUpdate())
            return !0;
        return !1
      }
      addKeyframe(e, t) {
        let i = this.getControllerForTarget(e);
        return null === i && (i = new u(this,e),
        this.keyframeControllers.push(i)),
        this.keyframesDirty = !0,
        i.addKeyframe(t)
      }
      addEvent(e, t) {
        t.event = t.event || "Generic-Event-Name-" + p++;
        let i = void 0 !== t.end && t.end !== t.start;
        const s = this.addKeyframe(e, t);
        return i ? (t.onEnterOnce && s.controller.once(t.event + ":enter", t.onEnterOnce),
        t.onExitOnce && s.controller.once(t.event + ":exit", t.onExitOnce),
        t.onEnter && s.controller.on(t.event + ":enter", t.onEnter),
        t.onExit && s.controller.on(t.event + ":exit", t.onExit)) : (t.onEventOnce && s.controller.once(t.event, t.onEventOnce),
        t.onEventReverseOnce && s.controller.once(t.event + ":reverse", t.onEventReverseOnce),
        t.onEvent && s.controller.on(t.event, t.onEvent),
        t.onEventReverse && s.controller.on(t.event + ":reverse", t.onEventReverse)),
        s
      }
      forceUpdate({waitForNextUpdate: e=!0, silent: t=!1}={}) {
        this.isEnabled && (this.refreshMetrics(),
        this.timelineUpdateRequired = !0,
        e ? this.keyframesDirty = !0 : this.onKeyframesDirty({
          silent: t
        }))
      }
      onKeyframesDirty({silent: e=!1}={}) {
        this.determineActiveKeyframes(),
        this.keyframesDirty = !1,
        this.metrics.refreshMetrics(this.element),
        this.viewableRange = this.createViewableRange();
        for (let e = 0, t = this.keyframeControllers.length; e < t; e++)
          this.keyframeControllers[e].updateAnimationConstraints();
        this.updateBounds(),
        this.updateProgress(this.getPosition()),
        e || this.updateTimeline(),
        this.gui && this.gui.create()
      }
      refreshMetrics() {
        let e = new Set([this.element]);
        this.keyframeControllers.forEach(t=>{
          e.add(t.element),
          t._allKeyframes.forEach(t=>t.anchors.forEach(t=>e.add(t)))
        }
        ),
        this.metrics.refreshCollection(e),
        this.viewableRange = this.createViewableRange()
      }
      reconcile() {
        for (let e = 0, t = this.keyframeControllers.length; e < t; e++)
          this.keyframeControllers[e].reconcile()
      }
      determineActiveKeyframes(e) {
        e = e || r(Array.from(document.documentElement.classList));
        for (let t = 0, i = this.keyframeControllers.length; t < i; t++)
          this.keyframeControllers[t].determineActiveKeyframes(e)
      }
      updateBounds() {
        if (0 === this.keyframeControllers.length)
          return this.boundsMin = 0,
          void (this.boundsMax = 0);
        let e = {
          min: Number.POSITIVE_INFINITY,
          max: Number.NEGATIVE_INFINITY
        };
        for (let t = 0, i = this.keyframeControllers.length; t < i; t++)
          this.keyframeControllers[t].getBounds(e);
        let t = this.convertTValueToScrollPosition(e.min)
          , i = this.convertTValueToScrollPosition(e.max);
        i - t < a.pageMetrics.windowHeight ? (e.min = this.convertScrollPositionToTValue(t - .5 * a.pageMetrics.windowHeight),
        e.max = this.convertScrollPositionToTValue(i + .5 * a.pageMetrics.windowHeight)) : (e.min -= .001,
        e.max += .001),
        this.boundsMin = e.min,
        this.boundsMax = e.max,
        this.timelineUpdateRequired = !0
      }
      createViewableRange() {
        return new l(this.metrics.get(this.element),a.pageMetrics.windowHeight)
      }
      _onBreakpointChange(e, t) {
        this.keyframesDirty = !0,
        this.determineActiveKeyframes()
      }
      updateProgress(e) {
        this.hasDuration() ? (this.position.localUnclamped = (e - this.viewableRange.a) / (this.viewableRange.d - this.viewableRange.a),
        this.position.local = n.clamp(this.position.localUnclamped, this.boundsMin, this.boundsMax)) : this.position.local = this.position.localUnclamped = 0
      }
      performTimelineDispatch() {
        for (let e = 0, t = this.keyframeControllers.length; e < t; e++)
          this.keyframeControllers[e].updateLocalProgress(this.position.local);
        this.trigger(a.EVENTS.ON_TIMELINE_UPDATE, this.position.local),
        this.trigger("update", this.position.local),
        this.timelineUpdateRequired = !1,
        this.position.lastPosition !== this.position.local && (this.position.lastPosition <= this.boundsMin && this.position.localUnclamped > this.boundsMin ? (this.trigger(a.EVENTS.ON_TIMELINE_START, this),
        this.trigger("start", this)) : this.position.lastPosition >= this.boundsMin && this.position.localUnclamped < this.boundsMin ? (this.trigger(a.EVENTS.ON_TIMELINE_START + ":reverse", this),
        this.trigger("start:reverse", this)) : this.position.lastPosition <= this.boundsMax && this.position.localUnclamped >= this.boundsMax ? (this.trigger(a.EVENTS.ON_TIMELINE_COMPLETE, this),
        this.trigger("complete", this)) : this.position.lastPosition >= this.boundsMax && this.position.localUnclamped < this.boundsMax && (this.trigger(a.EVENTS.ON_TIMELINE_COMPLETE + ":reverse", this),
        this.trigger("complete:reverse", this))),
        null !== this.gui && this.gui.onScrollUpdate(this.position)
      }
      updateTimeline(e) {
        if (!this.isEnabled)
          return !1;
        void 0 === e && (e = this.getPosition()),
        this.updateProgress(e);
        let t = this.position.lastPosition === this.boundsMin || this.position.lastPosition === this.boundsMax
          , i = this.position.localUnclamped === this.boundsMin || this.position.localUnclamped === this.boundsMax;
        if (!this.timelineUpdateRequired && t && i && this.position.lastPosition === e)
          return void (this.position.local = this.position.localUnclamped);
        if (this.timelineUpdateRequired || this.position.localUnclamped > this.boundsMin && this.position.localUnclamped < this.boundsMax)
          return this.performTimelineDispatch(),
          this.requestDOMChange(),
          void (this.position.lastPosition = this.position.localUnclamped);
        let s = this.position.lastPosition > this.boundsMin && this.position.lastPosition < this.boundsMax
          , n = this.position.localUnclamped <= this.boundsMin || this.position.localUnclamped >= this.boundsMax;
        if (s && n)
          return this.performTimelineDispatch(),
          this.requestDOMChange(),
          void (this.position.lastPosition = this.position.localUnclamped);
        const r = this.position.lastPosition < this.boundsMin && this.position.localUnclamped > this.boundsMax
          , a = this.position.lastPosition > this.boundsMax && this.position.localUnclamped < this.boundsMax;
        (r || a) && (this.performTimelineDispatch(),
        this.requestDOMChange(),
        this.position.lastPosition = this.position.localUnclamped),
        null !== this.gui && this.gui.onScrollUpdate(this.position)
      }
      _onScroll(e) {
        this.updateTimeline(e)
      }
      convertScrollPositionToTValue(e) {
        return this.hasDuration() ? n.map(e, this.viewableRange.a, this.viewableRange.d, 0, 1) : 0
      }
      convertTValueToScrollPosition(e) {
        return this.hasDuration() ? n.map(e, 0, 1, this.viewableRange.a, this.viewableRange.d) : 0
      }
      hasDuration() {
        return this.viewableRange.a !== this.viewableRange.d
      }
      getPosition() {
        return a.pageMetrics.scrollY
      }
      getControllerForTarget(e) {
        if (!e._animInfo || !e._animInfo.controllers)
          return null;
        if (e._animInfo.controller && e._animInfo.controller.group === this)
          return e._animInfo.controller;
        const t = e._animInfo.controllers;
        for (let e = 0, i = t.length; e < i; e++)
          if (t[e].group === this)
            return t[e];
        return null
      }
      trigger(e, t) {
        if (void 0 !== this._events[e])
          for (let i = this._events[e].length - 1; i >= 0; i--)
            void 0 !== t ? this._events[e][i](t) : this._events[e][i]()
      }
      set keyframesDirty(e) {
        this._keyframesDirty = e,
        this._keyframesDirty && this.requestDOMChange()
      }
      get keyframesDirty() {
        return this._keyframesDirty
      }
    }
  }
  , {
    146: 146,
    25: 25,
    33: 33,
    39: 39,
    43: 43,
    56: 56,
    58: 58,
    59: 59,
    62: 62,
    65: 65,
    71: 71,
    72: 72,
    77: 77
  }],
  75: [function(e, t, i) {
    "use strict";
    const s = e(74)
      , n = e(53)
      , r = e(146);
    let a = 0;
    const o = {};
    "undefined" != typeof window && (o.create = e(33));
    class h extends s {
      constructor(e, t) {
        e || ((e = document.createElement("div")).className = "TimeGroup-" + a++),
        super(e, t),
        this.name = this.name || e.getAttribute("data-anim-time-group"),
        this._isPaused = !0,
        this._repeats = 0,
        this._isReversed = !1,
        this._timeScale = 1,
        this._chapterPlayer = new n(this),
        this.now = performance.now()
      }
      finalizeInit() {
        if (!this.anim)
          throw "TimeGroup not instantiated correctly. Please use `AnimSystem.createTimeGroup(el)`";
        this.onPlayTimeUpdate = this.onPlayTimeUpdate.bind(this),
        super.finalizeInit()
      }
      progress(e) {
        if (void 0 === e)
          return 0 === this.boundsMax ? 0 : this.position.local / this.boundsMax;
        let t = e * this.boundsMax;
        this.timelineUpdateRequired = !0,
        this.updateTimeline(t)
      }
      time(e) {
        if (void 0 === e)
          return this.position.local;
        e = r.clamp(e, this.boundsMin, this.duration),
        this.timelineUpdateRequired = !0,
        this.updateTimeline(e)
      }
      play(e) {
        this.reversed(!1),
        this.isEnabled = !0,
        this._isPaused = !1,
        this.time(e),
        this.now = performance.now(),
        this._playheadEmitter.run()
      }
      reverse(e) {
        this.reversed(!0),
        this.isEnabled = !0,
        this._isPaused = !1,
        this.time(e),
        this.now = performance.now(),
        this._playheadEmitter.run()
      }
      reversed(e) {
        if (void 0 === e)
          return this._isReversed;
        this._isReversed = e
      }
      restart() {
        this._isReversed ? (this.progress(1),
        this.reverse(this.time())) : (this.progress(0),
        this.play(this.time()))
      }
      pause(e) {
        this.time(e),
        this._isPaused = !0
      }
      paused(e) {
        return void 0 === e ? this._isPaused : (this._isPaused = e,
        this._isPaused || this.play(),
        this)
      }
      onPlayTimeUpdate() {
        if (this._isPaused)
          return;
        let e = performance.now()
          , t = (e - this.now) / 1e3;
        this.now = e,
        this._isReversed && (t = -t);
        let i = this.time() + t * this._timeScale;
        if (this._repeats === h.REPEAT_FOREVER || this._repeats > 0) {
          let e = !1;
          !this._isReversed && i > this.boundsMax ? (i -= this.boundsMax,
          e = !0) : this._isReversed && i < 0 && (i = this.boundsMax + i,
          e = !0),
          e && (this._repeats = this._repeats === h.REPEAT_FOREVER ? h.REPEAT_FOREVER : this._repeats - 1)
        }
        this.time(i);
        let s = !this._isReversed && this.position.local !== this.duration
          , n = this._isReversed && 0 !== this.position.local;
        s || n ? this._playheadEmitter.run() : this.paused(!0)
      }
      updateProgress(e) {
        this.hasDuration() ? (this.position.localUnclamped = e,
        this.position.local = r.clamp(this.position.localUnclamped, this.boundsMin, this.boundsMax)) : this.position.local = this.position.localUnclamped = 0
      }
      updateBounds() {
        if (0 === this.keyframeControllers.length)
          return this.boundsMin = 0,
          void (this.boundsMax = 0);
        let e = {
          min: Number.POSITIVE_INFINITY,
          max: Number.NEGATIVE_INFINITY
        };
        for (let t = 0, i = this.keyframeControllers.length; t < i; t++)
          this.keyframeControllers[t].getBounds(e);
        this.boundsMin = 0,
        this.boundsMax = e.max,
        this.viewableRange.a = this.viewableRange.b = 0,
        this.viewableRange.c = this.viewableRange.d = this.boundsMax,
        this.timelineUpdateRequired = !0
      }
      setupRAFEmitter(e) {
        this._playheadEmitter = new o.create,
        this._playheadEmitter.on("update", this.onPlayTimeUpdate),
        super.setupRAFEmitter(e)
      }
      get duration() {
        return this.keyframesDirty && this.onKeyframesDirty({
          silent: !0
        }),
        this.boundsMax
      }
      timeScale(e) {
        return void 0 === e ? this._timeScale : (this._timeScale = e,
        this)
      }
      repeats(e) {
        if (void 0 === e)
          return this._repeats;
        this._repeats = e
      }
      getPosition() {
        return this.position.local
      }
      addChapter(e) {
        return this._chapterPlayer.addChapter(e)
      }
      playToChapter(e) {
        this._chapterPlayer.playToChapter(e)
      }
      convertScrollPositionToTValue(e) {
        return e
      }
      convertTValueToScrollPosition(e) {
        return e
      }
      hasDuration() {
        return this.duration > 0
      }
      destroy() {
        this._playheadEmitter.destroy(),
        this._playheadEmitter = null,
        super.destroy()
      }
      set timelineProgress(e) {
        this.progress(e)
      }
      get timelineProgress() {
        return this.progress()
      }
    }
    h.REPEAT_FOREVER = -1,
    t.exports = h
  }
  , {
    146: 146,
    33: 33,
    53: 53,
    74: 74
  }],
  76: [function(e, t, i) {
    "use strict";
    const s = e(74)
      , n = (e(53),
    e(146));
    let r = 0;
    const a = {};
    "undefined" != typeof window && (a.create = e(33));
    t.exports = class extends s {
      constructor(e, t) {
        e || ((e = document.createElement("div")).className = "TweenGroup-" + r++),
        super(e, t),
        this.name = "Tweens",
        this.keyframes = [],
        this._isPaused = !1,
        this.now = performance.now()
      }
      finalizeInit() {
        this.onTimeEmitterUpdate = this.onTimeEmitterUpdate.bind(this),
        this.removeExpiredKeyframeControllers = this.removeExpiredKeyframeControllers.bind(this),
        super.finalizeInit()
      }
      destroy() {
        this._timeEmitter.destroy(),
        this._timeEmitter = null,
        this._keyframes = [],
        super.destroy()
      }
      setupRAFEmitter(e) {
        this.now = performance.now(),
        this._timeEmitter = new a.create,
        this._timeEmitter.on("update", this.onTimeEmitterUpdate),
        this._timeEmitter.run(),
        super.setupRAFEmitter(e)
      }
      addKeyframe(e, t) {
        if (void 0 !== t.start || void 0 !== t.end)
          throw Error("Tweens do not have a start or end, they can only have a duration. Consider using a TimeGroup instead");
        if ("number" != typeof t.duration)
          throw Error("Tween options.duration is undefined, or is not a number");
        let i, s;
        t.start = (t.delay || 0) + this.position.localUnclamped,
        t.end = t.start + t.duration,
        t.preserveState = !0,
        t.snapAtCreation = !0,
        e._animInfo && (i = e._animInfo.group,
        s = e._animInfo.controller);
        let n = super.addKeyframe(e, t);
        return e._animInfo.group = i,
        e._animInfo.controller = s,
        t.onStart && n.controller.once("draw", e=>{
          e.keyframe = n,
          t.onStart(e),
          e.keyframe = null
        }
        ),
        t.onDraw && n.controller.on("draw", e=>{
          e.keyframe = n,
          t.onDraw(e),
          e.keyframe = null
        }
        ),
        this.removeOverlappingProps(n),
        this.keyframes.push(n),
        this._timeEmitter.willRun() || (this.now = performance.now(),
        this._timeEmitter.run()),
        n
      }
      removeOverlappingProps(e) {
        if (e.controller._allKeyframes.length <= 1)
          return;
        let t = Object.keys(e.animValues)
          , i = e.controller;
        for (let s = 0, n = i._allKeyframes.length; s < n; s++) {
          const n = i._allKeyframes[s];
          if (n === e)
            continue;
          if (n.markedForRemoval)
            continue;
          let r = Object.keys(n.animValues)
            , a = r.filter(e=>t.includes(e));
          a.length !== r.length ? a.forEach(e=>delete n.animValues[e]) : n.markedForRemoval = !0
        }
      }
      onTimeEmitterUpdate(e) {
        if (this._isPaused || 0 === this.keyframeControllers.length)
          return;
        let t = performance.now()
          , i = (t - this.now) / 1e3;
        this.now = t;
        let s = this.position.local + i;
        this.position.local = this.position.localUnclamped = s,
        this.onTimeUpdate()
      }
      onTimeUpdate() {
        for (let e = 0, t = this.keyframes.length; e < t; e++)
          this.keyframes[e].updateLocalProgress(this.position.localUnclamped);
        this.requestDOMChange(),
        this._timeEmitter.run(),
        null !== this.gui && this.gui.onScrollUpdate(this.position)
      }
      onDOMRead() {
        if (this.keyframesDirty && this.onKeyframesDirty(),
        0 !== this.keyframes.length)
          for (let e = 0, t = this.keyframes.length; e < t; e++) {
            this.keyframes[e].controller.needsWrite = !0;
            for (let t in this.keyframes[e].animValues)
              this.keyframes[e].onDOMRead(t)
          }
      }
      onDOMWrite() {
        super.onDOMWrite(),
        this.removeExpiredKeyframes()
      }
      removeExpiredKeyframes() {
        let e = this.keyframes.length
          , t = e;
        for (; e--; ) {
          let t = this.keyframes[e];
          t.destroyed ? this.keyframes.splice(e, 1) : (t.markedForRemoval && (t.jsonProps.onComplete && 1 === t.localT && (t.controller.eventObject.keyframe = t,
          t.jsonProps.onComplete(t.controller.eventObject),
          t.jsonProps.onComplete = null),
          null !== this.gui && this.gui.isDraggingPlayhead || (t.remove(),
          this.keyframes.splice(e, 1))),
          1 === t.localT && (t.markedForRemoval = !0))
        }
        this.keyframes.length === t && 0 !== this.keyframes.length || this._timeEmitter.executor.eventEmitter.once("after:draw", this.removeExpiredKeyframeControllers)
      }
      removeExpiredKeyframeControllers() {
        for (let e = 0, t = this.keyframeControllers.length; e < t; e++) {
          let t = !0
            , i = this.keyframeControllers[e];
          for (let e = 0, s = i._allKeyframes.length; e < s; e++)
            if (!i._allKeyframes[e].destroyed) {
              t = !1;
              break
            }
          t && i.remove()
        }
      }
      updateBounds() {
        this.boundsMin = Math.min(...this.keyframes.map(e=>e.start)),
        this.boundsMax = Math.max(...this.keyframes.map(e=>e.end))
      }
      play() {
        this.isEnabled = !0,
        this._isPaused = !1,
        this.now = performance.now(),
        this._timeEmitter.run()
      }
      pause() {
        this._isPaused = !0
      }
      paused() {
        return this._isPaused
      }
      time(e) {
        if (void 0 === e)
          return this.position.local;
        this.position.local = this.position.localUnclamped = n.clamp(e, this.boundsMin, this.boundsMax),
        this.onTimeUpdate()
      }
      performTimelineDispatch() {}
      hasDuration() {
        return !0
      }
      getPosition() {
        return this.position.local
      }
      updateProgress(e) {}
      get duration() {
        return this.boundsMax
      }
    }
  }
  , {
    146: 146,
    33: 33,
    53: 53,
    74: 74
  }],
  77: [function(e, t, i) {
    "use strict";
    t.exports = function(e) {
      return e.reduce((e,t)=>(e[t] = t,
      e), {})
    }
  }
  , {}],
  78: [function(e, t, i) {
    "use strict";
    t.exports = function(e, t) {
      if ("string" != typeof e)
        return e;
      try {
        return (t || document).querySelector(e) || document.querySelector(e)
      } catch (e) {
        return !1
      }
    }
  }
  , {}],
  79: [function(e, t, i) {
    "use strict";
    const s = e(25).EventEmitterMicro
      , n = e(59)
      , r = {
      create: e(33),
      update: e(43),
      draw: e(39)
    }
      , a = ()=>{}
    ;
    let o = 0;
    t.exports = class extends s {
      constructor(e) {
        super(),
        this.el = e.el,
        this.gum = e.gum,
        this.componentName = e.componentName,
        this._keyframeController = null
      }
      destroy() {
        this.el = null,
        this.gum = null,
        this._keyframeController = null,
        super.destroy()
      }
      addKeyframe(e) {
        const t = e.el || this.el;
        return (e.group || this.anim).addKeyframe(t, e)
      }
      addDiscreteEvent(e) {
        e.event = e.event || "Generic-Event-Name-" + o++;
        let t = void 0 !== e.end && e.end !== e.start;
        const i = this.addKeyframe(e);
        return t ? (e.onEnterOnce && i.controller.once(e.event + ":enter", e.onEnterOnce),
        e.onExitOnce && i.controller.once(e.event + ":exit", e.onExitOnce),
        e.onEnter && i.controller.on(e.event + ":enter", e.onEnter),
        e.onExit && i.controller.on(e.event + ":exit", e.onExit)) : (e.onEventOnce && i.controller.once(e.event, e.onEventOnce),
        e.onEventReverseOnce && i.controller.once(e.event + ":reverse", e.onEventReverseOnce),
        e.onEvent && i.controller.on(e.event, e.onEvent),
        e.onEventReverse && i.controller.on(e.event + ":reverse", e.onEventReverse)),
        i
      }
      addRAFLoop(e) {
        let t = ["start", "end"];
        if (!t.every(t=>e.hasOwnProperty(t)))
          return void console.log("BubbleGum.BaseComponent::addRAFLoop required options are missing: " + t.join(" "));
        const i = new r.create;
        i.on("update", e.onUpdate || a),
        i.on("draw", e.onDraw || a),
        i.on("draw", ()=>i.run());
        const {onEnter: s, onExit: n} = e;
        return e.onEnter = ()=>{
          i.run(),
          s && s()
        }
        ,
        e.onExit = ()=>{
          i.cancel(),
          n && n()
        }
        ,
        this.addDiscreteEvent(e)
      }
      addContinuousEvent(e) {
        e.onDraw || console.log("BubbleGum.BaseComponent::addContinuousEvent required option `onDraw` is missing. Consider using a regular keyframe if you do not need a callback"),
        e.event = e.event || "Generic-Event-Name-" + o++;
        let t = this.addKeyframe(e);
        return t.controller.on(e.event, e.onDraw),
        t
      }
      mounted() {}
      onResizeImmediate(e) {}
      onResizeDebounced(e) {}
      onBreakpointChange(e) {}
      get anim() {
        return this.gum.anim
      }
      get keyframeController() {
        return this._keyframeController || (this._keyframeController = this.anim.getControllerForTarget(this.el))
      }
      get pageMetrics() {
        return n.pageMetrics
      }
    }
  }
  , {
    25: 25,
    33: 33,
    39: 39,
    43: 43,
    59: 59
  }],
  80: [function(e, t, i) {
    "use strict";
    const s = e(25).EventEmitterMicro
      , n = e(83)
      , r = e(52)
      , a = e(59)
      , o = e(81)
      , h = {};
    class l extends s {
      constructor(e, t={}) {
        super(),
        this.el = e,
        this.anim = r,
        this.componentAttribute = t.attribute || "data-component-list",
        this.components = [],
        this.componentsInitialized = !1,
        this.el.getAttribute("data-anim-scroll-group") || this.el.setAttribute("data-anim-scroll-group", "bubble-gum-group"),
        n.add(()=>{
          r.initialize().then(()=>{
            this.initComponents(),
            this.setupEvents(),
            this.components.forEach(e=>e.mounted()),
            this.trigger(l.EVENTS.DOM_COMPONENTS_MOUNTED)
          }
          )
        }
        )
      }
      initComponents() {
        const e = Array.prototype.slice.call(this.el.querySelectorAll("[".concat(this.componentAttribute, "]")));
        this.el.hasAttribute(this.componentAttribute) && e.push(this.el);
        for (let t = 0; t < e.length; t++) {
          let i = e[t]
            , s = i.getAttribute(this.componentAttribute).split(" ");
          for (let e = 0, t = s.length; e < t; e++) {
            let t = s[e];
            "" !== t && " " !== t && this.addComponent({
              el: i,
              componentName: t
            })
          }
        }
        this.componentsInitialized = !0
      }
      setupEvents() {
        this.onResizeDebounced = this.onResizeDebounced.bind(this),
        this.onResizeImmediate = this.onResizeImmediate.bind(this),
        this.onBreakpointChange = this.onBreakpointChange.bind(this),
        r.on(a.PageEvents.ON_RESIZE_IMMEDIATE, this.onResizeImmediate),
        r.on(a.PageEvents.ON_RESIZE_DEBOUNCED, this.onResizeDebounced),
        r.on(a.PageEvents.ON_BREAKPOINT_CHANGE, this.onBreakpointChange)
      }
      addComponent(e) {
        const {el: t, componentName: i, data: s} = e;
        if (!o.hasOwnProperty(i))
          throw "BubbleGum::addComponent could not add component to '" + t.className + "'. No component type '" + i + "' found!";
        const n = o[i];
        if (!l.componentIsSupported(n, i))
          return void 0 === h[i] && (console.log("BubbleGum::addComponent unsupported component '" + i + "'. Reason: '" + i + ".IS_SUPPORTED' returned false"),
          h[i] = !0),
          null;
        let r = t.dataset.componentList || "";
        r.includes(i) || (t.dataset.componentList = r.split(" ").concat(i).join(" "));
        let c = new n({
          el: t,
          data: s,
          componentName: e.componentName,
          gum: this,
          pageMetrics: a.pageMetrics
        });
        return this.components.push(c),
        this.componentsInitialized && c.mounted(),
        c
      }
      removeComponent(e) {
        const t = this.components.indexOf(e);
        -1 !== t && (this.components.splice(t, 1),
        e.el.dataset.componentList = e.el.dataset.componentList.split(" ").filter(t=>t !== e.componentName).join(" "),
        e.destroy())
      }
      getComponentOfType(e, t=document.documentElement) {
        const i = "[".concat(this.componentAttribute, "*=").concat(e, "]")
          , s = t.matches(i) ? t : t.querySelector(i);
        return s ? this.components.find(t=>t instanceof o[e] && t.el === s) : null
      }
      getComponentsOfType(e, t=document.documentElement) {
        const i = "[".concat(this.componentAttribute, "*=").concat(e, "]")
          , s = t.matches(i) ? [t] : Array.from(t.querySelectorAll(i));
        return this.components.filter(t=>t instanceof o[e] && s.includes(t.el))
      }
      getComponentsForElement(e) {
        return this.components.filter(t=>t.el === e)
      }
      onResizeImmediate() {
        this.components.forEach(e=>e.onResizeImmediate(a.pageMetrics))
      }
      onResizeDebounced() {
        this.components.forEach(e=>e.onResizeDebounced(a.pageMetrics))
      }
      onBreakpointChange() {
        this.components.forEach(e=>e.onBreakpointChange(a.pageMetrics))
      }
      static componentIsSupported(e, t) {
        const i = e.IS_SUPPORTED;
        if (void 0 === i)
          return !0;
        if ("function" != typeof i)
          return console.error('BubbleGum::addComponent error in "' + t + '".IS_SUPPORTED - it should be a function which returns true/false'),
          !0;
        const s = e.IS_SUPPORTED();
        return void 0 === s ? (console.error('BubbleGum::addComponent error in "' + t + '".IS_SUPPORTED - it should be a function which returns true/false'),
        !0) : s
      }
    }
    l.EVENTS = {
      DOM_COMPONENTS_MOUNTED: "DOM_COMPONENTS_MOUNTED"
    },
    t.exports = l
  }
  , {
    25: 25,
    52: 52,
    59: 59,
    81: 81,
    83: 83
  }],
  81: [function(e, t, i) {
    "use strict";
    t.exports = {
      BaseComponent: e(79)
    }
  }
  , {
    79: 79
  }],
  82: [function(e, t, i) {
    "use strict";
    "undefined" != typeof window && (window.DOMMatrix = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix);
    const s = 180 / Math.PI
      , n = e=>Math.round(1e6 * e) / 1e6;
    function r(e) {
      return Math.sqrt(e[0] * e[0] + e[1] * e[1] + e[2] * e[2])
    }
    function a(e, t) {
      return 0 === t ? Array.from(e) : [e[0] / t, e[1] / t, e[2] / t]
    }
    function o(e, t) {
      return e[0] * t[0] + e[1] * t[1] + e[2] * t[2]
    }
    function h(e, t, i, s) {
      return [e[0] * i + t[0] * s, e[1] * i + t[1] * s, e[2] * i + t[2] * s]
    }
    function l(e) {
      const t = new Float32Array(4)
        , i = new Float32Array(3)
        , l = new Float32Array(3)
        , c = new Float32Array(3);
      c[0] = e[3][0],
      c[1] = e[3][1],
      c[2] = e[3][2];
      const d = new Array(3);
      for (let t = 0; t < 3; t++)
        d[t] = e[t].slice(0, 3);
      i[0] = r(d[0]),
      d[0] = a(d[0], i[0]),
      l[0] = o(d[0], d[1]),
      d[1] = h(d[1], d[0], 1, -l[0]),
      i[1] = r(d[1]),
      d[1] = a(d[1], i[1]),
      l[0] /= i[1],
      l[1] = o(d[0], d[2]),
      d[2] = h(d[2], d[0], 1, -l[1]),
      l[2] = o(d[1], d[2]),
      d[2] = h(d[2], d[1], 1, -l[2]),
      i[2] = r(d[2]),
      d[2] = a(d[2], i[2]),
      l[1] /= i[2],
      l[2] /= i[2];
      const u = (m = d[1],
      p = d[2],
      [m[1] * p[2] - m[2] * p[1], m[2] * p[0] - m[0] * p[2], m[0] * p[1] - m[1] * p[0]]);
      var m, p;
      if (o(d[0], u) < 0)
        for (let e = 0; e < 3; e++)
          i[e] *= -1,
          d[e][0] *= -1,
          d[e][1] *= -1,
          d[e][2] *= -1;
      let f;
      return t[0] = .5 * Math.sqrt(Math.max(1 + d[0][0] - d[1][1] - d[2][2], 0)),
      t[1] = .5 * Math.sqrt(Math.max(1 - d[0][0] + d[1][1] - d[2][2], 0)),
      t[2] = .5 * Math.sqrt(Math.max(1 - d[0][0] - d[1][1] + d[2][2], 0)),
      t[3] = .5 * Math.sqrt(Math.max(1 + d[0][0] + d[1][1] + d[2][2], 0)),
      d[2][1] > d[1][2] && (t[0] = -t[0]),
      d[0][2] > d[2][0] && (t[1] = -t[1]),
      d[1][0] > d[0][1] && (t[2] = -t[2]),
      f = t[0] < .001 && t[0] >= 0 && t[1] < .001 && t[1] >= 0 ? [0, 0, n(180 * Math.atan2(d[0][1], d[0][0]) / Math.PI)] : function(e) {
        const [t,i,r,a] = e
          , o = t * t
          , h = i * i
          , l = r * r
          , c = t * i + r * a
          , d = a * a + o + h + l;
        return c > .49999 * d ? [0, 2 * Math.atan2(t, a) * s, 90] : c < -.49999 * d ? [0, -2 * Math.atan2(t, a) * s, -90] : [n(Math.atan2(2 * t * a - 2 * i * r, 1 - 2 * o - 2 * l) * s), n(Math.atan2(2 * i * a - 2 * t * r, 1 - 2 * h - 2 * l) * s), n(Math.asin(2 * t * i + 2 * r * a) * s)]
      }(t),
      {
        translation: c,
        rotation: f,
        eulerRotation: f,
        scale: [n(i[0]), n(i[1]), n(i[2])]
      }
    }
    t.exports = function(e) {
      e instanceof Element && (e = String(getComputedStyle(e).transform).trim());
      let t = new DOMMatrix(e);
      const i = new Array(4);
      for (let e = 1; e < 5; e++) {
        const s = i[e - 1] = new Float32Array(4);
        for (let i = 1; i < 5; i++)
          s[i - 1] = t["m".concat(e).concat(i)]
      }
      return l(i)
    }
  }
  , {}],
  83: [function(e, t, i) {
    "use strict";
    let s = !1
      , n = !1
      , r = []
      , a = -1;
    t.exports = {
      NUMBER_OF_FRAMES_TO_WAIT: 30,
      add: function(e) {
        if (n && e(),
        r.push(e),
        s)
          return;
        s = !0;
        let t = document.documentElement.scrollHeight
          , i = 0;
        const o = ()=>{
          let e = document.documentElement.scrollHeight;
          if (t !== e)
            i = 0;
          else if (i++,
          i >= this.NUMBER_OF_FRAMES_TO_WAIT)
            return void r.forEach(e=>e());
          t = e,
          a = requestAnimationFrame(o)
        }
        ;
        a = requestAnimationFrame(o)
      },
      reset() {
        cancelAnimationFrame(a),
        s = !1,
        n = !1,
        r = []
      }
    }
  }
  , {}],
  84: [function(e, t, i) {
    "use strict";
    t.exports = {
      getWindow: function() {
        return window
      },
      getDocument: function() {
        return document
      },
      getNavigator: function() {
        return navigator
      }
    }
  }
  , {}],
  85: [function(e, t, i) {
    "use strict";
    var s = e(84)
      , n = e(86);
    function r() {
      var e = s.getWindow()
        , t = s.getDocument()
        , i = s.getNavigator();
      return !!("ontouchstart"in e || e.DocumentTouch && t instanceof e.DocumentTouch || i.maxTouchPoints > 0 || i.msMaxTouchPoints > 0)
    }
    t.exports = n(r),
    t.exports.original = r
  }
  , {
    84: 84,
    86: 86
  }],
  86: [function(e, t, i) {
    "use strict";
    t.exports = function(e) {
      var t;
      return function() {
        return void 0 === t && (t = e.apply(this, arguments)),
        t
      }
    }
  }
  , {}],
  87: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = i.pluginCache = void 0;
    var n = s(e(26))
      , r = s(e(98))
      , a = s(e(88))
      , o = s(e(90));
    const h = {};
    i.pluginCache = h;
    const l = [];
    let c = 1;
    class d extends n.default {
      constructor(e={}) {
        super(),
        this.el = e.el || document.createElement("video"),
        this.id = e.id || this.el.id || this.el.dataset.inlineMediaId || "inlineMedia-".concat(c++);
        const t = (e.plugins || []).concat(r.default);
        this._initPlugins(t, e),
        l.push(this)
      }
      async load(e) {
        for (const t of this.plugins)
          if ("function" == typeof t.load)
            return t.load(e)
      }
      abortLoad() {
        for (const e of this.plugins)
          if ("function" == typeof e.abortLoad) {
            e.abortLoad();
            break
          }
      }
      async play() {
        for (const e of this.plugins)
          if ("function" == typeof e.play)
            return e.play()
      }
      get src() {
        for (const e of this.plugins)
          if (e.src)
            return e.src;
        return ""
      }
      get playbackState() {
        for (const e of this.plugins) {
          const t = e.playbackState;
          if (void 0 !== t)
            return t
        }
      }
      get loadingState() {
        for (const e of this.plugins) {
          const t = e.loadingState;
          if (void 0 !== t)
            return t
        }
      }
      _initPlugins(e, t) {
        this.plugins = [],
        this.pluginMap = new Map;
        for (let i of e) {
          if ("string" == typeof i) {
            if (!h[i])
              throw new Error("Trying to use undefined Plugin named: ".concat(i, " . Ensure you call Media.addPlugin() first!"));
            i = h[i]
          }
          if (!1 !== i.isSupported) {
            const e = new i(Object.assign({
              media: this
            }, t));
            this.plugins.push(e),
            this.pluginMap.set(i, e)
          }
        }
        this.trigger(o.default.MOUNTED)
      }
      destroy() {
        if (!this._destroyed) {
          for (const e of this.plugins)
            "function" == typeof e.destroy && e.destroy();
          super.destroy(),
          l.splice(l.indexOf(this), 1),
          this._destroyed = !0
        }
      }
      static get medias() {
        return l
      }
      static addPlugin(e, t) {
        h[e] = t
      }
      static async autoInitialize(e=document, t={}) {
        return (0,
        a.default)(e, t)
      }
    }
    var u = d;
    i.default = u
  }
  , {
    26: 26,
    29: 29,
    88: 88,
    90: 90,
    98: 98
  }],
  88: [function(e, t, i) {
    "use strict";
    var s = e(29)
      , n = e(30);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = async function(e=document, t={}) {
      e || (e = document);
      const i = e.querySelectorAll("[".concat("data-inline-media", "]"))
        , s = [];
      for (let e of i) {
        const i = e.dataset
          , n = i.inlineMediaPlugins ? i.inlineMediaPlugins.split(",").map(e=>e.trim()) : []
          , o = [];
        for (const e of n)
          if (!r.pluginCache[e]) {
            if (!a.default[e])
              throw new Error("Error Trying to use undefined Plugin named: ".concat(e, " . Ensure you call Media.addPlugin() first to register this custom plugin!"));
            o.push(async()=>{
              const t = (await a.default[e]()).default;
              r.default.addPlugin(e, t)
            }
            )
          }
        await Promise.all(o.map(async e=>e())),
        s.push(new r.default(Object.assign({
          el: e,
          plugins: n.map(e=>r.pluginCache[e])
        }, t)))
      }
      return s
    }
    ;
    var r = n(e(87))
      , a = s(e(94))
  }
  , {
    29: 29,
    30: 30,
    87: 87,
    94: 94
  }],
  89: [function(e, t, i) {
    "use strict";
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    i.default = {
      EMPTY: "loading-empty",
      LOADING: "loading",
      LOADED: "loaded",
      ERROR: "loading-error",
      DISABLED: "loading-disabled"
    }
  }
  , {}],
  90: [function(e, t, i) {
    "use strict";
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    i.default = {
      MOUNTED: "MOUNTED",
      MEDIA_LOAD_START: "MEDIA_LOAD_START",
      MEDIA_LOAD_COMPLETE: "MEDIA_LOAD_COMPLETE",
      MEDIA_LOAD_ERROR: "MEDIA_LOAD_ERROR",
      PLAYBACK_STATE_CHANGE: "PLAYBACK_STATE_CHANGE",
      LOADING_STATE_CHANGE: "LOADING_STATE_CHANGE"
    }
  }
  , {}],
  91: [function(e, t, i) {
    "use strict";
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    i.default = {
      LOAD_START: "loadstart",
      LOADED_DATA: "loadeddata",
      LOADED_METADATA: "loadedmetadata",
      CAN_PLAY: "canplay",
      CAN_PLAY_THROUGH: "canplaythrough",
      PLAY: "play",
      PLAYING: "playing",
      PAUSE: "pause",
      WAITING: "waiting",
      SEEKING: "seeking",
      SEEKED: "seeked",
      ERROR: "error",
      ENDED: "ended",
      ABORT: "abort"
    }
  }
  , {}],
  92: [function(e, t, i) {
    "use strict";
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    i.default = {
      IDLE: "idle",
      PLAYING: "playing",
      PAUSED: "paused",
      ENDED: "ended"
    }
  }
  , {}],
  93: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    Object.defineProperty(i, "Media", {
      enumerable: !0,
      get: function() {
        return n.default
      }
    }),
    Object.defineProperty(i, "default", {
      enumerable: !0,
      get: function() {
        return n.default
      }
    }),
    Object.defineProperty(i, "Plugin", {
      enumerable: !0,
      get: function() {
        return r.default
      }
    }),
    i.autoInit = void 0;
    var n = s(e(87))
      , r = s(e(100));
    const a = n.default.autoInitialize;
    i.autoInit = a
  }
  , {
    100: 100,
    29: 29,
    87: 87
  }],
  94: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var n = s(e(30));
    var r = {
      AnimLoad: async()=>Promise.resolve().then(()=>(0,
      n.default)(e(101))),
      AnimPlay: async()=>Promise.resolve().then(()=>(0,
      n.default)(e(102))),
      FeatureObserver: async()=>Promise.resolve().then(()=>(0,
      n.default)(e(104))),
      LoadTimeout: async()=>Promise.resolve().then(()=>(0,
      n.default)(e(106))),
      PlayPauseButton: async()=>Promise.resolve().then(()=>(0,
      n.default)(e(108))),
      ViewportSource: async()=>Promise.resolve().then(()=>(0,
      n.default)(e(111)))
    };
    i.default = r
  }
  , {
    101: 101,
    102: 102,
    104: 104,
    106: 106,
    108: 108,
    111: 111,
    29: 29,
    30: 30
  }],
  95: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var n = s(e(100))
      , r = s(e(92))
      , a = s(e(89))
      , o = s(e(91))
      , h = s(e(90));
    const l = [o.default.LOADED_DATA, o.default.LOAD_START, o.default.CAN_PLAY, o.default.CAN_PLAY_THROUGH, o.default.PLAY, o.default.PLAYING, o.default.PAUSE, o.default.WAITING, o.default.SEEKING, o.default.SEEKED, o.default.ERROR, o.default.ENDED];
    class c extends n.default {
      constructor(e) {
        super(e),
        this._container = e.container || this.media.el.parentElement,
        this._playbackState = r.default.IDLE,
        this._loadingState = a.default.EMPTY,
        this._elementsToDecorate = [],
        this._container && this._elementsToDecorate.push(this._container),
        this.media.id && this._elementsToDecorate.push(...Array.from(document.querySelectorAll("[data-inline-media-controller={id}]".replace("{id}", this.media.id))));
        for (const e of this._elementsToDecorate)
          e.classList.add(this._playbackState),
          e.classList.add(this._loadingState);
        this.updateState = this.updateState.bind(this),
        this._addEventListeners()
      }
      _addEventListeners() {
        for (let e of l)
          this.media.el.addEventListener(e, this.updateState);
        this.media.on(h.default.LOADING_STATE_CHANGE, this.updateState),
        this.media.on(h.default.PLAYBACK_STATE_CHANGE, this.updateState)
      }
      _removeEventListeners() {
        for (let e of l)
          this.media.el.removeEventListener(e, this.updateState);
        this.media.off(h.default.LOADING_STATE_CHANGE, this.updateState),
        this.media.off(h.default.PLAYBACK_STATE_CHANGE, this.updateState)
      }
      updateState(e) {
        const t = this.media.playbackState
          , i = this._playbackState
          , s = this.media.loadingState
          , n = this._loadingState;
        if (this._playbackState = t,
        this._loadingState = s,
        t !== i) {
          for (const e of this._elementsToDecorate)
            e.classList.add(t),
            e.classList.remove(i);
          this.media.trigger(h.default.PLAYBACK_STATE_CHANGE)
        }
        if (s !== n) {
          for (const e of this._elementsToDecorate)
            e.classList.add(s),
            e.classList.remove(n);
          this.media.trigger(h.default.LOADING_STATE_CHANGE)
        }
      }
      destroy() {
        for (const e of this._elementsToDecorate)
          e.classList.remove(this._playbackState),
          e.classList.remove(this._loadingState);
        this._removeEventListeners(),
        super.destroy()
      }
    }
    var d = c;
    i.default = d
  }
  , {
    100: 100,
    29: 29,
    89: 89,
    90: 90,
    91: 91,
    92: 92
  }],
  96: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var n = s(e(100))
      , r = s(e(91))
      , a = s(e(90))
      , o = s(e(89))
      , h = s(e(24))
      , l = s(e(150));
    const c = r.default.CAN_PLAY_THROUGH
      , {HAVE_NOTHING: d, HAVE_CURRENT_DATA: u, NETWORK_EMPTY: m} = HTMLMediaElement;
    class p extends n.default {
      constructor(e) {
        super(e),
        this._loadCompleteEvent = e.loadCompleteEvent || c,
        this._onLoaded = this._onLoaded.bind(this),
        this._onError = this._onError.bind(this)
      }
      mounted() {
        "none" !== this.media.el.preload && this.media.src && (async()=>{
          try {
            await this.media.load(this.media.src)
          } catch (e) {
            (0,
            h.default)("auto load of ".concat(this.media.src, " failed or was aborted with err:").concat(e))
          }
        }
        )()
      }
      async load(e) {
        if (void 0 === e && this.media.src && (e = this.media.src),
        !e)
          throw new Error("No Media src was specified, can not fullfill load() request");
        return e !== this._currentLoadUrl && (this.media.trigger(a.default.MEDIA_LOAD_START),
        this._currentLoadUrl = e,
        this._pendingPromise = new Promise((t,i)=>{
          this._resolvePendingPromise = ()=>{
            this._resolvePendingPromise = null,
            this._rejectPendingPromise = null,
            t()
          }
          ,
          this._rejectPendingPromise = ()=>{
            this._resolvePendingPromise = null,
            this._rejectPendingPromise = null,
            i()
          }
          ,
          this.media.el.addEventListener(this._loadCompleteEvent, this._onLoaded),
          l.default.browser.firefox && "canplaythrough" === this._loadCompleteEvent && this.media.el.addEventListener("canplay", this._onLoaded),
          this.media.el.addEventListener(r.default.ERROR, this._onError),
          this.media.el.addEventListener(r.default.ABORT, this._onError),
          this.media.el.src = e,
          this.media.el.load()
        }
        )),
        this._pendingPromise
      }
      _clearLoadListeners() {
        this.media.el.removeEventListener(this._loadCompleteEvent, this._onLoaded),
        this.media.el.removeEventListener("canplay", this._onLoaded),
        this.media.el.removeEventListener(r.default.ERROR, this._onError),
        this.media.el.removeEventListener(r.default.ABORT, this._onError)
      }
      _onLoaded() {
        this._clearLoadListeners(),
        this.media.trigger(a.default.LOADING_STATE_CHANGE),
        this.media.trigger(a.default.MEDIA_LOAD_COMPLETE),
        this._resolvePendingPromise()
      }
      _onError() {
        this._clearLoadListeners(),
        this.media.trigger(a.default.MEDIA_LOAD_ERROR),
        this.media.trigger(a.default.LOADING_STATE_CHANGE),
        this._rejectPendingPromise()
      }
      abortLoad() {
        this._rejectPendingPromise && this._rejectPendingPromise()
      }
      get loadingState() {
        return this.media.el.error ? o.default.ERROR : this.media.el.networkState === m && this.media.el.readyState === d ? o.default.EMPTY : this.media.el.readyState < u ? o.default.LOADING : o.default.LOADED
      }
      destroy() {
        this._clearLoadListeners(),
        super.destroy()
      }
    }
    var f = p;
    i.default = f
  }
  , {
    100: 100,
    150: 150,
    24: 24,
    29: 29,
    89: 89,
    90: 90,
    91: 91
  }],
  97: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var n = s(e(100))
      , r = s(e(92));
    const {HAVE_METADATA: a, HAVE_CURRENT_DATA: o} = HTMLVideoElement;
    class h extends n.default {
      constructor(e) {
        super(e),
        this._initialize()
      }
      _initialize() {
        this.media.el.playsInline = !0,
        this.media.el.autoplay && (this._autoPlayTimer = setTimeout(()=>this.media.play()))
      }
      async play() {
        this.media.el.readyState < a && await this.media.load(),
        await this.media.el.play()
      }
      get playbackState() {
        return this.media.el.ended ? r.default.ENDED : this.media.el.paused && !this.media.el.ended ? r.default.PAUSED : r.default.PLAYING
      }
      destroy() {
        clearTimeout(this._autoPlayTimer),
        super.destroy()
      }
    }
    var l = h;
    i.default = l
  }
  , {
    100: 100,
    29: 29,
    92: 92
  }],
  98: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var n = s(e(99))
      , r = s(e(96))
      , a = s(e(97))
      , o = s(e(95))
      , h = [n.default, r.default, a.default, o.default];
    i.default = h
  }
  , {
    29: 29,
    95: 95,
    96: 96,
    97: 97,
    99: 99
  }],
  99: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var n = s(e(100));
    class r extends n.default {
      get src() {
        return this.media.el.currentSrc
      }
    }
    var a = r;
    i.default = a
  }
  , {
    100: 100,
    29: 29
  }],
  100: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var n = s(e(90));
    var r = class {
      constructor(e) {
        this.options = e,
        this.media = e.media,
        this.mounted = this.mounted.bind(this),
        this.media.on(n.default.MOUNTED, this.mounted)
      }
      mounted() {}
      static get isSupported() {
        return !0
      }
      destroy() {}
    }
    ;
    i.default = r
  }
  , {
    29: 29,
    90: 90
  }],
  101: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var n = s(e(113))
      , r = s(e(100))
      , a = s(e(24));
    const o = {
      start: "t - 200vh",
      end: "b + 100vh"
    };
    class h extends r.default {
      constructor(e) {
        super(e),
        this._anim = e.anim,
        this._container = e.container || this.media.el.parentElement,
        this._scrollGroup = this.options.scrollGroup || this._anim.getGroupForTarget(this._container || this.media.el),
        this._initialize()
      }
      _initialize() {
        this._onLoadKeyframeEnter = this._onLoadKeyframeEnter.bind(this),
        this._onLoadKeyframeExit = this._onLoadKeyframeExit.bind(this);
        const e = (0,
        n.default)(this.media.el.dataset, this.options, "loadKeyframe", o);
        e.event || (e.event = "inline-media-load-kf"),
        this._loadKeyframe = this._scrollGroup.addKeyframe(this.media.el, e),
        this._loadKeyframe.controller.on("".concat(this._loadKeyframe.event, ":enter"), this._onLoadKeyframeEnter),
        this._loadKeyframe.controller.on("".concat(this._loadKeyframe.event, ":exit"), this._onLoadKeyframeExit)
      }
      get loadKeyframe() {
        return this._loadKeyframe
      }
      async _onLoadKeyframeEnter(e) {
        try {
          await this.media.load(),
          this._loaded = !0
        } catch (e) {
          (0,
          a.default)("AnimLoad: Load error occured")
        }
      }
      _onLoadKeyframeExit(e) {}
      destroy() {
        this._loadKeyframe.controller.off("".concat(this._loadKeyframe.event, ":enter"), this._onLoadKeyframeEnter),
        this._loadKeyframe.controller.off("".concat(this._loadKeyframe.event, ":exit"), this._onLoadKeyframeExit),
        super.destroy()
      }
    }
    i.default = h
  }
  , {
    100: 100,
    113: 113,
    24: 24,
    29: 29
  }],
  102: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var n = s(e(90))
      , r = s(e(113))
      , a = s(e(100));
    const o = {
      start: "t - 100vh",
      end: "b"
    };
    class h extends a.default {
      constructor(e) {
        super(e),
        this._anim = e.anim,
        this._container = e.container || this.media.el.parentElement,
        this._scrollGroup = this.options.scrollGroup || this._anim.getGroupForTarget(this._container || this.media.el),
        this._initialize()
      }
      _initialize() {
        this._onPlayKeyframeEnter = this._onPlayKeyframeEnter.bind(this),
        this._onPlayKeyframeExit = this._onPlayKeyframeExit.bind(this);
        const e = this.media.el.dataset;
        if (this._autoPlayWithReducedMotion = (0,
        r.default)(e, this.options, "autoPlayWithReducedMotion", !1),
        !this._autoPlayWithReducedMotion && h.prefersReducedMotion)
          return;
        this._pauseOnExit = (0,
        r.default)(e, this.options, "pauseOnExit", !1),
        this._resetOnExit = (0,
        r.default)(e, this.options, "resetOnExit", !1);
        const t = (0,
        r.default)(e, this.options, "playKeyframe", o);
        t.event || (t.event = "inline-media-play-kf"),
        this._playKeyframe = this._scrollGroup.addKeyframe(this.media.el, t),
        this._playKeyframe.controller.on("".concat(this._playKeyframe.event, ":enter"), this._onPlayKeyframeEnter),
        this._playKeyframe.controller.on("".concat(this._playKeyframe.event, ":exit"), this._onPlayKeyframeExit),
        this._onLoadStart = this._onLoadStart.bind(this),
        this.media.on(n.default.MEDIA_LOAD_START, this._onLoadStart)
      }
      _onLoadStart() {
        this._loaded = !1
      }
      async _onPlayKeyframeEnter(e) {
        if (this._inFrame = !0,
        !this._paused && (this._loaded || (await this.media.load(),
        this._loaded = !0),
        this._inFrame))
          try {
            await this.media.play()
          } catch (e) {}
      }
      _onPlayKeyframeExit(e) {
        this._inFrame = !1,
        this._loaded && this.media.el.paused && !this.media.el.ended ? this._paused = !0 : this._pauseOnExit && (this._paused = !1,
        this.media.el.pause()),
        this._loaded && this._resetOnExit && (this.media.el.currentTime = 0)
      }
      get playKeyframe() {
        return this._playKeyframe
      }
      destroy() {
        this._playKeyframe.controller.off("".concat(this._playKeyframe.event, ":enter"), this._onPlayKeyframeEnter),
        this._playKeyframe.controller.off("".concat(this._playKeyframe.event, ":exit"), this._onPlayKeyframeExit),
        this.media.off(n.default.MEDIA_LOAD_START, this._onLoadStart),
        super.destroy()
      }
      static get prefersReducedMotion() {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      }
    }
    i.default = h
  }
  , {
    100: 100,
    113: 113,
    29: 29,
    90: 90
  }],
  103: [function(e, t, i) {
    "use strict";
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var s = class {
      constructor(e) {
        this.featureClass = e.featureClass,
        this._callback = e.callback,
        this._isPresent = !1,
        this._wasPresent = !1
      }
      get presenceChanged() {
        return this._isPresent !== this._wasPresent
      }
      get isPresent() {
        return this._isPresent
      }
      updatePresence(e) {
        this._wasPresent = this._isPresent,
        this._isPresent = e.contains(this.featureClass)
      }
      triggerCallback(e) {
        return this._callback(e)
      }
    }
    ;
    i.default = s
  }
  , {}],
  104: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var n = s(e(100))
      , r = s(e(92))
      , a = s(e(89))
      , o = s(e(90))
      , h = s(e(105))
      , l = s(e(103));
    const c = e=>e
      , d = e=>e ? e.split(",").map(e=>e.trim()) : null;
    class u extends n.default {
      constructor(e) {
        super(e);
        const t = (t,i,s)=>{
          let n = "inlineMedia" + t[0].toUpperCase() + t.slice(1);
          return i(this.media.el.dataset[n]) || e[t] || s
        }
        ;
        this._disabledStates = new h.default({
          features: t("disabledWhen", d, []),
          onActivate: this.disable.bind(this),
          onDeactivate: this.enable.bind(this)
        }),
        this._destroyStates = new h.default({
          features: t("destroyWhen", d, []),
          onActivate: this.destroyMedia.bind(this)
        }),
        this._pausedStates = new h.default({
          features: t("pausedWhen", d, []),
          onActivate: this.pauseMedia.bind(this)
        }),
        this._autoplayStates = new h.default({
          features: t("autoplayWhen", d, []),
          onActivate: this.autoplayMedia.bind(this),
          onDeactivate: this.disableAutoplay.bind(this)
        });
        const i = e.featureDetect || {};
        var s;
        this.featureCallbacks = Object.entries(i).map(([e,t])=>new l.default({
          featureClass: e,
          callback: t
        })),
        this._featureElement = (s = t("featureElement", c, document.documentElement))instanceof HTMLElement ? s : document.querySelector(s),
        this.featureSets = [this._autoplayStates, this._pausedStates, this._disabledStates, this._destroyStates],
        this._featuresUpdated = this._featuresUpdated.bind(this),
        this.play = !1,
        this._observer = new MutationObserver(this._featuresUpdated),
        this._observer.observe(this._featureElement, {
          attributes: !0,
          attributeFilter: ["class"]
        }),
        this._featuresUpdated()
      }
      get loadingState() {
        return this._disabledStates.isDetected ? a.default.DISABLED : void 0
      }
      get playbackState() {
        return this._disabledStates.isDetected ? r.default.PAUSED : void 0
      }
      _featuresUpdated() {
        let e = this._featureElement.classList;
        this.featureSets.filter(t=>(t.updateFeatureState(e),
        t.detectionChanged)).forEach(e=>e.applyEffect()),
        this.featureCallbacks.forEach(t=>{
          t.updatePresence(e),
          t.isPresent && t.presenceChanged && t.triggerCallback(this.media)
        }
        )
      }
      autoplayMedia() {
        this.media.el.setAttribute("autoplay", !0),
        this.media.play()
      }
      disableAutoplay() {
        this.media.el.setAttribute("autoplay", !1)
      }
      pauseMedia() {
        this.media.el.pause()
      }
      destroyMedia() {
        this.media.destroy()
      }
      destroy() {
        this._observer.disconnect()
      }
      disable() {
        this.media.abortLoad(),
        this.media.el.pause(),
        this.play = c,
        this.media.trigger(o.default.LOADING_STATE_CHANGE),
        this.media.trigger(o.default.PLAYBACK_STATE_CHANGE)
      }
      enable() {
        this.play = !1,
        this.media.trigger(o.default.LOADING_STATE_CHANGE),
        this.media.trigger(o.default.PLAYBACK_STATE_CHANGE)
      }
    }
    var m = u;
    i.default = m
  }
  , {
    100: 100,
    103: 103,
    105: 105,
    29: 29,
    89: 89,
    90: 90,
    92: 92
  }],
  105: [function(e, t, i) {
    "use strict";
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    const s = ()=>{}
    ;
    var n = class {
      constructor(e) {
        var t;
        this._features = new Set((t = e.features,
        Array.isArray(t) ? t : t ? [t] : [])),
        this._isDetected = !1,
        this._wasDetected = !1,
        this._onActivate = e.onActivate || s,
        this._onDeactivate = e.onDeactivate || s
      }
      get detectionChanged() {
        return this._isDetected !== this._wasDetected
      }
      get isDetected() {
        return this._isDetected
      }
      updateFeatureState(e) {
        this._wasDetected = this._isDetected;
        for (let t of e)
          if (this._features.has(t))
            return void (this._isDetected = !0);
        this._isDetected = !1
      }
      applyEffect() {
        this._isDetected ? this._onActivate() : this._onDeactivate()
      }
    }
    ;
    i.default = n
  }
  , {}],
  106: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var n = s(e(100))
      , r = s(e(90));
    class a extends n.default {
      static get LOAD_TIMEOUT_EVENT() {
        return "inline-media-timeout"
      }
      constructor(e) {
        super(e);
        const t = this.media.el.dataset;
        this._timeoutDelay = t.loadTimeout || e.loadTimeout || 3e4,
        this._onLoadStart = this._onLoadStart.bind(this),
        this._onLoadComplete = this._onLoadComplete.bind(this),
        this._onTimerComplete = this._onTimerComplete.bind(this),
        this.media.on(r.default.MEDIA_LOAD_START, this._onLoadStart),
        this.media.on(r.default.MEDIA_LOAD_COMPLETE, this._onLoadComplete)
      }
      _onLoadStart() {
        clearTimeout(this._timer),
        this._timer = setTimeout(this._onTimerComplete, this._timeoutDelay)
      }
      _onLoadComplete() {
        clearTimeout(this._timer)
      }
      _onTimerComplete() {
        this.media.trigger("inline-media-timeout"),
        this.media.destroy(),
        this.media.el.parentElement && this.media.el.parentElement.removeChild(this.media.el)
      }
      destroy() {
        clearTimeout(this._timer),
        this.media.off(r.default.MEDIA_LOAD_START, this._onLoadStart)
      }
    }
    i.default = a
  }
  , {
    100: 100,
    29: 29,
    90: 90
  }],
  107: [function(e, t, i) {
    "use strict";
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    i.default = {
      S: "small",
      M: "medium",
      L: "large",
      X: "xlarge"
    }
  }
  , {}],
  108: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var n = s(e(100))
      , r = s(e(90))
      , a = s(e(92));
    const o = "Pause"
      , h = "Play"
      , l = {
      CLICK: "data-analytics-click",
      TITLE: "data-analytics-title"
    };
    class c extends n.default {
      constructor(e) {
        super(e),
        this._container = e.container || this.media.el.parentElement,
        this._button = this._findButton(),
        this._onClick = this._onClick.bind(this),
        this._onPlaybackStateChange = this._onPlaybackStateChange.bind(this);
        const t = this._button.dataset;
        this._ariaLabels = {
          playing: t.ariaPlaying || e.ariaPlaying || o,
          paused: t.ariaPaused || e.ariaPaused || h
        },
        this._button.addEventListener("click", this._onClick),
        this.media.on(r.default.PLAYBACK_STATE_CHANGE, this._onPlaybackStateChange),
        this._activeAnalytics = Object.values(l).filter(e=>this._button.hasAttribute(e + "-play") && this._button.hasAttribute(e + "-pause"))
      }
      _findButton() {
        if (this.options.playPauseButton)
          return this.options.playPauseButton;
        let e = this._container.querySelector("".concat('[data-inline-media-control="PlayPause"]'));
        if (!e) {
          const t = document.querySelectorAll("[data-inline-media-controller='{id}']".replace("{id}", this.media.id));
          for (const i of t)
            e = "PlayPause" === i.getAttribute("data-inline-media-control") ? i : i.querySelector("".concat('[data-inline-media-control="PlayPause"]'))
        }
        return e
      }
      _onPlaybackStateChange() {
        const e = this.media.playbackState === a.default.PLAYING;
        e ? this._button.setAttribute("aria-label", this._ariaLabels.playing) : this._button.setAttribute("aria-label", this._ariaLabels.paused),
        this._setAnalyticsState(e)
      }
      _setAnalyticsState(e) {
        const t = e ? "pause" : "play";
        this._activeAnalytics.forEach(e=>this._button.setAttribute(e, this._button.getAttribute(e + "-".concat(t))))
      }
      _onClick(e) {
        this.media.el.paused ? this.media.play() : this.media.el.pause()
      }
      destroy() {
        this._button.removeEventListener("click", this._onClick),
        this.media.off(r.default.PLAYBACK_STATE_CHANGE, this._onPlaybackStateChange)
      }
    }
    i.default = c
  }
  , {
    100: 100,
    29: 29,
    90: 90,
    92: 92
  }],
  109: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var n = s(e(112));
    i.default = class {
      constructor(e) {
        this._breakpoints = e.breakpoints || n.default,
        this.options = e,
        this._initialize()
      }
      _initialize() {
        this._updateBreakpoint = this._updateBreakpoint.bind(this),
        this._callback = this.options.callback,
        this._mediaQueries = Object.keys(this._breakpoints).map(e=>window.matchMedia("(min-width: ".concat(this._breakpoints[e], "px)"))),
        this._addEventListeners(),
        this._updateBreakpoint()
      }
      _addEventListeners() {
        for (const e of this._mediaQueries)
          e.addListener(this._updateBreakpoint)
      }
      _removeEventListeners() {
        for (const e of this._mediaQueries)
          e.removeListener(this._updateBreakpoint)
      }
      _updateBreakpoint() {
        const e = Object.keys(this._breakpoints);
        let t = e[0];
        for (let i = 1; i < e.length - 1; i++) {
          if (!this._mediaQueries[i].matches)
            break;
          t = e[i]
        }
        let i = !1;
        this._currentBreakpoint && this._currentBreakpoint !== t && (i = !0),
        this._currentBreakpoint = t,
        i && this._callback()
      }
      get breakpoint() {
        return this._currentBreakpoint
      }
      destroy() {
        this._removeEventListeners()
      }
    }
  }
  , {
    112: 112,
    29: 29
  }],
  110: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var n = s(e(109))
      , r = s(e(107));
    class a extends n.default {
      constructor(e) {
        super(e)
      }
      _initialize() {
        this._anim = this.options.anim,
        this._bpMap = this.options.animBreakpointMap || r.default,
        this._updateBreakpoint = this._updateBreakpoint.bind(this),
        this._callback = this.options.callback,
        this._addEventListeners(),
        this._updateBreakpoint()
      }
      _addEventListeners() {
        this._anim.on("ON_BREAKPOINT_CHANGE", this._updateBreakpoint)
      }
      _removeEventListeners() {
        this._anim.off("ON_BREAKPOINT_CHANGE", this._updateBreakpoint)
      }
      _updateBreakpoint() {
        const e = this._bpMap[this._anim.model.pageMetrics.breakpoint];
        let t = !1;
        this._currentBreakpoint && this._currentBreakpoint !== e && (t = !0),
        this._currentBreakpoint = e,
        t && this._callback()
      }
      destroy() {
        super.destroy()
      }
    }
    i.default = a
  }
  , {
    107: 107,
    109: 109,
    29: 29
  }],
  111: [function(e, t, i) {
    "use strict";
    var s = e(29);
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    var n = s(e(100))
      , r = s(e(109))
      , a = s(e(110))
      , o = (s(e(24)),
    s(e(17)),
    s(e(89)));
    class h extends n.default {
      constructor(e) {
        super(e),
        this._cachedPlaying = null,
        this._initialize()
      }
      _initialize() {
        this._onBreakpointChange = this._onBreakpointChange.bind(this);
        const e = Object.assign({
          callback: this._onBreakpointChange
        }, this.options);
        this._breakpointDetect = e.anim ? new a.default(e) : new r.default(e),
        this._currentTime = 0;
        const t = this.media.el.dataset;
        this._basePath = this.options.basePath || t.inlineMediaBasepath || "./",
        this._onBreakpointChange()
      }
      _onBreakpointChange() {
        this._currentBreakpoint = this._breakpointDetect.breakpoint;
        const e = window.devicePixelRatio > 1 ? "".concat(this._currentBreakpoint, "_2x") : this._currentBreakpoint
          , t = "".concat(this._basePath).concat(e, ".").concat("mp4");
        this._swapSrc(t)
      }
      get src() {
        return this._src
      }
      async _swapSrc(e) {
        if (this._src = e,
        this.media.loadingState === o.default.EMPTY)
          return;
        const t = null !== this._cachedPlaying ? this._cachedPlaying : !this.media.el.paused;
        return this.media.loadingState === o.default.LOADED && (this._currentTime = this.media.el.currentTime),
        this._cachedPlaying = t,
        await this.media.load("".concat(e, "#t=").concat(this._currentTime)),
        this._cachedPlaying = null,
        t ? this.media.play() : Promise.resolve()
      }
      destroy() {
        this._breakpointDetect.destroy(),
        super.destroy()
      }
    }
    i.default = h
  }
  , {
    100: 100,
    109: 109,
    110: 110,
    17: 17,
    24: 24,
    29: 29,
    89: 89
  }],
  112: [function(e, t, i) {
    "use strict";
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = void 0;
    i.default = {
      small: 0,
      medium: 570,
      large: 780,
      xlarge: 1280
    }
  }
  , {}],
  113: [function(e, t, i) {
    "use strict";
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.default = function(e, t, i, s) {
      const n = i[0].toUpperCase() + i.slice(1)
        , r = e["inlineMedia" + n];
      if (void 0 !== r)
        switch (typeof s) {
        case "boolean":
          return "false" !== r;
        case "object":
          return JSON.parse(r);
        case "number":
          return Number(r);
        default:
          return r
        }
      else if (void 0 !== t[i]) {
        const e = t[i];
        return "boolean" != typeof s || "false" !== e && "true" !== e ? e : "false" !== e
      }
      return s
    }
  }
  , {}],
  114: [function(e, t, i) {
    "use strict";
    t.exports = {
      PICTURE_DATA_DOWNLOAD_AREA_KEYFRAME: "data-download-area-keyframe",
      PICTURE_DATA_LAZY: "data-lazy",
      PICTURE_DATA_EMPTY_SOURCE: "data-empty",
      PICTURE_DATA_LOADED: "data-picture-loaded",
      PICTURE_CLASS_LOADED: "loaded"
    }
  }
  , {}],
  115: [function(e, t, i) {
    "use strict";
    const s = e(114).PICTURE_CLASS_LOADED
      , n = e(114).PICTURE_DATA_LOADED
      , r = e(114).PICTURE_DATA_EMPTY_SOURCE;
    t.exports = (window.__pictureElementInstancesLoaded = new Map,
    void (window.__lp = function(e) {
      const t = e.target.parentElement;
      t.querySelector("[".concat(r, "]")) ? e.stopImmediatePropagation() : (t.classList.add("".concat(s)),
      t.setAttribute("".concat(n), ""),
      window.__pictureElementInstancesLoaded.set(t.id, t),
      e.target.onload = null)
    }
    ))
  }
  , {
    114: 114
  }],
  116: [function(e, t, i) {
    "use strict";
    const s = e(114).PICTURE_DATA_LAZY
      , n = e(114).PICTURE_DATA_EMPTY_SOURCE
      , r = e(114).PICTURE_DATA_DOWNLOAD_AREA_KEYFRAME;
    t.exports = class {
      constructor(e={}) {
        this.options = e,
        this._init()
      }
      _init() {
        this._pictures = Array.from(document.querySelectorAll("*[".concat(s, "]"))),
        this.AnimSystem = this._findAnim(),
        null !== this.AnimSystem && (this._injectSources(),
        this._addKeyframesToImages(),
        this._addMethodsToPictures())
      }
      _addMethodsToPictures() {
        this._pictures.forEach(e=>{
          e.forceLoad = ()=>{
            this._downloadImage(e)
          }
        }
        )
      }
      _injectSources() {
        this._pictures.forEach(e=>{
          const t = e.nextElementSibling;
          if (t && "NOSCRIPT" === t.nodeName) {
            const i = e.querySelector("img")
              , s = t.textContent.match(/<source .+ \/>/g);
            s && i.insertAdjacentHTML("beforebegin", s.join(""))
          }
        }
        )
      }
      _defineKeyframeOptions(e) {
        const t = e.getAttribute(r) || "{}";
        return Object.assign({}, {
          start: "t - 200vh",
          end: "b + 100vh",
          event: "PictureLazyLoading"
        }, JSON.parse(t))
      }
      _addKeyframesToImages() {
        this._pictures.forEach(e=>{
          e.__scrollGroup = this.AnimSystem.getGroupForTarget(document.body),
          this.AnimSystem.getGroupForTarget(e) && (e.__scrollGroup = this.AnimSystem.getGroupForTarget(e));
          let t = this._defineKeyframeOptions(e);
          e.__scrollGroup.addKeyframe(e, t).controller.once("PictureLazyLoading:enter", ()=>{
            this._imageIsInLoadRange(e)
          }
          )
        }
        )
      }
      _imageIsInLoadRange(e) {
        e.querySelector("img") && this._downloadImage(e)
      }
      _downloadImage(e) {
        const t = e.querySelector("[".concat(n, "]"));
        t && e.removeChild(t)
      }
      _findAnim() {
        var e = Array.from(document.querySelectorAll("[data-anim-group],[data-anim-scroll-group],[data-anim-time-group]"));
        return e.map(e=>e._animInfo ? e._animInfo.group : null).filter(e=>null !== e),
        e[0] && e[0]._animInfo ? e[0]._animInfo.group.anim : (console.error("PictureLazyLoading: AnimSystem not found, please initialize anim before instantiating"),
        null)
      }
    }
  }
  , {
    114: 114
  }],
  117: [function(e, t, i) {
    "use strict";
    const s = e(116)
      , n = e(115);
    t.exports = {
      PictureLazyLoading: s,
      PictureHead: n
    }
  }
  , {
    115: 115,
    116: 116
  }],
  118: [function(e, t, i) {
    "use strict";
    const s = e(27)
      , n = e(137)
      , r = e(141)
      , a = e(144)
      , o = e(130)
      , h = e(121)
      , l = {
      endpoint: null,
      aliases: null,
      timeout: 5,
      dummyPrices: !1
    };
    t.exports = class {
      constructor(e=[], t={}) {
        this.ids = Array.isArray(e) ? e : [e],
        this._originalIDs = [...this.ids],
        this.identifierToAliasMap = {},
        this.options = this._processOptions(t),
        this.itemsWithDummyPrice = [],
        this.identifierParam = null
      }
      formatResponseItem() {
        throw new Error("not implemented")
      }
      getItemsFromResponse() {
        throw new Error("not implemented")
      }
      createDummyItem() {
        throw new Error("not implemented")
      }
      send() {
        return this._maybeForceError().then(()=>this._request()).then(e=>this._processResponse(e)).then(e=>this._createProductObjects(e)).catch(e=>this._handleError(e))
      }
      _createProductObjects(e) {
        let t = {};
        return Object.entries(e).forEach(([e,i])=>{
          let s = null
            , n = this.identifierToAliasMap[e] || [e];
          try {
            s = this.formatResponseItem(e, i)
          } catch (e) {
            if ("InvalidDataError" !== e.name)
              throw e
          }
          n.forEach(e=>{
            t[e] = s
          }
          )
        }
        ),
        Object.defineProperty(t, "aliases", {
          value: this.options.aliases
        }),
        r.group("%cResults from Apple Online Store", "background-color:#27a33f;color:white;padding:2px 5px"),
        r.log(t),
        r.groupEnd(),
        r.enabled && this.itemsWithDummyPrice.length && (r.group("Dummy Prices"),
        r.warn("Using dummy prices for the following product identifiers: " + this.itemsWithDummyPrice.join(", ")),
        r.info("$777,777 — The API service may require authentication and/or authorization. \n$888,888 — The product identifer is currently unknown to the API service. \n$999,999 — The product identifier is known to the API service, but the price has yet to be set. \n"),
        r.groupEnd()),
        new h(null,t)
      }
      _handleError(e) {
        let t = {};
        this.ids.forEach(e=>t[e] = null);
        let i = new h(e,t);
        if (!e)
          return i;
        if (!Object.keys(o).some(t=>e.name === t))
          throw e;
        if ("UnexpectedError" === e.name && this.options.dummyPrices) {
          let t = {};
          this._originalIDs.forEach(e=>{
            t[e] = this.createDummyItem(e),
            this.itemsWithDummyPrice.push(e)
          }
          ),
          i = new h(e,t)
        }
        return e && "function" == typeof e.showHint && e.showHint(i.products),
        i
      }
      _maybeForceError() {
        return new Promise((e,t)=>{
          if (this.options.dummyPrices && "undefined" != typeof window && window.location.search.indexOf("39f4f1f5-c4a1-4a7c-ab30-085335a11146") > -1) {
            const e = s("39f4f1f5-c4a1-4a7c-ab30-085335a11146", null);
            t(e && o[e] && new o[e])
          }
          e()
        }
        )
      }
      _processOptions(e) {
        if (!(e = Object.assign({}, l, e)).endpoint)
          throw new o.ConfigurationError({
            type: "endpoint"
          });
        const t = e.aliases ? Object.entries(e.aliases) : [];
        return t.length && (this.identifierToAliasMap = t.reduce((e,[t,i])=>(e[i] = e[i] || [],
        e[i].push(t),
        e), {}),
        this.ids = this.ids.map(t=>e.aliases[t] || t)),
        e
      }
      _processResponse(e) {
        let t = null
          , i = null;
        switch (parseInt(e.getResponseHeader("x-rewrite-status"), 10) || e.status) {
        case 404:
          throw new o.ServiceNotFoundError;
        case 503:
          throw new o.ServiceUnavailableError;
        case 400:
          throw new o.UnexpectedError;
        case 200:
          if (i = a(e.responseText),
          null !== i && (t = this.getItemsFromResponse(i),
          t))
            return t;
        default:
          throw new o.InvalidDataError
        }
      }
      _request() {
        return new Promise((e,t)=>{
          const i = new XMLHttpRequest;
          i.withCredentials = !0,
          i.onloadend = e.bind(this, i),
          i.ontimeout = t.bind(this, new o.TimeoutError(this.options.timeout)),
          i.onerror = t.bind(this, new o.UnexpectedError),
          i.open("GET", n(this.options.endpoint, this.identifierParam, this.ids), !0),
          i.timeout = 1e3 * (this.options.timeout || 0),
          i.send()
        }
        )
      }
    }
  }
  , {
    121: 121,
    130: 130,
    137: 137,
    141: 141,
    144: 144,
    27: 27
  }],
  119: [function(e, t, i) {
    "use strict";
    const s = e(142)
      , n = e(134)
      , r = e(118);
    t.exports = class extends r {
      constructor(e, t) {
        super(e, t),
        this.identifierParam = "parts"
      }
      createDummyItem(e) {
        return s(e, "unauthorized")
      }
      formatResponseItem(e, t) {
        let i = null;
        return this.options.dummyPrices && "UNKNOWN" === t.type && (t = s(e, "unknown"),
        this.itemsWithDummyPrice.push(e)),
        i = new n(t),
        999999 === i.price.value && this.itemsWithDummyPrice.push(e),
        i
      }
      getItemsFromResponse(e) {
        return e.items
      }
    }
  }
  , {
    118: 118,
    134: 134,
    142: 142
  }],
  120: [function(e, t, i) {
    "use strict";
    const s = e(143)
      , n = e(118)
      , r = e(135);
    t.exports = class extends n {
      constructor(e, t) {
        super(e, t),
        this.identifierParam = "ids"
      }
      createDummyItem(e) {
        return s(e, "unauthorized")
      }
      formatResponseItem(e, t) {
        let i = null;
        return this.options.dummyPrices && "UNKNOWN" === t.productName && (t = s(e, "unknown"),
        this.itemsWithDummyPrice.push(e)),
        i = new r(t),
        999999 === i.credit.value && this.itemsWithDummyPrice.push(e),
        i
      }
      getItemsFromResponse(e) {
        return e.ids
      }
    }
  }
  , {
    118: 118,
    135: 135,
    143: 143
  }],
  121: [function(e, t, i) {
    "use strict";
    t.exports = class {
      constructor(e=null, t={}) {
        this.error = e,
        this.products = t
      }
    }
  }
  , {}],
  122: [function(e, t, i) {
    "use strict";
    const s = e(131)
      , n = e(132)
      , r = e(140);
    t.exports = new class {
      getProductID(e, t) {
        let i = [];
        return t.forEach(t=>{
          i.push(t.dataset["".concat(e, "Product")])
        }
        ),
        [...new Set(i)]
      }
      setElements(e) {
        const t = [...document.querySelectorAll("[data-".concat(e, "-product]"))];
        let i = Array.prototype.slice.call(t).filter(e=>"SCRIPT" !== e.tagName);
        this["".concat(e, "Elements")] = i
      }
      fetchProductInfo(e, t={}) {
        let i, a;
        const o = this.getProductID(e, this["".concat(e, "Elements")]);
        return r(e).then(r=>{
          const h = Object.assign({}, r, t);
          return "pricing" === e ? a = s(o, t) : "tradein" === e ? a = n(o, t) : i = "API not supported",
          i || a.then(e=>({
            response: e,
            options: h
          }))
        }
        )
      }
      getValueFromPath(e, t) {
        return e.replace(/\s+/g, "").replace(/\$\{([\w\d.]+)\}/g, (e,i)=>i.split(".").reduce((e,t)=>e && e[t] ? e[t] : "", t))
      }
      handleError(e) {
        e.textContent || (e.style.display = "none")
      }
      trackDynamicPricingState(t) {
        try {
          let i = e("@marcom/ac-analytics")
            , s = {
            Success: "DP-S0",
            ConfigurationError: "DP-E1",
            ServiceNotFoundError: "DP-E2",
            ServiceUnavailableError: "DP-E3",
            TimeoutError: "DP-E4",
            InvalidDataError: "DP-E5",
            UnexpectedError: "DP-E6"
          }[t && t.name || "Success"];
          i.passiveTracker({
            eVar100: s
          })
        } catch (e) {}
      }
      loadPricingFromHTML(e) {
        return new Promise(t=>{
          this.pricingElements = [],
          this.setElements("pricing"),
          this.fetchProductInfo("pricing", e).then(({response: e, options: i})=>{
            this.trackDynamicPricingState(e.error),
            this.pricingElements.forEach(s=>{
              let n;
              if (!e.error || i.dummyPrices) {
                const t = s.dataset.pricingProduct;
                let i = e.products[t];
                const r = (s.dataset.productTemplate || "").replace(/\$\{\s*([\w\d.]+)\s*\}/g, e=>{
                  const t = this.getValueFromPath(e, i);
                  return t || (n = !0),
                  t
                }
                );
                i && !n ? (s.textContent = r,
                s.dataset.pricingLoaded = "",
                s.parentElement.classList.add("has-dynamic-content")) : this.handleError(s)
              } else
                this.handleError(s);
              t(e.error)
            }
            )
          }
          ).catch(e=>{
            throw e
          }
          )
        }
        )
      }
      loadTradeInFromHTML(e) {
        return new Promise(t=>{
          this.tradeinElements = [],
          this.setElements("tradein"),
          this.fetchProductInfo("tradein", e).then(({response: e, options: i})=>{
            this.trackDynamicPricingState(e.error),
            this.tradeinElements.forEach(s=>{
              let n;
              if (!e.error || i.dummyPrices) {
                const t = s.dataset.tradeinProduct;
                let i = e.products[t];
                const r = (s.dataset.productTemplate || "").replace(/\$\{\s*([\w\d.]+)\s*\}/g, e=>{
                  const t = this.getValueFromPath(e, i);
                  return t || (n = !0),
                  t
                }
                );
                i && !n ? (s.textContent = r,
                s.dataset.pricingLoaded = "",
                s.parentElement.classList.add("has-dynamic-content")) : this.handleError(s)
              } else
                this.handleError(s);
              t(e.error)
            }
            )
          }
          ).catch(e=>{
            throw e
          }
          )
        }
        )
      }
    }
  }
  , {
    131: 131,
    132: 132,
    140: 140,
    undefined: void 0
  }],
  123: [function(e, t, i) {
    "use strict";
    t.exports = {
      mockPrices: {
        unauthorized: 777777,
        unknown: 888888
      }
    }
  }
  , {}],
  124: [function(e, t, i) {
    "use strict";
    const s = e(141);
    t.exports = class extends Error {
      constructor(e={}) {
        let t;
        "endpoint" === e.type && (t = "Failed to fetch product prices: The API service endpoint was not specified."),
        super(t),
        this.name = "ConfigurationError",
        this.type = e.type
      }
      showHint() {
        "endpoint" === this.type && (s.warn(this.message + " This may be expected if this page's locale doesn't have an Apple Online Store."),
        s.info('If prices are expected for this locale, check that the API service endpoint is specified in HTML with %c<link rel="ac:pricing-endpoint" href="/path/to/endpoint">%c or the "fetchProducts" function\'s "endpoint" option.', "font-family:monospace", ""))
      }
    }
  }
  , {
    141: 141
  }],
  125: [function(e, t, i) {
    "use strict";
    const s = e(141);
    t.exports = class extends Error {
      constructor(e) {
        super(e || "Failed to fetch product price: The API service responded with an unexpected data format."),
        this.name = "InvalidDataError"
      }
      showHint() {
        s.warn(this.message)
      }
    }
  }
  , {
    141: 141
  }],
  126: [function(e, t, i) {
    "use strict";
    const s = e(141);
    t.exports = class extends Error {
      constructor() {
        super("Failed to fetch product prices: The API service responded with a status of 404 (Not Found)."),
        this.name = "ServiceNotFoundError"
      }
      showHint() {
        s.warn(this.message),
        s.info('Check the "href" value of the %c<link rel="ac:pricing-endpoint">%c tag or the "fetchProducts" function\'s "endpoint" option, if specified.', "font-family:monospace", "")
      }
    }
  }
  , {
    141: 141
  }],
  127: [function(e, t, i) {
    "use strict";
    const s = e(141);
    t.exports = class extends Error {
      constructor() {
        super("Failed to fetch product prices: The Apple Online Store is temporarily unavailable."),
        this.name = "ServiceUnavailableError"
      }
      showHint() {
        s.warn(this.message)
      }
    }
  }
  , {
    141: 141
  }],
  128: [function(e, t, i) {
    "use strict";
    const s = e(141);
    t.exports = class extends Error {
      constructor(e) {
        super("Failed to fetch product prices: The API service did not respond within " + e + " seconds, so the request was aborted."),
        this.name = "TimeoutError",
        this.timeoutValue = e
      }
      showHint() {
        s.warn(this.message)
      }
    }
  }
  , {
    141: 141
  }],
  129: [function(e, t, i) {
    "use strict";
    const s = e(141);
    t.exports = class extends Error {
      constructor() {
        super("Failed to fetch prices: An unexpected error occured."),
        this.name = "UnexpectedError"
      }
      showHint() {
        s.warn(this.message),
        s.info("The API service endpoint may require authentication and/or authorization.")
      }
    }
  }
  , {
    141: 141
  }],
  130: [function(e, t, i) {
    "use strict";
    t.exports = {
      ConfigurationError: e(124),
      ServiceNotFoundError: e(126),
      ServiceUnavailableError: e(127),
      TimeoutError: e(128),
      InvalidDataError: e(125),
      UnexpectedError: e(129)
    }
  }
  , {
    124: 124,
    125: 125,
    126: 126,
    127: 127,
    128: 128,
    129: 129
  }],
  131: [function(e, t, i) {
    "use strict";
    const s = e(140)
      , n = e(121)
      , r = e(119);
    t.exports = function(e=[], t={}) {
      if (!e.length) {
        const e = new n;
        return Promise.resolve(e)
      }
      return s("pricing").then(i=>{
        const s = Object.assign({}, i, t);
        return new r(e,s).send()
      }
      )
    }
  }
  , {
    119: 119,
    121: 121,
    140: 140
  }],
  132: [function(e, t, i) {
    "use strict";
    const s = e(140)
      , n = e(121)
      , r = e(120);
    t.exports = function(e=[], t={}) {
      if (!e.length) {
        const e = new n;
        return Promise.resolve(e)
      }
      return s("tradein").then(i=>{
        const s = Object.assign({}, i, t);
        return new r(e,s).send()
      }
      )
    }
  }
  , {
    120: 120,
    121: 121,
    140: 140
  }],
  133: [function(e, t, i) {
    "use strict";
    t.exports = Object.assign({
      applyPrices: e(122),
      fetchProducts: e(131),
      fetchTradeIns: e(132),
      Product: e(134),
      TradeIn: e(135)
    }, e(130))
  }
  , {
    122: 122,
    130: 130,
    131: 131,
    132: 132,
    134: 134,
    135: 135
  }],
  134: [function(e, t, i) {
    "use strict";
    const s = e(139)
      , n = e(145)
      , r = e(125)
      , a = e=>({
      id: e.isString,
      name: e.isString,
      type: e=>["WUIP", "PART"].includes(e),
      price: e.isObject,
      "price.value": e.isNumber,
      "price.display": e.isObject,
      "price.display.disclaimer": e.isOptionalString,
      "price.display.legal": e.isOptionalString,
      "price.display.actual": e.isString,
      "price.display.monthlyFrom": e.isOptionalString,
      "price.display.smart": e.isString,
      "price.display.from": (e,t)=>"WUIP" === t.type ? "string" == typeof e : void 0 === e,
      tradeIn: e=>void 0 === e || n(e, e=>({
        id: e.isString,
        productName: e.isString,
        credit: e.isObject,
        "credit.value": e.isNumber,
        "credit.display": e.isObject,
        "credit.display.actual": e.isString,
        "credit.display.smart": e.isString,
        "credit.display.upto": e.isString,
        priceWithCreditApplied: e.isObject,
        "priceWithCreditApplied.value": e.isNumber,
        "priceWithCreditApplied.display.actual": e.isString,
        "priceWithCreditApplied.display.disclaimer": e.isOptionalString,
        "priceWithCreditApplied.display.from": e.isString,
        "priceWithCreditApplied.display.monthlyFrom": e.isOptionalString,
        "priceWithCreditApplied.display.smart": e.isString
      }))
    });
    class o {
      constructor(e) {
        if (!o.validate(e))
          throw new r("Could not create Product, because the given JSON contains invalid data.");
        s(this, e)
      }
      get isWUIP() {
        return "WUIP" === this.type
      }
      get isPart() {
        return "PART" === this.type
      }
      static validate(e) {
        return n(e, a)
      }
    }
    t.exports = o
  }
  , {
    125: 125,
    139: 139,
    145: 145
  }],
  135: [function(e, t, i) {
    "use strict";
    const s = e(139)
      , n = e(145)
      , r = e(125)
      , a = e=>({
      id: e.isString,
      productName: e.isString,
      credit: e.isObject,
      "credit.value": e.isNumber,
      "credit.display": e.isObject,
      "credit.display.actual": e.isString,
      "credit.display.smart": e.isString,
      "credit.display.upto": e.isString
    });
    class o {
      constructor(e) {
        if (!o.validate(e))
          throw new r("Could not create TradeIn, because the given JSON contains invalid data.");
        s(this, e)
      }
      static validate(e) {
        return n(e, a)
      }
    }
    t.exports = o
  }
  , {
    125: 125,
    139: 139,
    145: 145
  }],
  136: [function(e, t, i) {
    "use strict";
    t.exports = function(e=[]) {
      return Array.isArray(e) || (e = [e]),
      e.filter(e=>"string" == typeof e).map(e=>encodeURIComponent(String(e).trim())).join(",")
    }
  }
  , {}],
  137: [function(e, t, i) {
    "use strict";
    const s = e(136)
      , n = /\?(.+)/
      , r = /(#.*)/;
    t.exports = function(e, t, i=[]) {
      let a = ((e = e.replace(r, "")).match(n) || [])[1]
        , o = e;
      return i.length && (o += a ? "&" : "?",
      o += "".concat(t, "=").concat(s(i))),
      o
    }
  }
  , {
    136: 136
  }],
  138: [function(e, t, i) {
    "use strict";
    t.exports = function(e, t) {
      const i = e % 1 == 0 ? 0 : 2;
      return e > 9999 ? e.toLocaleString(t, {
        minimumFractionDigits: i,
        maximumFractionDigits: i
      }) : e.toFixed(i)
    }
  }
  , {}],
  139: [function(e, t, i) {
    "use strict";
    t.exports = function(e, t) {
      Object.entries(t).forEach(([t,i])=>{
        e[t] || Object.defineProperty(e, t, {
          enumerable: !0,
          value: "object" == typeof i ? Object.freeze(JSON.parse(JSON.stringify(i))) : i
        })
      }
      )
    }
  }
  , {}],
  140: [function(e, t, i) {
    "use strict";
    const s = e(43);
    t.exports = function(e) {
      return new Promise((function(t) {
        "undefined" != typeof window && window.document ? s((function() {
          let i = {};
          const s = document.querySelector('link[rel="ac:'.concat(e, '-endpoint"]'));
          s && (i.endpoint = (s.getAttribute("href") || "").trim());
          document.querySelectorAll('meta[name="ac:'.concat(e, '-alias"]')).forEach(e=>{
            const [t,s] = (e.getAttribute("content") || "").split("=");
            t && s && (i.aliases = i.aliases || {},
            i.aliases[t] = s)
          }
          );
          const n = document.querySelector('meta[name="ac:pricing-dummy"]');
          n && (i.dummyPrices = "true" === (n.getAttribute("content") || "").trim()),
          t(i)
        }
        )) : t({})
      }
      ))
    }
  }
  , {
    43: 43
  }],
  141: [function(e, t, i) {
    "use strict";
    const s = e(4)
      , n = "[ @marcom/pricing ]"
      , r = Object.keys(s);
    let a = !1;
    for (var o = 0, h = r.length; o < h; o++) {
      const e = r[o]
        , i = "function" == typeof s[e] ? s[e] : null;
      i && (t.exports[e] = function() {
        const t = Array.prototype.slice.call(arguments);
        a || "string" != typeof t[0] || (t[0] = "".concat(n, " ").concat(t[0])),
        "group" !== e && "groupCollapsed" !== e || (a = !0),
        "groupEnd" === e && (a = !1),
        i.apply(s, t)
      }
      )
    }
    t.exports.enabled = s.enabled
  }
  , {
    4: 4
  }],
  142: [function(e, t, i) {
    "use strict";
    const {mockPrices: s} = e(123)
      , n = e(138);
    t.exports = function(e, t, i="en") {
      const r = parseFloat(s[t] || t || 0)
        , a = n(r, i);
      return {
        id: e,
        name: "",
        type: "WUIP",
        price: {
          value: r,
          display: {
            actual: "$" + Number(r).toLocaleString(i, {
              minimumFractionDigits: 2
            }),
            smart: "$" + a,
            from: "From $" + a
          }
        }
      }
    }
  }
  , {
    123: 123,
    138: 138
  }],
  143: [function(e, t, i) {
    "use strict";
    const {mockPrices: s} = e(123)
      , n = e(138);
    t.exports = function(e, t, i="en") {
      const r = parseFloat(s[t] || t || 0)
        , a = n(r, i);
      return {
        id: e,
        productName: "",
        credit: {
          value: r,
          display: {
            actual: "$" + Number(r).toLocaleString(i, {
              minimumFractionDigits: 2
            }),
            smart: "$" + a,
            from: "From $" + a,
            upto: "Up to $" + a
          }
        }
      }
    }
  }
  , {
    123: 123,
    138: 138
  }],
  144: [function(e, t, i) {
    "use strict";
    t.exports = function(e) {
      try {
        return JSON.parse(e)
      } catch (e) {
        return null
      }
    }
  }
  , {}],
  145: [function(e, t, i) {
    "use strict";
    const s = {
      isString: e=>"string" == typeof e,
      isOptionalString: e=>!e || "string" == typeof e,
      isNumber: e=>"number" == typeof e,
      isObject: e=>"[object Object]" === Object.prototype.toString.call(e)
    };
    function n(e, t) {
      return t.split(".").reduce((e,t)=>e && e[t], e)
    }
    t.exports = function(e, t) {
      "function" == typeof t && (t = t(s));
      const i = Object.entries(t);
      for (var r = 0, a = i.length; r < a; r++) {
        const [t,s] = i[r]
          , a = t.indexOf(".") > -1 ? n(e, t) : e[t];
        if (!0 !== s.call(e, a, e))
          return !1
      }
      return !0
    }
  }
  , {}],
  146: [function(e, t, i) {
    "use strict";
    t.exports = {
      lerp: function(e, t, i) {
        return t + (i - t) * e
      },
      map: function(e, t, i, s, n) {
        return s + (n - s) * (e - t) / (i - t)
      },
      mapClamp: function(e, t, i, s, n) {
        var r = s + (n - s) * (e - t) / (i - t);
        return Math.max(s, Math.min(n, r))
      },
      norm: function(e, t, i) {
        return (e - t) / (i - t)
      },
      clamp: function(e, t, i) {
        return Math.max(t, Math.min(i, e))
      },
      randFloat: function(e, t) {
        return Math.random() * (t - e) + e
      },
      randInt: function(e, t) {
        return Math.floor(Math.random() * (t - e) + e)
      }
    }
  }
  , {}],
  147: [function(e, t, i) {
    "use strict";
    t.exports = {
      browser: {
        safari: !1,
        chrome: !1,
        firefox: !1,
        ie: !1,
        opera: !1,
        android: !1,
        edge: !1,
        edgeChromium: !1,
        version: {
          string: "",
          major: 0,
          minor: 0,
          patch: 0,
          documentMode: !1
        }
      },
      os: {
        osx: !1,
        ios: !1,
        android: !1,
        windows: !1,
        linux: !1,
        fireos: !1,
        chromeos: !1,
        version: {
          string: "",
          major: 0,
          minor: 0,
          patch: 0
        }
      }
    }
  }
  , {}],
  148: [function(e, t, i) {
    "use strict";
    t.exports = {
      browser: [{
        name: "edge",
        userAgent: "Edge",
        version: ["rv", "Edge"],
        test: function(e) {
          return e.ua.indexOf("Edge") > -1 || "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" === e.ua
        }
      }, {
        name: "edgeChromium",
        userAgent: "Edge",
        version: ["rv", "Edg"],
        test: function(e) {
          return e.ua.indexOf("Edg") > -1 && -1 === e.ua.indexOf("Edge")
        }
      }, {
        name: "chrome",
        userAgent: "Chrome"
      }, {
        name: "firefox",
        test: function(e) {
          return e.ua.indexOf("Firefox") > -1 && -1 === e.ua.indexOf("Opera")
        },
        version: "Firefox"
      }, {
        name: "android",
        userAgent: "Android"
      }, {
        name: "safari",
        test: function(e) {
          return e.ua.indexOf("Safari") > -1 && e.vendor.indexOf("Apple") > -1
        },
        version: "Version"
      }, {
        name: "ie",
        test: function(e) {
          return e.ua.indexOf("IE") > -1 || e.ua.indexOf("Trident") > -1
        },
        version: ["MSIE", "rv"],
        parseDocumentMode: function() {
          var e = !1;
          return document.documentMode && (e = parseInt(document.documentMode, 10)),
          e
        }
      }, {
        name: "opera",
        userAgent: "Opera",
        version: ["Version", "Opera"]
      }],
      os: [{
        name: "windows",
        test: function(e) {
          return e.ua.indexOf("Windows") > -1
        },
        version: "Windows NT"
      }, {
        name: "osx",
        userAgent: "Mac",
        test: function(e) {
          return e.ua.indexOf("Macintosh") > -1
        }
      }, {
        name: "ios",
        test: function(e) {
          return e.ua.indexOf("iPhone") > -1 || e.ua.indexOf("iPad") > -1
        },
        version: ["iPhone OS", "CPU OS"]
      }, {
        name: "linux",
        userAgent: "Linux",
        test: function(e) {
          return (e.ua.indexOf("Linux") > -1 || e.platform.indexOf("Linux") > -1) && -1 === e.ua.indexOf("Android")
        }
      }, {
        name: "fireos",
        test: function(e) {
          return e.ua.indexOf("Firefox") > -1 && e.ua.indexOf("Mobile") > -1
        },
        version: "rv"
      }, {
        name: "android",
        userAgent: "Android",
        test: function(e) {
          return e.ua.indexOf("Android") > -1
        }
      }, {
        name: "chromeos",
        userAgent: "CrOS"
      }]
    }
  }
  , {}],
  149: [function(e, t, i) {
    "use strict";
    var s = e(147)
      , n = e(148);
    function r(e, t) {
      if ("function" == typeof e.parseVersion)
        return e.parseVersion(t);
      var i, s = e.version || e.userAgent;
      "string" == typeof s && (s = [s]);
      for (var n, r = s.length, a = 0; a < r; a++)
        if ((n = t.match((i = s[a],
        new RegExp(i + "[a-zA-Z\\s/:]+([0-9_.]+)","i")))) && n.length > 1)
          return n[1].replace(/_/g, ".");
      return !1
    }
    function a(e, t, i) {
      for (var s, n, a = e.length, o = 0; o < a; o++)
        if ("function" == typeof e[o].test ? !0 === e[o].test(i) && (s = e[o].name) : i.ua.indexOf(e[o].userAgent) > -1 && (s = e[o].name),
        s) {
          if (t[s] = !0,
          "string" == typeof (n = r(e[o], i.ua))) {
            var h = n.split(".");
            t.version.string = n,
            h && h.length > 0 && (t.version.major = parseInt(h[0] || 0),
            t.version.minor = parseInt(h[1] || 0),
            t.version.patch = parseInt(h[2] || 0))
          } else
            "edge" === s && (t.version.string = "12.0.0",
            t.version.major = "12",
            t.version.minor = "0",
            t.version.patch = "0");
          return "function" == typeof e[o].parseDocumentMode && (t.version.documentMode = e[o].parseDocumentMode()),
          t
        }
      return t
    }
    t.exports = function(e) {
      var t = {};
      return t.browser = a(n.browser, s.browser, e),
      t.os = a(n.os, s.os, e),
      t
    }
  }
  , {
    147: 147,
    148: 148
  }],
  150: [function(e, t, i) {
    "use strict";
    var s = {
      ua: window.navigator.userAgent,
      platform: window.navigator.platform,
      vendor: window.navigator.vendor
    };
    t.exports = e(149)(s)
  }
  , {
    149: 149
  }],
  151: [function(e, t, i) {
    "use strict";
    const s = e(25).EventEmitterMicro
      , n = [{
      name: "S",
      mediaQuery: "only screen and (max-width: 734px)"
    }, {
      name: "M",
      mediaQuery: "only screen and (min-width: 735px) and (max-width: 1068px)"
    }, {
      name: "L",
      mediaQuery: "only screen and (min-width: 1069px) and (max-width: 1440px)"
    }, {
      name: "X",
      mediaQuery: "only screen and (min-width: 1441px)"
    }]
      , r = "only screen and (-webkit-min-device-pixel-ratio: 1.5), screen and (min-resolution: 1.5dppx), screen and (min-resolution: 144dpi)"
      , a = "only screen and (orientation: portrait)";
    class o extends s {
      constructor(e={}) {
        super(),
        this.BREAKPOINTS = e.breakpoints || n,
        this._setupProperties(),
        this._onRetinaChange = this._onRetinaChange.bind(this),
        this._onOrientationChange = this._onOrientationChange.bind(this),
        this.listenersAdded = {
          orientation: !1,
          retina: !1,
          viewport: !1
        }
      }
      static get CHANGE_EVENTS() {
        return {
          ORIENTATION: "change:orientation",
          RETINA: "change:retina",
          VIEWPORT: "change:viewport"
        }
      }
      on() {
        this._setupListeners(arguments[0]),
        super.on.apply(this, arguments)
      }
      _onRetinaChange() {
        this.trigger(o.CHANGE_EVENTS.RETINA, this)
      }
      _onOrientationChange() {
        this.trigger(o.CHANGE_EVENTS.ORIENTATION, this)
      }
      _setupProperties() {
        Object.defineProperty(this, "retina", {
          get: ()=>window.matchMedia(r).matches
        }),
        Object.defineProperty(this, "orientation", {
          get: ()=>window.matchMedia(a).matches ? "portrait" : "landscape"
        }),
        this.viewport = this.getBreakpoint()
      }
      _setupListeners(e) {
        if (e !== o.CHANGE_EVENTS.RETINA || this.listenersAdded.retina || (window.matchMedia(r).addListener(this._onRetinaChange),
        this.listenersAdded.retina = !0),
        e !== o.CHANGE_EVENTS.ORIENTATION || this.listenersAdded.orientation || (window.matchMedia(a).addListener(this._onOrientationChange),
        this.listenersAdded.orientation = !0),
        e === o.CHANGE_EVENTS.VIEWPORT && !this.listenersAdded.viewport) {
          for (let e = 0; e < this.BREAKPOINTS.length; e++) {
            let t = this.BREAKPOINTS[e];
            window.matchMedia(t.mediaQuery).addListener(e=>{
              e.matches && (this.oldViewport = this.viewport,
              this.viewport = t.name,
              this.trigger(o.CHANGE_EVENTS.VIEWPORT, this))
            }
            )
          }
          this.listenersAdded.viewport = !0
        }
      }
      getBreakpoint() {
        for (let e = 0; e < this.BREAKPOINTS.length; e++) {
          let t = this.BREAKPOINTS[e];
          if (window.matchMedia(t.mediaQuery).matches)
            return t.name
        }
      }
    }
    t.exports = o
  }
  , {
    25: 25
  }],
  152: [function(e, t, i) {
    "use strict";
    t.exports = {
      path: e(153)
    }
  }
  , {
    153: 153
  }],
  153: [function(e, t, i) {
    "use strict";
    function s(e) {
      return s.parse(e)
    }
    s.basename = function(e, t) {
      var i;
      s._assertStr(e);
      var n = e.match(/[^/]*$/)[0];
      return t && (i = n.match(new RegExp("(.*)" + t + "$"))) && (n = i[1]),
      n
    }
    ,
    s.dirname = function(e) {
      return s._assertStr(e),
      e.match(/^(.*)\b\/|.*/)[1] || e
    }
    ,
    s.extname = function(e) {
      s._assertStr(e);
      var t = e.match(/\.[^.]*$/);
      return t ? t[0] : ""
    }
    ,
    s.filename = function(e) {
      return s._assertStr(e),
      s.basename(e, s.extname(e))
    }
    ,
    s.format = function(e, t) {
      s._assertObj(e);
      var i = e.dirname ? e.dirname + "/" : "";
      return e.basename ? i += e.basename : e.filename && (i += e.filename,
      e.extname && (i += e.extname)),
      t && ("string" == typeof t ? i += "?" + t : Object.prototype.toString.call(t) === Object.prototype.toString.call([]) && (i += "?" + t.join("&"))),
      i
    }
    ,
    s.isAbsolute = function(e) {
      return s._assertStr(e),
      !!e.match(/(^http(s?))/)
    }
    ,
    s.isRootRelative = function(e) {
      return s._assertStr(e),
      !!e.match(/^\/(?!\/)/)
    }
    ,
    s.parse = function(e) {
      return s._assertStr(e),
      {
        dirname: s.dirname(e),
        basename: s.basename(e),
        filename: s.filename(e),
        extname: s.extname(e)
      }
    }
    ,
    s._assertStr = function(e) {
      s._assertType(e, "string")
    }
    ,
    s._assertObj = function(e) {
      s._assertType(e, "object")
    }
    ,
    s._assertType = function(e, t) {
      var i = typeof e;
      if ("undefined" === i || i !== t)
        throw new TypeError("path param must be of type " + t)
    }
    ,
    t.exports = s
  }
  , {}],
  154: [function(e, t, i) {
    "use strict";
    t.exports = function() {
      var e = new Float32Array(16);
      return e[0] = 1,
      e[1] = 0,
      e[2] = 0,
      e[3] = 0,
      e[4] = 0,
      e[5] = 1,
      e[6] = 0,
      e[7] = 0,
      e[8] = 0,
      e[9] = 0,
      e[10] = 1,
      e[11] = 0,
      e[12] = 0,
      e[13] = 0,
      e[14] = 0,
      e[15] = 1,
      e
    }
  }
  , {}],
  155: [function(e, t, i) {
    "use strict";
    t.exports = function(e, t, i) {
      var s = Math.sin(i)
        , n = Math.cos(i)
        , r = t[4]
        , a = t[5]
        , o = t[6]
        , h = t[7]
        , l = t[8]
        , c = t[9]
        , d = t[10]
        , u = t[11];
      t !== e && (e[0] = t[0],
      e[1] = t[1],
      e[2] = t[2],
      e[3] = t[3],
      e[12] = t[12],
      e[13] = t[13],
      e[14] = t[14],
      e[15] = t[15]);
      return e[4] = r * n + l * s,
      e[5] = a * n + c * s,
      e[6] = o * n + d * s,
      e[7] = h * n + u * s,
      e[8] = l * n - r * s,
      e[9] = c * n - a * s,
      e[10] = d * n - o * s,
      e[11] = u * n - h * s,
      e
    }
  }
  , {}],
  156: [function(e, t, i) {
    "use strict";
    t.exports = function(e, t, i) {
      var s = Math.sin(i)
        , n = Math.cos(i)
        , r = t[0]
        , a = t[1]
        , o = t[2]
        , h = t[3]
        , l = t[8]
        , c = t[9]
        , d = t[10]
        , u = t[11];
      t !== e && (e[4] = t[4],
      e[5] = t[5],
      e[6] = t[6],
      e[7] = t[7],
      e[12] = t[12],
      e[13] = t[13],
      e[14] = t[14],
      e[15] = t[15]);
      return e[0] = r * n - l * s,
      e[1] = a * n - c * s,
      e[2] = o * n - d * s,
      e[3] = h * n - u * s,
      e[8] = r * s + l * n,
      e[9] = a * s + c * n,
      e[10] = o * s + d * n,
      e[11] = h * s + u * n,
      e
    }
  }
  , {}],
  157: [function(e, t, i) {
    "use strict";
    t.exports = function(e, t, i) {
      var s = Math.sin(i)
        , n = Math.cos(i)
        , r = t[0]
        , a = t[1]
        , o = t[2]
        , h = t[3]
        , l = t[4]
        , c = t[5]
        , d = t[6]
        , u = t[7];
      t !== e && (e[8] = t[8],
      e[9] = t[9],
      e[10] = t[10],
      e[11] = t[11],
      e[12] = t[12],
      e[13] = t[13],
      e[14] = t[14],
      e[15] = t[15]);
      return e[0] = r * n + l * s,
      e[1] = a * n + c * s,
      e[2] = o * n + d * s,
      e[3] = h * n + u * s,
      e[4] = l * n - r * s,
      e[5] = c * n - a * s,
      e[6] = d * n - o * s,
      e[7] = u * n - h * s,
      e
    }
  }
  , {}],
  158: [function(e, t, i) {
    "use strict";
    t.exports = function(e, t, i) {
      var s = i[0]
        , n = i[1]
        , r = i[2];
      return e[0] = t[0] * s,
      e[1] = t[1] * s,
      e[2] = t[2] * s,
      e[3] = t[3] * s,
      e[4] = t[4] * n,
      e[5] = t[5] * n,
      e[6] = t[6] * n,
      e[7] = t[7] * n,
      e[8] = t[8] * r,
      e[9] = t[9] * r,
      e[10] = t[10] * r,
      e[11] = t[11] * r,
      e[12] = t[12],
      e[13] = t[13],
      e[14] = t[14],
      e[15] = t[15],
      e
    }
  }
  , {}],
  159: [function(e, t, i) {
    "use strict";
    const s = e(79)
      , n = e(209)
      , r = e(210);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.line = {
          h: [359, 230],
          s: [100, 100],
          l: [50, 94],
          colorStops: {
            hsv: [{
              h: 349,
              s: .79,
              v: .61
            }, {
              h: 351,
              s: .44,
              v: .93
            }, {
              h: 30,
              s: .58,
              v: .95
            }, {
              h: 279,
              s: .26,
              v: .98
            }, {
              h: 291,
              s: .08,
              v: .99
            }],
            timing: [{
              timeStop: 0
            }, {
              timeStop: 1.5
            }, {
              timeStop: 2
            }, {
              timeStop: 2.5
            }, {
              timeStop: 3
            }]
          },
          easing: "0.04, 0.38, 0.34, 1.00"
        },
        this.scaleEasing = "0.76, 0.02, 0.35, 0.98",
        this.timelineHeight = 250,
        this.timelineDuration = 4.25,
        this.cssClasses = {
          stickyWrapper: ".sticky-wrapper-chip",
          chipContainer: "#chip-image-container",
          lineContainer: "#lines",
          lines: "#lines line",
          chipSvg: "#chip-svg",
          chipOutline: "#frame rect",
          chipImage: ".overview-experience-intro-chip-glow"
        },
        this.chipContainer = this.el.querySelector(this.cssClasses.chipContainer),
        this.anchors = [".timeline-chip"],
        this.group = this.anim.getScrollGroupForTarget(this.el),
        this.allKfs = [],
        this.scaleKeyframes = [],
        this._destroy = this._destroy.bind(this)
      }
      mounted() {
        this._setupEvents(),
        this.calculateScale(),
        this._setupKeyframes()
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy)
      }
      calculateScale() {
        this.svg = this.el.querySelector(this.cssClasses.chipSvg);
        const e = this.svg.clientWidth
          , t = this.svg.clientHeight;
        if (0 === e || 0 === t)
          return;
        const i = this.el.clientWidth
          , s = this.el.clientHeight
          , n = i > s
          , r = i / e
          , a = s / t;
        this.scale = n ? r * (.75 + s / i) : a * (.75 + i / s)
      }
      _setupKeyframes() {
        this.setupSvgChipKeyframes(),
        this.setupImageKeyframes()
      }
      setupSvgChipKeyframes() {
        let e = this.line.colorStops.hsv.map(e=>n.hsv2hsl(e.h, e.s, e.v)).map(e=>({
          h: e.h,
          s: 100 * e.s,
          l: 100 * e.l
        }));
        e[2].h = e[2].h + 360;
        const t = this.el.querySelector(this.cssClasses.lineContainer)
          , i = this.line.colorStops.timing
          , s = this.createColorStopKeyframes(t, e, i);
        s.controller.friendlyName = "Color Stops";
        const a = this.el.querySelector(this.cssClasses.chipOutline)
          , o = this.el.querySelectorAll(this.cssClasses.lines);
        s.controller.on("draw", e=>{
          let t = Math.round(e.tweenProps.h.current)
            , i = Math.round(e.tweenProps.s.current)
            , s = Math.round(e.tweenProps.l.current);
          o.forEach(e=>{
            e.style.stroke = "hsl(".concat(t, ", ").concat(i, "%, ").concat(s, "%)")
          }
          ),
          a.style.stroke = "hsl(".concat(t, ", ").concat(i, "%, ").concat(s, "%)")
        }
        );
        const h = t.querySelectorAll(this.cssClasses.lines);
        let l = {};
        for (const e in r) {
          let t = this.convertTimeCodeToSeconds(r[e].start)
            , i = this.convertTimeCodeToSeconds(r[e].end);
          l[e] = {
            start: t,
            end: i
          }
        }
        h.forEach(e=>{
          let t = e.dataset.name
            , i = l[t] ? l[t].start : 0
            , s = l[t] ? l[t].end : this.timelineDuration;
          this.addLineKeyframe(e, i, s, "LM", .3),
          this.addLineKeyframe(e, i, s, "S", .6)
        }
        );
        const c = this.el.querySelector(this.cssClasses.chipSvg);
        this.chipFadeKf = this.anim.addKeyframe(c, {
          start: "a0t + ".concat(this.timeToViewportHeight(2.3)),
          end: "a0t + ".concat(this.timeToViewportHeight(3)),
          opacity: [1, 0],
          anchors: this.anchors,
          disabledWhen: "no-enhanced",
          breakpointMask: "LM"
        }),
        this.anim.addKeyframe(c, {
          start: "a0t + ".concat(this.timeToViewportHeight(3.1)),
          end: "a0t + ".concat(this.timeToViewportHeight(3.6)),
          opacity: [1, 0],
          anchors: this.anchors,
          disabledWhen: "no-enhanced",
          breakpointMask: "S"
        }),
        this.chipScaleLarge = this.anim.addKeyframe(c, {
          start: "a0t",
          end: "a0t + ".concat(this.timeToViewportHeight(this.timelineDuration)),
          scale: [this.scale, .4],
          x: [10, 0],
          easeFunction: "cubic-bezier(".concat(this.scaleEasing, ")"),
          anchors: this.anchors,
          disabledWhen: "no-enhanced",
          breakpointMask: "LM"
        }),
        this.chipScaleSmall = this.anim.addKeyframe(c, {
          start: "a0t",
          end: "a0t + ".concat(this.timeToViewportHeight(this.timelineDuration)),
          scale: [this.scale, .3],
          x: [6, 0],
          easeFunction: "cubic-bezier(".concat(this.scaleEasing, ")"),
          anchors: this.anchors,
          disabledWhen: "no-enhanced",
          breakpointMask: "S"
        }),
        this.scaleKeyframes.push(this.chipScaleLarge, this.chipScaleSmall),
        this.anim.addKeyframe(c, {
          start: "a0t",
          end: "a0t + ".concat(this.timeToViewportHeight(3)),
          style: {
            on: {
              display: "block"
            },
            off: {
              display: "none"
            }
          },
          anchors: this.anchors,
          toggle: !0,
          breakpointMask: "LM"
        }),
        this.anim.addKeyframe(c, {
          start: "a0t",
          end: "a0t + ".concat(this.timeToViewportHeight(3.6)),
          style: {
            on: {
              display: "block"
            },
            off: {
              display: "none"
            }
          },
          anchors: this.anchors,
          toggle: !0,
          breakpointMask: "S"
        }),
        this.allKfs.push(this.group.getControllerForTarget(c))
      }
      setupImageKeyframes() {
        const e = this.el.querySelector(this.cssClasses.chipImage);
        this.anim.addKeyframe(e, {
          start: "a0t + ".concat(this.timeToViewportHeight(2.5)),
          end: "a0t + ".concat(this.timeToViewportHeight(this.timelineDuration)),
          style: {
            on: {
              visibility: "visible"
            },
            off: {
              visibility: "hidden"
            }
          },
          anchors: this.anchors,
          disabledWhen: "no-enhanced"
        }).controller.friendlyName = "Chip Image",
        this.anim.addKeyframe(e, {
          start: "0",
          end: "a0t + ".concat(this.timeToViewportHeight(this.timelineDuration + 1)),
          cssClass: "will-change",
          anchors: this.anchors,
          toggle: !0,
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(e, {
          start: "a0t + ".concat(this.timeToViewportHeight(2.5)),
          end: "a0t +  ".concat(this.timeToViewportHeight(3)),
          opacity: [0, 1],
          anchors: this.anchors,
          disabledWhen: "no-enhanced",
          breakpointMask: "LM"
        }),
        this.anim.addKeyframe(e, {
          start: "a0t + ".concat(this.timeToViewportHeight(2.5)),
          end: "a0t +  ".concat(this.timeToViewportHeight(3.6)),
          opacity: [0, 1],
          anchors: this.anchors,
          disabledWhen: "no-enhanced",
          breakpointMask: "S"
        }),
        this.anim.addKeyframe(e, {
          start: "a0t + ".concat(this.timeToViewportHeight(4)),
          end: "a0t + ".concat(this.timeToViewportHeight(this.timelineDuration)),
          opacity: [1, 0],
          breakpointMask: "LM",
          anchors: this.anchors,
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(e, {
          start: "a0t + ".concat(this.timeToViewportHeight(3.8)),
          end: "a0t + ".concat(this.timeToViewportHeight(this.timelineDuration)),
          opacity: [1, 0],
          breakpointMask: "S",
          anchors: this.anchors,
          disabledWhen: "no-enhanced"
        }),
        this.imageScaleLarge = this.anim.addKeyframe(e, {
          start: "a0t",
          end: "a0t + ".concat(this.timeToViewportHeight(this.timelineDuration)),
          scale: [this.scale, .4],
          easeFunction: "cubic-bezier(".concat(this.scaleEasing, ")"),
          anchors: this.anchors,
          disabledWhen: "no-enhanced",
          breakpointMask: "LM"
        }),
        this.imageScaleSmall = this.anim.addKeyframe(e, {
          start: "a0t",
          end: "a0t + ".concat(this.timeToViewportHeight(this.timelineDuration)),
          scale: [this.scale, .3],
          easeFunction: "cubic-bezier(".concat(this.scaleEasing, ")"),
          anchors: this.anchors,
          disabledWhen: "no-enhanced",
          breakpointMask: "S"
        }),
        this.scaleKeyframes.push(this.imageScaleLarge, this.imageScaleSmall),
        this.allKfs.push(this.group.getControllerForTarget(e))
      }
      createColorStopKeyframes(e, t, i) {
        const s = t[0]
          , n = t[1];
        let r = this.timeToViewportHeight(i[0].timeStop)
          , a = this.timeToViewportHeight(i[1].timeStop)
          , o = this.anim.addKeyframe(e, {
          start: "a0t + ".concat(r),
          end: "a0t + ".concat(a),
          h: [s.h, n.h],
          s: [s.s, n.s],
          l: [s.l, n.l],
          anchors: this.anchors
        });
        this.allKfs.push(o);
        for (let s = 2; s < t.length; s++) {
          const n = t[s];
          r = a,
          a = this.timeToViewportHeight(i[s].timeStop);
          let o = this.anim.addKeyframe(e, {
            start: "a0t + ".concat(r),
            end: "a0t + ".concat(a),
            h: [null, n.h],
            s: [null, n.s],
            l: [null, n.l],
            anchors: this.anchors
          });
          this.allKfs.push(o)
        }
        return o
      }
      convertTimeCodeToSeconds(e) {
        let t = e.split(":");
        return .7 * (parseInt(t[0]) + parseInt(t[1]) * (1 / 60))
      }
      timeToViewportHeight(e) {
        let t = e / this.timelineDuration * this.timelineHeight;
        return "".concat(t, "vh")
      }
      addLineKeyframe(e, t, i, s, n=0) {
        const r = Math.ceil(e.getTotalLength());
        e.style = "stroke-dasharray: ".concat(r);
        let a = this.anim.addKeyframe(e, {
          start: "a0t + ".concat(this.timeToViewportHeight(t + n)),
          end: "a0t + ".concat(this.timeToViewportHeight(i + n)),
          strokeDashoffset: [r, 0],
          easeFunction: "cubic-bezier(".concat(this.line.easing, ")"),
          anchors: this.anchors,
          disabledWhen: "no-enhanced",
          breakpointMask: s
        });
        this.allKfs.push(a)
      }
      _destroy() {
        this.allKfs.forEach(e=>{
          e && e.remove()
        }
        )
      }
      onResizeDebounced(e) {
        this.calculateScale(),
        this.scaleKeyframes.forEach(e=>{
          if (e.animValues) {
            let t = e.animValues.scale[1];
            e.overwriteProps({
              scale: [this.scale, t]
            })
          }
        }
        )
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    209: 209,
    210: 210,
    79: 79
  }],
  160: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.fadeInKeyframe = null
      }
      mounted() {
        this.anim.once("enhanced-destroy", ()=>this._destroy()),
        this.fadeInKeyframe = this.anim.addKeyframe(this.el, {
          start: "t+80h-100vh",
          end: "b-80vh",
          cssClass: "revealed",
          disabledWhen: ["no-enhanced"]
        })
      }
      _destroy() {
        this.fadeInKeyframe.remove()
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    79: 79
  }],
  161: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.options = e,
        this.introContent = this.el.querySelector(".intro-content"),
        this.hero = this.el.querySelector(".hero-image"),
        this.featuresBadges = this.el.querySelector(".timeline-xdr-features .badges"),
        this.ledsDimming = this.el.querySelector(".sticky-xdr-leds-dimming"),
        this.ledsImage = this.el.querySelector(".xdr-leds-image"),
        this.ledsBadges = this.el.querySelector(".timeline-xdr-leds .badges"),
        this.ledsCopy = this.el.querySelector(".timeline-xdr-leds .copy-block"),
        this.dimmingImage = this.el.querySelector(".xdr-dimming-image"),
        this.dimmingBadges = this.el.querySelector(".timeline-xdr-dimming-zones .badges"),
        this.dimmingCopy = this.el.querySelector(".timeline-xdr-dimming-zones .copy-block"),
        this.pinContainer = this.el.querySelector(".pin-container"),
        this.pinHighlight = this.el.querySelector(".pin-highlight"),
        this.pinLine = this.el.querySelector(".pin-line"),
        this.pinCaptionLeds = this.el.querySelector(".pin-leds"),
        this.pinCaptionDimming = this.el.querySelector(".pin-dimming"),
        this.screenLayersSticky = this.el.querySelector(".sticky-xdr-screens"),
        this.screenLayers = this.el.querySelector(".screen-layers"),
        this.screenLayer1 = this.el.querySelector(".screen-layer-1"),
        this.screenLayer2 = this.el.querySelector(".screen-layer-2"),
        this.screenLayer3 = this.el.querySelector(".screen-layer-3"),
        this.screenLayer4 = this.el.querySelector(".screen-layer-4"),
        this.topGradient = this.el.querySelector(".copy-gradient-top"),
        this.bottomGradient = this.el.querySelector(".copy-gradient-bottom"),
        this.introContentHeight = this.el.querySelector(".intro-content").offsetHeight,
        this.easeZoom = "easeOutSin",
        this.easeScreens = "cubic-bezier(0.66,0.00,0.34,1.00)",
        this._destroy = this._destroy.bind(this)
      }
      mounted() {
        this._setupEvents(),
        this._setupKeyframes()
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy)
      }
      _setupKeyframes() {
        this._createKeyframeIntro(),
        this._createFeatureKeyframes(),
        this._createKeyframeScreenLayers(),
        this._createKeyframePins(),
        this._createKeyframesLeds(),
        this._createKeyframesDimmingZones(),
        this._createKeyframesPerf()
      }
      _createKeyframesPerf() {
        this.anim.addKeyframe(this.introContent, {
          start: "a0t - 25vh",
          end: "a0b - 25vh",
          cssClass: "will-change-transform",
          anchors: [".timeline-xdr-intro"],
          toggle: !0,
          disabledWhen: ["no-enhanced"]
        }),
        this.anim.addKeyframe(this.hero, {
          start: "a0t - 50vh",
          end: "a0b + 20vh",
          cssClass: "will-change-transform",
          anchors: [".timeline-xdr-intro"],
          toggle: !0,
          disabledWhen: ["no-enhanced"]
        }),
        this.anim.addKeyframe(this.screenLayer1.querySelector("img"), {
          start: "a0b - 100px",
          end: "a1b - 16vh",
          style: {
            on: {
              visibility: "visible"
            },
            off: {
              visibility: "hidden"
            }
          },
          toggle: !0,
          anchors: [".timeline-xdr-intro", ".timeline-xdr-leds"],
          disabledWhen: "no-enhanced"
        }).controller.friendlyName = "screen layer 1 - visibility",
        this.anim.addKeyframe(this.screenLayer2.querySelector("img"), {
          start: "a0b - 95px",
          end: "a1b - 14vh",
          style: {
            on: {
              visibility: "visible"
            },
            off: {
              visibility: "hidden"
            }
          },
          toggle: !0,
          anchors: [".timeline-xdr-intro", ".timeline-xdr-leds"],
          disabledWhen: "no-enhanced"
        }).controller.friendlyName = "screen layer 2 - visibility",
        this.anim.addKeyframe(this.screenLayer3.querySelector("img"), {
          start: "a0b - 90px",
          end: "a1b - 12vh",
          style: {
            on: {
              visibility: "visible"
            },
            off: {
              visibility: "hidden"
            }
          },
          toggle: !0,
          anchors: [".timeline-xdr-intro", ".timeline-xdr-leds"],
          disabledWhen: "no-enhanced"
        }).controller.friendlyName = "screen layer 3 - visibility",
        this.anim.addKeyframe(this.screenLayer4.querySelector("img"), {
          start: "a0b - 85px",
          end: "a1b - 10vh",
          style: {
            on: {
              visibility: "visible"
            },
            off: {
              visibility: "hidden"
            }
          },
          toggle: !0,
          anchors: [".timeline-xdr-intro", ".timeline-xdr-leds"],
          disabledWhen: "no-enhanced"
        }).controller.friendlyName = "screen layer 4 - visibility",
        this.anim.addKeyframe(this.ledsDimming, {
          start: "a0b - 100px",
          end: "a1b + 100vh",
          style: {
            on: {
              visibility: "visible"
            },
            off: {
              visibility: "hidden"
            }
          },
          toggle: !0,
          anchors: [".timeline-xdr-intro", ".timeline-xdr-leds"],
          disabledWhen: "no-enhanced"
        }).controller.friendlyName = "led sticky - visibility"
      }
      _createKeyframeIntro() {
        this.anim.addKeyframe(this.introContent, {
          start: "a0t",
          end: "a0t + 25vh",
          y: [0, -2 * this.introContentHeight + "px"],
          easeFunction: "linear",
          ease: .5,
          anchors: [".timeline-xdr-intro"],
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(this.hero, {
          start: "a0t",
          end: "a0b - 100px",
          scale: ["css(--hero-scale-start-large)", "css(--hero-scale-end-large)"],
          x: ["20px", "100px"],
          y: ["calc(-(100vh - ".concat(this.introContentHeight, ") + ").concat(this.introContentHeight, " + css(--hero-offset-large)) + css(--hero-padding-large)"), "calc((css(--hero-height-large) * css(--hero-scale-end-large)) * -0.5) + css(--hero-offset-tall-large)"],
          ease: .5,
          easeFunction: this.easeZoom,
          anchors: [".timeline-xdr-intro"],
          breakpointMask: "LX",
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(this.hero, {
          start: "a0t",
          end: "a0b - 100px",
          x: ["0px", "13px"],
          scale: ["css(--hero-scale-start-medium)", "css(--hero-scale-end-medium)"],
          y: ["calc(-(100vh - ".concat(this.introContentHeight, ") + ").concat(this.introContentHeight, " + css(--hero-offset-medium)) + css(--hero-padding-medium)"), "calc((css(--hero-height-medium) * css(--hero-scale-end-medium)) * -0.5) + css(--hero-offset-tall-medium)"],
          ease: .5,
          easeFunction: this.easeZoom,
          anchors: [".timeline-xdr-intro"],
          breakpointMask: "M",
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(this.hero, {
          start: "a0t",
          end: "a0b - 100px",
          x: ["0px", "-49px"],
          scale: ["css(--hero-scale-start-small)", "css(--hero-scale-end-small)"],
          y: ["calc(-(100vh - ".concat(this.introContentHeight, ") + ").concat(this.introContentHeight, " + css(--hero-offset-small)) + css(--hero-padding-small)"), "calc((css(--hero-height-small) * css(--hero-scale-end-small)) * -0.5) + css(--hero-offset-tall-small)"],
          ease: .5,
          easeFunction: this.easeZoom,
          anchors: [".timeline-xdr-intro"],
          breakpointMask: "S",
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(this.hero, {
          start: "a0t - 100vh",
          end: "a0b + 20vh",
          style: {
            on: {
              visibility: "visible"
            },
            off: {
              visibility: "hidden"
            }
          },
          toggle: !0,
          anchors: [".timeline-xdr-intro"],
          disabledWhen: "no-enhanced"
        }).controller.friendlyName = "ipad zoom - visibility"
      }
      _createKeyframeScreenLayers() {
        this.screenLayersTimeGroup = this.anim.createTimeGroup(),
        this.screenLayersTimeGroup.name = "XDR - screens in",
        this.screenLayersTimeGroup.addKeyframe(this.screenLayer1, {
          start: 0,
          end: 1.2,
          y: [0, "-60vh"],
          easeFunction: this.easeScreens
        }),
        this.screenLayersTimeGroup.addKeyframe(this.screenLayer2, {
          start: .2,
          end: 1.3,
          y: [0, "-60vh"],
          easeFunction: this.easeScreens
        }),
        this.screenLayersTimeGroup.addKeyframe(this.screenLayer3, {
          start: .25,
          end: 1.4,
          y: [0, "-60vh"],
          easeFunction: this.easeScreens
        }),
        this.screenLayersTimeGroup.addKeyframe(this.screenLayer4, {
          start: .3,
          end: 1.5,
          y: [0, "-60vh"],
          easeFunction: this.easeScreens
        }),
        this.screenLayersTimeGroup.addKeyframe(this.screenLayers, {
          start: 1.5,
          end: 1.5,
          style: {
            on: {
              display: "none"
            },
            off: {
              display: "block"
            }
          }
        }),
        this.addDiscreteEvent({
          start: "a0b + 20vh",
          onEvent: ()=>{
            this.screenLayersTimeGroup.timeScale(1),
            this.screenLayersTimeGroup.play()
          }
          ,
          onEventReverse: ()=>{
            this.screenLayersTimeGroup.timeScale(1.5),
            this.screenLayersTimeGroup.reverse()
          }
          ,
          anchors: [".timeline-xdr-intro"],
          disabledWhen: "no-enhanced"
        }),
        this.addDiscreteEvent({
          start: "a0t",
          onEventReverse: ()=>{
            this.screenLayersTimeGroup.pause(),
            this.screenLayersTimeGroup.progress(0)
          }
          ,
          anchors: [".timeline-xdr-intro"],
          disabledWhen: "no-enhanced"
        }),
        this.addDiscreteEvent({
          start: "a0b + 100vh",
          onEvent: ()=>{
            this.screenLayersTimeGroup.pause(),
            this.screenLayersTimeGroup.progress(1)
          }
          ,
          anchors: [".timeline-xdr-leds"],
          disabledWhen: "no-enhanced"
        })
      }
      _createFeatureKeyframes() {
        this.anim.addKeyframe(this.featuresBadges, {
          start: "a0t - 80vh",
          end: "a0t",
          cssClass: "fade-in",
          toggle: !0,
          anchors: [".timeline-xdr-features"],
          breakpointMask: "MLX",
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(this.featuresBadges, {
          start: "a0t - 90vh",
          end: "a0t + 10vh",
          cssClass: "fade-in",
          toggle: !0,
          anchors: [".timeline-xdr-features"],
          breakpointMask: "S",
          disabledWhen: "no-enhanced"
        })
      }
      _createKeyframePins() {
        this.anim.addKeyframe(this.pinContainer, {
          start: "a0t - 100vh",
          end: "a1b",
          style: {
            on: {
              visibility: "visible"
            },
            off: {
              visibility: "hidden"
            }
          },
          toggle: !0,
          anchors: [".timeline-xdr-leds", ".timeline-xdr-dimming-zones"],
          breakpointMask: "MLX",
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(this.pinContainer, {
          start: "a0t - 90vh",
          end: "a1b",
          style: {
            on: {
              visibility: "visible"
            },
            off: {
              visibility: "hidden"
            }
          },
          toggle: !0,
          anchors: [".timeline-xdr-leds", ".timeline-xdr-dimming-zones"],
          breakpointMask: "S",
          disabledWhen: "no-enhanced"
        }),
        this.pinsLedsGroup = this.anim.createTimeGroup(),
        this.pinsLedsGroup.name = "XDR - pins leds",
        this.pinsLedsGroup.addKeyframe(this.pinHighlight, {
          start: 0,
          end: .3,
          opacity: [0, 1],
          easeFunction: "easeOutQuad"
        }),
        this.pinsLedsGroup.addKeyframe(this.pinLine, {
          start: .2,
          end: .5,
          opacity: [0, 1],
          height: ["0px", "css(--pin-line-led-anim-height-large)"],
          breakpointMask: "LX",
          easeFunction: "easeOutQuad"
        }),
        this.pinsLedsGroup.addKeyframe(this.pinLine, {
          start: .2,
          end: .5,
          opacity: [0, 1],
          height: ["0px", "css(--pin-line-led-anim-height-medium)"],
          breakpointMask: "M",
          easeFunction: "easeOutQuad"
        }),
        this.pinsLedsGroup.addKeyframe(this.pinLine, {
          start: .2,
          end: .5,
          opacity: [0, 1],
          width: ["0px", "css(--pin-line-led-anim-width-small)"],
          breakpointMask: "S",
          easeFunction: "easeOutQuad"
        }),
        this.pinsLedsGroup.addKeyframe(this.pinCaptionLeds, {
          start: .5,
          end: .8,
          opacity: [0, 1],
          y: ["10px", "-10px"],
          snapAtCreation: !0,
          breakpointMask: "MLX",
          easeFunction: "easeOutQuad"
        }),
        this.pinsLedsGroup.addKeyframe(this.pinCaptionLeds, {
          start: .5,
          end: .8,
          opacity: [0, 1],
          y: ["0px", "-15px"],
          snapAtCreation: !0,
          breakpointMask: "S",
          easeFunction: "easeOutQuad"
        }),
        this.addDiscreteEvent({
          start: "a0t - 50vh",
          onEvent: ()=>{
            this.pinsLedsGroup.play()
          }
          ,
          onEventReverse: ()=>{
            this.pinsLedsGroup.reverse()
          }
          ,
          anchors: [".timeline-xdr-leds"],
          breakpointMask: "MLX",
          disabledWhen: "no-enhanced"
        }),
        this.addDiscreteEvent({
          start: "a0t - 90vh",
          onEvent: ()=>{
            this.pinsLedsGroup.play()
          }
          ,
          onEventReverse: ()=>{
            this.pinsLedsGroup.reverse()
          }
          ,
          anchors: [".timeline-xdr-leds"],
          breakpointMask: "S",
          disabledWhen: "no-enhanced"
        }),
        this.pinsDimmingGroup = this.anim.createTimeGroup(),
        this.pinsDimmingGroup.name = "XDR - pins dimming",
        this.pinsDimmingGroup.addKeyframe(this.pinHighlight, {
          start: 0,
          end: .3,
          scale: [.5, 1],
          easeFunction: "easeOutQuad"
        }),
        this.pinsDimmingGroup.addKeyframe(this.pinLine, {
          start: 0,
          end: .3,
          y: ["-20px", 0],
          height: ["css(--pin-line-led-anim-height-large)", "css(--pin-line-dimming-anim-height-large)"],
          breakpointMask: "LX",
          easeFunction: "easeOutQuad"
        }),
        this.pinsDimmingGroup.addKeyframe(this.pinLine, {
          start: 0,
          end: .3,
          y: ["-20px", 0],
          height: ["css(--pin-line-led-anim-height-medium)", "css(--pin-line-dimming-anim-height-medium)"],
          breakpointMask: "M",
          easeFunction: "easeOutQuad"
        }),
        this.pinsDimmingGroup.addKeyframe(this.pinLine, {
          start: 0,
          end: .3,
          x: [0, "-20px"],
          width: ["css(--pin-line-led-anim-width-small)", "css(--pin-line-dimming-anim-width-small)"],
          breakpointMask: "S",
          easeFunction: "easeOutQuad"
        }),
        this.pinsDimmingGroup.addKeyframe(this.pinCaptionLeds, {
          start: 0,
          end: .3,
          opacity: [1, 0],
          y: ["-10px", "30px"],
          breakpointMask: "MLX",
          easeFunction: "easeOutQuad"
        }),
        this.pinsDimmingGroup.addKeyframe(this.pinCaptionDimming, {
          start: .3,
          end: .6,
          opacity: [0, 1],
          y: ["-30px", "-15px"],
          breakpointMask: "MLX",
          easeFunction: "easeOutQuad"
        }),
        this.pinsDimmingGroup.addKeyframe(this.pinCaptionLeds, {
          start: 0,
          end: .3,
          opacity: [1, 0],
          y: ["-15px", "30px"],
          breakpointMask: "S",
          easeFunction: "easeOutQuad"
        }),
        this.pinsDimmingGroup.addKeyframe(this.pinCaptionDimming, {
          start: .3,
          end: .6,
          opacity: [0, 1],
          y: ["-55px", "-40px"],
          breakpointMask: "S",
          easeFunction: "easeOutQuad"
        }),
        this.addDiscreteEvent({
          start: "a0t - 50vh",
          onEvent: ()=>{
            this.pinsDimmingGroup.play()
          }
          ,
          onEventReverse: ()=>{
            this.pinsDimmingGroup.reverse()
          }
          ,
          anchors: [".timeline-xdr-dimming-zones"],
          breakpointMask: "MLX",
          disabledWhen: "no-enhanced"
        }),
        this.addDiscreteEvent({
          start: "a0t - 75vh",
          onEvent: ()=>{
            this.pinsDimmingGroup.play()
          }
          ,
          onEventReverse: ()=>{
            this.pinsDimmingGroup.reverse()
          }
          ,
          anchors: [".timeline-xdr-dimming-zones"],
          breakpointMask: "S",
          disabledWhen: "no-enhanced"
        })
      }
      _createKeyframesLeds() {
        this.anim.addKeyframe(this.ledsBadges, {
          start: "a0t - 50vh",
          end: "a0b - 75vh",
          cssClass: "fade-in",
          toggle: !0,
          anchors: [".timeline-xdr-leds"],
          breakpointMask: "MLX",
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(this.ledsCopy, {
          start: "a0t - 50vh",
          end: "a0b - 75vh",
          cssClass: "fade-in",
          toggle: !0,
          anchors: [".timeline-xdr-leds"],
          breakpointMask: "MLX",
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(this.ledsBadges, {
          start: "a0t - 90vh",
          end: "a0b - 100vh",
          cssClass: "fade-in",
          toggle: !0,
          anchors: [".timeline-xdr-leds"],
          breakpointMask: "S",
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(this.ledsCopy, {
          start: "a0t - 90vh",
          end: "a0b - 100vh",
          cssClass: "fade-in",
          toggle: !0,
          anchors: [".timeline-xdr-leds"],
          breakpointMask: "S",
          disabledWhen: "no-enhanced"
        })
      }
      _createKeyframesDimmingZones() {
        this.anim.addKeyframe(this.dimmingImage, {
          start: "a0t - 50vh",
          end: "a0b - 50vh",
          cssClass: "fade-in",
          toggle: !0,
          anchors: [".timeline-xdr-dimming-zones"],
          breakpointMask: "MLX",
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(this.dimmingImage, {
          start: "a0t - 75vh",
          end: "a0b - 75vh",
          cssClass: "fade-in",
          toggle: !0,
          anchors: [".timeline-xdr-dimming-zones"],
          breakpointMask: "S",
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(this.dimmingBadges, {
          start: "a0t - 60vh",
          cssClass: "fade-in",
          toggle: !0,
          anchors: [".timeline-xdr-dimming-zones"],
          breakpointMask: "MLX",
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(this.dimmingCopy, {
          start: "a0t - 60vh",
          cssClass: "fade-in",
          toggle: !0,
          anchors: [".timeline-xdr-dimming-zones"],
          breakpointMask: "MLX",
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(this.dimmingCopy, {
          start: "a0t - 90vh",
          cssClass: "fade-in",
          toggle: !0,
          anchors: [".timeline-xdr-dimming-zones"],
          breakpointMask: "S",
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(this.dimmingBadges, {
          start: "a0t - 90vh",
          cssClass: "fade-in",
          toggle: !0,
          anchors: [".timeline-xdr-dimming-zones"],
          breakpointMask: "S",
          disabledWhen: "no-enhanced"
        }),
        this.anim.addKeyframe(this.bottomGradient, {
          start: "a0b - 100vh",
          style: {
            on: {
              visibility: "hidden"
            },
            off: {
              visibility: "visible"
            }
          },
          toggle: !0,
          anchors: [".timeline-xdr-dimming-zones"],
          disabledWhen: "no-enhanced"
        })
      }
      _destroy() {}
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    79: 79
  }],
  162: [function(e, t, i) {
    "use strict";
    var s = e(29)(e(28));
    function n(e, t) {
      var i = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var s = Object.getOwnPropertySymbols(e);
        t && (s = s.filter((function(t) {
          return Object.getOwnPropertyDescriptor(e, t).enumerable
        }
        ))),
        i.push.apply(i, s)
      }
      return i
    }
    function r(e) {
      for (var t = 1; t < arguments.length; t++) {
        var i = null != arguments[t] ? arguments[t] : {};
        t % 2 ? n(Object(i), !0).forEach((function(t) {
          (0,
          s.default)(e, t, i[t])
        }
        )) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(i)) : n(Object(i)).forEach((function(t) {
          Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(i, t))
        }
        ))
      }
      return e
    }
    const a = e(79)
      , o = e(212)
      , h = e(208);
    t.exports = class extends a {
      constructor(e) {
        super(e),
        this.stickyOverflow = this.el.querySelector(".sticky-overflow"),
        this.matrixContainer = this.el.querySelector(".experience-display-matrix"),
        this.displayHardware = this.el.querySelector(".display-hardware img"),
        this.posterFrame = this.el.querySelector(".display-posterframe img"),
        this.anchorEl = this.el.querySelector(".timeline-display"),
        this.animGroup = this.anim.getGroupForTarget(this.el),
        this.screenSize = parseFloat(getComputedStyle(this.matrixContainer).getPropertyValue("--screen-to-hardware-ratio")),
        this.camera,
        this.perspective,
        this.scene,
        this.renderer,
        this.layers = {},
        this.baseKeyframes = {
          start: "a0t",
          end: "a0t + 140vh",
          anchors: [this.anchorEl],
          disabledWhen: ["no-enhanced"]
        },
        this.textureOptions = {
          HARDWARE_TEXTURE: {},
          POSTERFRAME_TEXTURE: {},
          DOT_COUNT_MULTIPLIER: {
            S: .5,
            M: .75
          }
        },
        this.dotMultiple = this.textureOptions.DOT_COUNT_MULTIPLIER[this.pageMetrics.breakpoint] || 1,
        this._render = this._render.bind(this),
        this._destroy = this._destroy.bind(this)
        // By manual
        this.mounted()
      }
      mounted() {
        this.THREE = window.THREE
        this._initialize()
        this._setupVisibilityKeyframes()
      }
      _initialize() {
        this.textureLoader = new this.THREE.TextureLoader;
        Promise.all([this._loadImage(this.displayHardware, "HARDWARE_TEXTURE"), this._loadImage(this.posterFrame, "POSTERFRAME_TEXTURE")]).then(()=>{
          this.textureOptions.HARDWARE_TEXTURE = this.textureLoader.load(this.displayHardware.currentSrc, this._render),
          this.textureOptions.POSTERFRAME_TEXTURE = this.textureLoader.load(this.posterFrame.currentSrc, this._render),
          this._setupEvents()
        }
        )
      }
      _initializeFallback() {
        this.animGroup.addKeyframe(this.matrixContainer, r(r({}, this.baseKeyframes), {}, {
          end: "".concat(this.baseKeyframes.start, " + 20vh"),
          opacity: [0, 1]
        })),
        this.animGroup.addKeyframe(this.matrixContainer, r(r({}, this.baseKeyframes), {}, {
          end: "".concat(this.baseKeyframes.end, " + 60vh"),
          scale: [2.75, .24],
          easeFunction: "bezier(0.16, 0.00, 0.34, 1.00)"
        }))
      }
      _setupEvents() {
        this._createRenderer(),
        this._addLayers(),
        this._setupKeyframes(),
        this.anim.once("enhanced-destroy", this._destroy)
      }
      _createRenderer() {
        this.stickyWidth = this.stickyOverflow.clientWidth,
        this.stickyHeight = this.stickyOverflow.clientHeight,
        this.perspective = 800;
        const e = 2 * Math.atan(this.stickyHeight / 2 / this.perspective) * this.THREE.Math.RAD2DEG;
        this.camera = new this.THREE.PerspectiveCamera(e,this.stickyWidth / this.stickyHeight,1,5e4),
        this.camera.position.x = 0,
        this.camera.position.y = 0,
        this.camera.position.z = 1,
        this.scene = new this.THREE.Scene,
        this.scene.background = null,
        this.renderer = new this.THREE.WebGLRenderer({
          antialias: !0,
          alpha: !0
        }),
        this.renderer.setClearColor(0, 0),
        this.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio)),
        this._updateMatrix(),
        this.matrixContainer.prepend(this.renderer.domElement)
      }
      _addLayers() {
        this.materialOptions = e(164).bind(this)(),
        Object.keys(this.materialOptions.layers).map(e=>{
          this.layers[e] = new o(r({
            id: e,
            el: this.el,
            THREE: this.THREE
          }, this.materialOptions.layers[e])),
          this._layerKeyframeMaker(this.layers[e]),
          this.scene.add(this.layers[e].mesh)
        }
        )
      }
      _setupVisibilityKeyframes() {
        this.animGroup.addKeyframe(this.matrixContainer, r(r({}, this.baseKeyframes), {}, {
          end: "".concat(this.baseKeyframes.end, " + 60vh"),
          style: {
            on: {
              visibility: "visible"
            },
            off: {
              visibility: "hidden"
            }
          }
        })).controller.friendlyName = "maxtrix container",
        this.animGroup.addKeyframe(this.matrixContainer, r(r({}, this.baseKeyframes), {}, {
          start: "".concat(this.baseKeyframes.end, " + 40vh"),
          end: "".concat(this.baseKeyframes.end, " + 60vh"),
          opacity: [1, 0]
        }))
      }
      _setupKeyframes() {
        this.animGroup.addKeyframe(this.renderer, r(r({}, this.baseKeyframes), {}, {
          start: "".concat(this.baseKeyframes.start, " - 50vh"),
          end: "a0b",
          progress: [0, 1],
          event: "render"
        })).controller.friendlyName = "renderer",
        this.animGroup.getControllerForTarget(this.renderer).on("render", ()=>{
          this._render()
        }
        ),
        this.animGroup.addKeyframe(this.camera, r(r({}, this.baseKeyframes), {}, {
          zPosition: [1, 800],
          event: "update-camera",
          easeFunction: "bezier(0.97, 0.00, 0.90, 0.45)"
        })).controller.friendlyName = "camera",
        this.animGroup.getControllerForTarget(this.camera).on("update-camera", e=>{
          this.camera.position.z = e.tweenProps.zPosition.current
        }
        ),
        this.sceneScaleAnim = this.animGroup.addKeyframe(this.matrixContainer, r(r({}, this.baseKeyframes), {}, {
          start: this.baseKeyframes.end,
          end: "".concat(this.baseKeyframes.end, " + 60vh"),
          uScale: [1, "(css(--scene-size) / ".concat(Math.max(this.stickyWidth, this.stickyHeight), ")")],
          event: "update-scale",
          easeFunction: "bezier(0.16, -0.32, 0.00, 1.00)"
        })),
        this.animGroup.getControllerForTarget(this.matrixContainer).on("update-scale", e=>{
          this.scene.scale.x = e.tweenProps.uScale.current,
          this.scene.scale.y = e.tweenProps.uScale.current
        }
        )
      }
      _layerKeyframeMaker(e) {
        let t = {}
          , i = e.mesh
          , s = e.id
          , n = "layer1" === s ? "60vh" : "10vh";
        Object.keys(i.material.uniforms).map(e=>{
          "start"in i.material.uniforms[e] && "end"in i.material.uniforms[e] && "uOpacity" !== e && (t[e] = [i.material.uniforms[e].start, i.material.uniforms[e].end])
        }
        );
        let a = this.animGroup.addKeyframe(i, r(r(r({}, this.baseKeyframes), t), {}, {
          event: "update-uniforms"
        }));
        switch (a.controller.friendlyName = s,
        s) {
        case "hardware":
          break;
        case "layer0":
          this.animGroup.addKeyframe(i, r(r({}, this.baseKeyframes), {}, {
            start: "".concat(this.baseKeyframes.end, " - 20vh"),
            uOpacity: [i.material.uniforms.uOpacity.start, i.material.uniforms.uOpacity.end],
            event: "update-uniforms"
          }));
          break;
        default:
          this.animGroup.addKeyframe(i, r(r({}, this.baseKeyframes), {}, {
            end: "".concat(this.baseKeyframes.start, " + 10vh"),
            uOpacity: [0, 1],
            event: "update-uniforms"
          })),
          this.animGroup.addKeyframe(i, r(r({}, this.baseKeyframes), {}, {
            start: "".concat(this.baseKeyframes.start, " + 10vh"),
            end: "".concat(this.baseKeyframes.end, " - ").concat(n),
            uOpacity: [null, i.material.uniforms.uOpacity.end],
            event: "update-uniforms"
          })),
          this.animGroup.addKeyframe(i, r(r({}, this.baseKeyframes), {}, {
            start: "".concat(this.baseKeyframes.end, " - ").concat(n),
            uOpacity: [null, 0],
            event: "update-uniforms"
          }))
        }
        return this._animateUniforms(i),
        a
      }
      _animateUniforms(e) {
        this.animGroup.getControllerForTarget(e).on("update-uniforms", t=>{
          Object.keys(t.tweenProps).map(i=>{
            if (0 === i.indexOf("u"))
              switch (i) {
              case "uScale":
                e.scale.set(t.tweenProps.uScale.current, t.tweenProps.uScale.current, 1);
                break;
              case "uZPosition":
                e.position.z = t.tweenProps.uZPosition.current;
                break;
              default:
                e.material.uniforms[i].value = t.tweenProps[i].current
              }
          }
          )
        }
        )
      }
      async _loadImage(e, t) {
        return new Promise((i,s)=>{
          e.complete ? (e.addEventListener("load", ()=>{
            this.textureOptions[t].image && (this.textureOptions[t].image.src = e.currentSrc,
            this.textureOptions[t].needsUpdate = !0,
            this._render())
          }
          ),
          i(e)) : e.onload = ()=>i(e),
          e.onerror = s
        }
        )
      }
      _resizeMatrixVertices() {
        let e = .5 * Math.max(this.stickyWidth, this.stickyHeight);
        Object.keys(this.layers).map(t=>{
          let i = this.layers[t].mesh.geometry.getAttribute("position")
            , s = i.array
            , n = "hardware" !== t ? e * this.screenSize : e;
          s[0] = -n,
          s[1] = n,
          s[3] = n,
          s[4] = n,
          s[6] = -n,
          s[7] = -n,
          s[9] = n,
          s[10] = -n,
          i.needsUpdate = !0
        }
        )
      }
      _updateMatrix() {
        console.log('Component exp display', this)
        this.camera.fov = 2 * Math.atan(this.stickyHeight / 2 / this.perspective) * (180 / Math.PI),
        this.camera.aspect = this.stickyWidth / this.stickyHeight,
        this.camera.updateProjectionMatrix(),
        this.renderer.setSize(this.stickyWidth, this.stickyHeight)
      }
      _updateScaleAnim() {
        this.sceneScaleAnim.overwriteProps({
          uScale: [1, "(css(--scene-size) / ".concat(Math.max(this.stickyWidth, this.stickyHeight), ")")]
        })
      }
      _render() {
        this.renderer.render(this.scene, this.camera)
      }
      _destroy() {}
      onResizeDebounced(e) {
        window.THREE && (this.stickyWidth = this.stickyOverflow.clientWidth,
        this.stickyHeight = this.stickyOverflow.clientHeight,
        this._resizeMatrixVertices(),
        this._updateMatrix(),
        this._updateScaleAnim(),
        this._render())
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    164: 164,
    208: 208,
    212: 212,
    28: 28,
    29: 29,
    79: 79
  }],
  163: [function(e, t, i) {
    "use strict";
    t.exports = function() {
      return {
        material: {
          fragmentShader: [e(170).frag, "\n\t\tvoid main() {\n\t\t\tvec4 color = texture2DGradEXT(uTexture, vUv, dFdx(vUv), dFdy(vUv));\n\t\t\tgl_FragColor = color;\n\t\t}\n\t"].join("\n"),
          uniforms: {
            uTexture: {
              value: this.textureOptions.HARDWARE_TEXTURE
            },
            uZPosition: {
              name: "Z position",
              value: 700,
              start: 700,
              end: 1.5
            }
          }
        }
      }
    }
  }
  , {
    170: 170
  }],
  164: [function(e, t, i) {
    "use strict";
    t.exports = function() {
      return {
        layers: {
          hardware: e(163).bind(this)(),
          layer0: e(165).bind(this)(),
          layer1: e(166).bind(this)(),
          layer2: e(167).bind(this)(),
          layer3: e(168).bind(this)(),
          layer4: e(169).bind(this)()
        },
        shaderConstants: e(170)
      }
    }
  }
  , {
    163: 163,
    165: 165,
    166: 166,
    167: 167,
    168: 168,
    169: 169,
    170: 170
  }],
  165: [function(e, t, i) {
    "use strict";
    t.exports = function() {
      return {
        material: {
          fragmentShader: [e(170).frag, "\n\t\tvoid main() {\n\t\t\tvec3 color = texture2DGradEXT(uTexture, vUv, dFdx(vUv), dFdy(vUv)).rgb;\n\t\t\tgl_FragColor = vec4(color, uOpacity);\n\t\t}\n\t"].join("\n"),
          uniforms: {
            uTexture: {
              value: this.textureOptions.POSTERFRAME_TEXTURE
            },
            uZPosition: {
              name: "Z position",
              value: 100,
              start: 100,
              end: 1
            },
            uOpacity: {
              name: "Opacity",
              value: 0,
              start: 0,
              end: 1
            }
          }
        }
      }
    }
  }
  , {
    170: 170
  }],
  166: [function(e, t, i) {
    "use strict";
    t.exports = function() {
      return {
        material: {
          fragmentShader: [e(170).frag, "\n\t\tvoid main() {\n\t\t\tfloat N = uDotCount;\n\t\t\tvec2 center = vec2(0.5);\n\t\t\tvec2 dxy = vec2(1.0 / N);\n\t\t\tvec2 textureUv = (dxy * floor(vUv / dxy)) + (dxy * 0.5);\n\t\t\tvec2 pt = fract(vUv / dxy) - center;\n\n\t\t\tvec4 tex = texture2DGradEXT(uTexture, textureUv, dFdx(textureUv), dFdy(textureUv));\n\n\t\t\t// set base color of bordered squircle\n\t\t\tvec4 color = vec4(uStartColor, uOpacity);\n\n\t\t\t// bordered squircle\n\t\t\tcolor *= borderedSquircle(vec2(pt), vec2(uDotSize), uDotRadius, uDotThickness, 0.0);\n\n\t\t\t// glow\n\t\t\tcolor += tex * borderedSquircle(vec2(pt), vec2(uGlowSize), uGlowRadius, uGlowThickness, uGlowBlend);\n\n\t\t\tgl_FragColor = color * uOpacity;\n\t\t}\n\t"].join("\n"),
          uniforms: {
            uStartColor: {
              value: new this.THREE.Color("#26a5ff")
            },
            uTexture: {
              value: this.textureOptions.POSTERFRAME_TEXTURE
            },
            uDotCount: {
              value: 104 * this.dotMultiple
            },
            uDotSize: {
              value: .26
            },
            uDotRadius: {
              value: .09
            },
            uDotThickness: {
              value: .09
            },
            uGlowSize: {
              value: .2
            },
            uGlowRadius: {
              value: .14
            },
            uGlowThickness: {
              value: .28
            },
            uGlowBlend: {
              value: .36
            },
            uZPosition: {
              value: 1,
              start: 1,
              end: 1
            },
            uOpacity: {
              value: 1,
              start: 1,
              end: 1
            }
          }
        }
      }
    }
  }
  , {
    170: 170
  }],
  167: [function(e, t, i) {
    "use strict";
    t.exports = function() {
      return {
        material: {
          fragmentShader: [e(170).frag, "\n\t\tvoid main() {\n\t\t\tfloat N = uDotCount;\n\t\t\tvec2 center = vec2(0.5);\n\t\t\tvec2 dxy = vec2(1.0 / N);\n\t\t\tvec2 textureUv = (dxy * floor(vUv / dxy)) + (dxy * 0.5);\n\t\t\tvec2 pt = fract(vUv / dxy) - center;\n\n\t\t\tvec2 ipos = floor(textureUv);\n\t\t\tvec2 fpos = fract(textureUv);\n\t\t\tvec2 tile = randomSize(fpos, random(ipos));\n\t\t\tfloat variance = clamp(random(tile), 0.0, uVariance);\n\n\t\t\tvec4 color = texture2DGradEXT(uTexture, textureUv, dFdx(textureUv), dFdy(textureUv));\n\t\t\tcolor *= circle(vec2(pt), uDotSize, uDotBlend, variance);\n\n\t\t\tgl_FragColor = color * uOpacity;\n\t\t}\n\t"].join("\n"),
          uniforms: {
            uTexture: {
              value: this.textureOptions.POSTERFRAME_TEXTURE
            },
            uDotCount: {
              value: 460 * this.dotMultiple
            },
            uDotSize: {
              value: .34
            },
            uDotBlend: {
              value: .1
            },
            uVariance: {
              value: .08
            },
            uZPosition: {
              value: 100,
              start: 100,
              end: 1
            },
            uOpacity: {
              value: 1,
              start: 1,
              end: 1
            }
          }
        }
      }
    }
  }
  , {
    170: 170
  }],
  168: [function(e, t, i) {
    "use strict";
    t.exports = function() {
      return {
        material: {
          fragmentShader: [e(170).frag, "\n\t\tvoid main() {\n\t\t\tfloat N = uDotCount;\n\t\t\tvec2 center = vec2(0.5);\n\t\t\tvec2 dxy = vec2(1.0 / N);\n\t\t\tvec2 textureUv = (dxy * floor(vUv / dxy)) + (dxy * 0.5);\n\t\t\tvec2 pt = fract(vUv / dxy) - center;\n\n\t\t\tvec2 ipos = floor(textureUv);\n\t\t\tvec2 fpos = fract(textureUv);\n\t\t\tvec2 tile = randomSize(fpos, random(ipos));\n\t\t\tfloat variance = clamp(random(tile), 0.0, uVariance);\n\n\t\t\tvec4 color = texture2DGradEXT(uTexture, textureUv, dFdx(textureUv), dFdy(textureUv));\n\t\t\tcolor *= circle(vec2(pt), uDotSize, uDotBlend, variance);\n\n\t\t\tgl_FragColor = color * uOpacity;\n\t\t}\n\t"].join("\n"),
          uniforms: {
            uTexture: {
              value: this.textureOptions.POSTERFRAME_TEXTURE
            },
            uDotCount: {
              value: 311 * this.dotMultiple
            },
            uDotSize: {
              value: .35
            },
            uDotBlend: {
              value: .08
            },
            uVariance: {
              value: .03
            },
            uZPosition: {
              value: 300,
              start: 300,
              end: 1
            },
            uOpacity: {
              value: 1,
              start: 1,
              end: 1
            }
          }
        }
      }
    }
  }
  , {
    170: 170
  }],
  169: [function(e, t, i) {
    "use strict";
    t.exports = function() {
      return {
        material: {
          fragmentShader: [e(170).frag, "\n\t\tvoid main() {\n\t\t\tfloat N = uDotCount;\n\t\t\tvec2 center = vec2(0.5);\n\t\t\tvec2 dxy = vec2(1.0 / N);\n\t\t\tvec2 textureUv = (dxy * floor(vUv / dxy)) + (dxy * 0.5);\n\t\t\tvec2 pt = fract(vUv / dxy) - center;\n\n\t\t\tvec2 ipos = floor(textureUv);\n\t\t\tvec2 fpos = fract(textureUv);\n\t\t\tvec2 tile = randomSize(fpos, random(ipos));\n\t\t\tfloat variance = clamp(random(tile), 0.0, uVariance);\n\n\t\t\tvec4 color = texture2DGradEXT(uTexture, textureUv, dFdx(textureUv), dFdy(textureUv));\n\t\t\tcolor *= circle(vec2(pt), uDotSize, uDotBlend, variance);\n\n\t\t\tgl_FragColor = color * uOpacity;\n\t\t}\n\t"].join("\n"),
          uniforms: {
            uTexture: {
              value: this.textureOptions.POSTERFRAME_TEXTURE
            },
            uDotCount: {
              value: 210 * this.dotMultiple
            },
            uDotSize: {
              value: .54
            },
            uDotBlend: {
              value: .49
            },
            uVariance: {
              value: 0
            },
            uZPosition: {
              value: 700,
              start: 700,
              end: 1
            },
            uOpacity: {
              value: 1,
              start: 1,
              end: 1
            }
          }
        }
      }
    }
  }
  , {
    170: 170
  }],
  170: [function(e, t, i) {
    "use strict";
    t.exports = {
      vert: "\n\t\tvarying vec2 vUv;\n\t\tvoid main() {\n\t\t\tvUv = uv;\n\t\t\tgl_Position  = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\t\t}\n\t",
      frag: "\n\t\tuniform sampler2D uTexture;\n\t\tuniform vec3 uStartColor;\n\t\tuniform float uDotCount;\n\t\tuniform float uDotBlend;\n\t\tuniform float uDotSize;\n\t\tuniform float uOpacity;\n\t\tuniform float uVariance;\n\t\tuniform float uDotRadius;\n\t\tuniform float uDotThickness;\n\t\tuniform float uGlowSize;\n\t\tuniform float uGlowRadius;\n\t\tuniform float uGlowThickness;\n\t\tuniform float uGlowBlend;\n\n\t\tvarying vec2 vUv;\n\n\t\tfloat borderedSquircle(vec2 pos, vec2 size, float radius, float thickness, float blend) {\n\t\t\tfloat d = length(max(abs(pos), size) - size) - radius;\n\t\t\treturn smoothstep(0.55, 0.51 - blend, abs(d / thickness));\n\t\t}\n\n\t\tfloat random(in vec2 pt) {\n\t\t\treturn fract(sin(dot(pt.xy,vec2(12.9898,78.233)))*43758.5453123);\n\t\t}\n\n\t\tvec2 randomSize(in vec2 pt, in float i) {\n\t\t\ti = fract(i * 2.0);\n\n\t\t\tif (i > 0.5) { pt = vec2(1.0) - pt; }\n\t\t\telse { pt = vec2(1.0 - pt.x, pt.y); }\n\n\t\t\treturn pt;\n\t\t}\n\n\t\tfloat circle(vec2 pt, float size, float blend, float variance) {\n\t\t\tfloat len = length(pt);\n\t\t\tfloat result = 1.0 - smoothstep((size - variance) - blend, (size - variance), len);\n\n\t\t\treturn result;\n\t\t}\n\t"
    }
  }
  , {}],
  171: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.fadeInKeyframe = null,
        this.scaleKeyframe = null,
        this.fadeOutKeyframe = null,
        this.visibilityKeyframe = null,
        this.zoomEl = this.el.querySelector(".headline-zoom"),
        this.zoomElWrapper = this.el.querySelector(".headline-zoom-wrapper"),
        this.zoomElContent = this.el.querySelector(".headline-zoom-content"),
        this.zoomEaseFunction = "bezier(0.16, 0.00, 0.34, 1.00)",
        this.perspective = parseInt(getComputedStyle(this.zoomEl).getPropertyValue("--perspective")),
        this.textScale = parseInt(getComputedStyle(this.zoomEl).getPropertyValue("--text-scale")),
        this.scaleDuration = "a0h",
        this.fadeDuration = "10vh",
        this.anchorElSelector = this.zoomEl.getAttribute("data-anchor-selector"),
        this.anchorEl = this.el.querySelector(this.anchorElSelector) || this.el.querySelector(".timeline-zoom-headline"),
        this.endExpression = this.zoomEl.getAttribute("data-end-expression") || "a0b - 100vh",
        this.startExpression = "".concat(this.endExpression, " - ").concat(this.scaleDuration),
        this._destroy = this._destroy.bind(this)
      }
      mounted() {
        this._setupEvents(),
        this._setupVisibilityKeyframes(),
        this._setupKeyframes()
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy)
      }
      _setupKeyframes() {
        this.fadeInKeyframe = this.anim.addKeyframe(this.zoomElWrapper, {
          start: this.startExpression,
          end: "".concat(this.startExpression, " + ").concat(this.fadeDuration),
          anchors: [this.anchorEl],
          opacity: [0, 1],
          disabledWhen: ["no-enhanced"]
        }),
        this.scaleKeyframe = this.anim.addKeyframe(this.zoomElWrapper, {
          start: this.startExpression,
          end: this.endExpression,
          anchors: [this.anchorEl],
          z: [0, -this._convertScaleToZ(this.perspective * this.textScale, this.textScale)],
          easeFunction: this.zoomEaseFunction,
          disabledWhen: ["no-enhanced"]
        }),
        this.fadeOutKeyframe = this.anim.addKeyframe(this.zoomElWrapper, {
          start: "".concat(this.endExpression, " - ").concat(this.fadeDuration),
          end: this.endExpression,
          anchors: [this.anchorEl],
          opacity: [1, 0],
          disabledWhen: ["no-enhanced"]
        })
      }
      _setupVisibilityKeyframes() {
        this.visibilityKeyframe = this.anim.addKeyframe(this.zoomElWrapper, {
          start: this.startExpression,
          end: this.endExpression,
          cssClass: "visibility-visible",
          toggle: !0,
          anchors: [this.anchorEl],
          disabledWhen: ["no-enhanced"]
        })
      }
      _convertScaleToZ(e, t) {
        return e * (t - 1) / t
      }
      _destroy() {
        this.fadeInKeyframe.remove(),
        this.scaleKeyframe.remove(),
        this.fadeOutKeyframe.remove(),
        this.visibilityKeyframe.remove()
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    79: 79
  }],
  172: [function(e, t, i) {
    "use strict";
    var s = e(29)(e(28));
    function n(e, t) {
      var i = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var s = Object.getOwnPropertySymbols(e);
        t && (s = s.filter((function(t) {
          return Object.getOwnPropertyDescriptor(e, t).enumerable
        }
        ))),
        i.push.apply(i, s)
      }
      return i
    }
    function r(e) {
      for (var t = 1; t < arguments.length; t++) {
        var i = null != arguments[t] ? arguments[t] : {};
        t % 2 ? n(Object(i), !0).forEach((function(t) {
          (0,
          s.default)(e, t, i[t])
        }
        )) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(i)) : n(Object(i)).forEach((function(t) {
          Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(i, t))
        }
        ))
      }
      return e
    }
    const a = e(79);
    t.exports = class extends a {
      constructor(e) {
        super(e),
        this.radialWrapper = this.el.querySelector(".radial-wrapper"),
        this.radialShadow = this.el.querySelector(".radial-shadow"),
        this.gradientImg = this.el.querySelector(".image-experience-intro-5g-gradient"),
        this.headlineBlendMode = this.el.querySelector(".headline-blend-mode-wrapper .wireless-headline"),
        this.headlineClipText = this.el.querySelector(".headline-clip-text-wrapper .wireless-headline"),
        this.animation = {
          t1: {
            anchors: [".timeline-wireless-flood-screen"],
            start: "a0t",
            end: "a0b",
            crossFade: "a0b - 10vh"
          },
          t2: {
            anchors: [".timeline-wireless-headline", ".timeline-wireless-rings"],
            start: "a0t",
            end: "a0b",
            crossFadeStart: "a0t + 32a0h",
            crossFadeEnd: "a0t + 52a0h",
            scaleStart: "a0t - 6vh",
            scaleEnd: "a1b",
            scale: {
              L: {
                from: 1.2,
                to: .2
              },
              S: {
                from: 1.8,
                to: .5
              }
            }
          },
          t3: {
            anchors: [".timeline-wireless-rings"],
            start: "a0t",
            end: "a0b"
          }
        },
        this._destroy = this._destroy.bind(this),
        this.kf = null,
        this.allKfs = []
      }
      mounted() {
        this._setupEvents(),
        this._setupKeyframes(),
        this._setupVisibilityKeyframes(),
        this._setupWillChangeKeyframes()
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy)
      }
      _setupKeyframes() {
        let e = {
          start: this.animation.t1.start,
          end: this.animation.t1.end,
          anchors: this.animation.t1.anchors,
          disabledWhen: ["no-enhanced"]
        };
        this.kf = this.anim.addKeyframe(this.radialWrapper, r(r({}, e), {}, {
          opacity: [0, 1]
        })),
        this.allKfs.push(this.kf),
        this.radialShadow && (this.kf = this.anim.addKeyframe(this.radialShadow, r(r({}, e), {}, {
          progress: [0, 120]
        })),
        this.kf.controller.on("draw", e=>{
          const t = e.tweenProps.progress.current;
          this.radialShadow.style.setProperty("--shadow-position", "".concat(t, "%"))
        }
        ),
        this.allKfs.push(this.kf));
        let t = {
          start: this.animation.t2.scaleStart,
          end: this.animation.t2.scaleEnd,
          anchors: this.animation.t2.anchors,
          easeFunction: "easeOutQuad",
          disabledWhen: ["no-enhanced"]
        };
        this.kf = this.anim.addKeyframe(this.headlineBlendMode, r(r({}, t), {}, {
          scale: [this.animation.t2.scale.L.from, this.animation.t2.scale.L.to],
          breakpointMask: "LM"
        })),
        this.allKfs.push(this.kf),
        this.kf = this.anim.addKeyframe(this.headlineBlendMode, r(r({}, t), {}, {
          scale: [this.animation.t2.scale.S.from, this.animation.t2.scale.S.to],
          breakpointMask: "S"
        })),
        this.allKfs.push(this.kf),
        this.kf = this.anim.addKeyframe(this.headlineClipText, r(r({}, t), {}, {
          scale: [this.animation.t2.scale.L.from, this.animation.t2.scale.L.to],
          breakpointMask: "LM"
        })),
        this.allKfs.push(this.kf),
        this.kf = this.anim.addKeyframe(this.headlineClipText, r(r({}, t), {}, {
          scale: [this.animation.t2.scale.S.from, this.animation.t2.scale.S.to],
          breakpointMask: "S"
        })),
        this.allKfs.push(this.kf),
        this.kf = this.anim.addKeyframe(this.headlineBlendMode, {
          start: "".concat(this.animation.t2.start, " - 4vh"),
          end: "".concat(this.animation.t2.crossFadeStart, " - 1vh"),
          anchors: this.animation.t2.anchors,
          darkenBg: [0, 100],
          easeFunction: "easeInQuint",
          disabledWhen: ["no-enhanced"]
        }),
        this.kf.controller.on("draw", e=>{
          const t = e.tweenProps.darkenBg.current;
          this.headlineBlendMode.style.setProperty("background-color", "hsla(0, 0%, 0%, ".concat(t, "%)"))
        }
        ),
        this.allKfs.push(this.kf),
        this.kf = this.anim.addKeyframe(this.headlineClipText, {
          start: "".concat(this.animation.t2.crossFadeStart, " - 1vh"),
          end: this.animation.t2.scaleEnd,
          anchors: this.animation.t2.anchors,
          cssClass: "show",
          toggle: !0,
          disabledWhen: ["no-enhanced"]
        }),
        this.allKfs.push(this.kf),
        this.kf = this.anim.addKeyframe(this.headlineClipText, {
          start: this.animation.t2.crossFadeStart,
          end: this.animation.t2.crossFadeEnd,
          anchors: this.animation.t2.anchors,
          opacity: [0, 1],
          disabledWhen: ["no-enhanced"]
        }),
        this.allKfs.push(this.kf),
        this.kf = this.anim.addKeyframe(this.gradientImg, {
          start: "".concat(this.animation.t2.crossFadeEnd, " - 1vh"),
          end: this.animation.t2.crossFadeEnd,
          anchors: this.animation.t2.anchors,
          opacity: [1, 0],
          disabledWhen: ["no-enhanced"]
        }),
        this.allKfs.push(this.kf),
        this.kf = this.anim.addKeyframe(this.headlineClipText, {
          start: "a0b - 10vh",
          end: "a0b",
          anchors: this.animation.t3.anchors,
          opacity: [1, 0],
          disabledWhen: ["no-enhanced"]
        }),
        this.allKfs.push(this.kf)
      }
      _setupVisibilityKeyframes() {
        this.kf = this.anim.addKeyframe(this.radialWrapper, {
          start: "a0t - 10vh",
          end: "a0b - 80vh",
          style: {
            on: {
              visibility: "visible"
            },
            off: {
              visibility: "hidden"
            }
          },
          anchors: [this.el],
          disabledWhen: ["no-enhanced"]
        }),
        this.allKfs.push(this.kf),
        this.kf = this.anim.addKeyframe(this.headlineBlendMode, {
          start: "".concat(this.animation.t2.scaleStart, " + 10vh"),
          end: "".concat(this.animation.t2.scaleEnd, " - 10vh"),
          anchors: this.animation.t2.anchors,
          style: {
            on: {
              visibility: "visible"
            },
            off: {
              visibility: "hidden"
            }
          },
          disabledWhen: ["no-enhanced"]
        }),
        this.allKfs.push(this.kf)
      }
      _setupWillChangeKeyframes() {
        this.kf = this.anim.addKeyframe(this.radialWrapper, {
          start: "".concat(this.animation.t2.crossFadeEnd, "  - 50vh"),
          end: "".concat(this.animation.t2.scaleEnd, " + 10vh"),
          anchors: this.animation.t2.anchors,
          cssClass: "will-change-transform",
          toggle: !0,
          disabledWhen: ["chrome", "no-enhanced"]
        }),
        this.allKfs.push(this.kf)
      }
      _destroy() {
        const e = this.anim.getControllerForTarget(this.el);
        this.allKfs.push(e),
        this.allKfs.forEach(e=>{
          e && this.kf.remove().then(()=>{
            this.el.removeAttribute("style")
          }
          )
        }
        )
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    28: 28,
    29: 29,
    79: 79
  }],
  173: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.els = this.el.querySelectorAll(".wireless-headline-fragment"),
        this._destroy = this._destroy.bind(this),
        this.kf = null,
        this.allKfs = []
      }
      mounted() {
        this._setupEvents(),
        this._setupKeyframes()
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy)
      }
      _setupKeyframes() {
        this.els.forEach(e=>{
          const t = e.classList.contains("fragment-right")
            , i = t ? "" : "-"
            , s = t ? "-" : "";
          this.kf = this.anim.addKeyframe(e, {
            start: "a0t",
            end: "a0b",
            anchors: [".timeline-wireless-headline"],
            x: ["".concat(i, "7vw"), "".concat(s, "2.2vw")],
            easeFunction: "easeInOutSin",
            disabledWhen: ["no-enhanced"]
          }),
          this.allKfs.push(this.kf)
        }
        ),
        this.kf = this.anim.addKeyframe(this.el, {
          start: "a0t - 10vh",
          end: "a0b + 50vh",
          anchors: [".timeline-wireless-headline"],
          cssClass: "will-change",
          toggle: !0,
          disabledWhen: ["chrome", "no-enhanced"]
        }),
        this.allKfs.push(this.kf)
      }
      _destroy() {
        const e = this.anim.getControllerForTarget(this.el);
        this.allKfs.push(e),
        this.allKfs.forEach(e=>{
          e && this.kf.remove()
        }
        )
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    79: 79
  }],
  174: [function(e, t, i) {
    "use strict";
    const s = e(79)
      , n = e(72);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this._els = this.el.querySelectorAll("[data-focus-expression]"),
        this._handleFocus = this._handleFocus.bind(this),
        this._onPressDown = this._onPressDown.bind(this),
        this._onRelease = this._onRelease.bind(this),
        this._destroy = this._destroy.bind(this)
      }
      mounted() {
        this._parseOptions(),
        this._setTabIndex(),
        this._setupEvents()
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy),
        this.el.addEventListener("focusin", this._handleFocus),
        this.el.addEventListener("mousedown", this._onPressDown),
        this.el.addEventListener("mouseup", this._onRelease),
        this.el.addEventListener("touchstart", this._onPressDown),
        this.el.addEventListener("touchend", this._onRelease)
      }
      _destroy() {
        this._removeTabIndex(),
        this.el.removeEventListener("focusin", this._handleFocus),
        this.el.removeEventListener("mousedown", this._onPressDown),
        this.el.removeEventListener("mouseup", this._onRelease),
        this.el.removeEventListener("touchstart", this._onPressDown),
        this.el.removeEventListener("touchend", this._onRelease)
      }
      _onPressDown() {
        this._pressDown = !0
      }
      _onRelease() {
        this._pressDown = !1
      }
      _parseOptions() {
        this._els.forEach(e=>{
          const t = JSON.parse(e.getAttribute("data-focus-expression"));
          e._focusExpression = t.expression,
          t.hasOwnProperty("anchors") && (e._focusAnchors = t.anchors.map(e=>document.querySelector(e))),
          t.hasOwnProperty("tabindex") && (e._tabIndex = t.tabindex)
        }
        )
      }
      _handleFocus(e) {
        if (this._pressDown)
          return;
        const t = e.target;
        if (t.hasAttribute("data-focus-expression")) {
          let e = {
            target: t
          };
          t._focusAnchors && (e.anchors = t._focusAnchors),
          window.scrollTo(0, n.parse(t._focusExpression, e)),
          "-1" === t.getAttribute("tabindex") && t.blur()
        }
      }
      _setTabIndex() {
        this._els.forEach(e=>{
          let t = -1;
          e.hasOwnProperty("_tabIndex") && (t = e._tabIndex),
          e.setAttribute("tabindex", t)
        }
        )
      }
      _removeTabIndex() {
        this._els.forEach(e=>e.removeAttribute("tabindex"))
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    72: 72,
    79: 79
  }],
  175: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.hardwareLeft = this.el.querySelector(".hardware-left-wrapper"),
        this.hardwareRight = this.el.querySelector(".hardware-right-wrapper"),
        this.shadow = this.el.querySelector(".overview-wireless-5g-left-shadow"),
        this._destroy = this._destroy.bind(this)
      }
      mounted() {
        this.setupKeyframes(),
        this.setupPerformanceKeyframes()
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy)
      }
      setupKeyframes() {
        this.leftParallaxKeyframe = this.anim.addKeyframe(this.hardwareLeft, {
          start: "a0t - 100vh",
          end: "a0b",
          y: ["css(--left-hardware-parallax)", "css(--left-hardware-parallax) * -1"],
          ease: .2,
          anchors: [this.el],
          disabledWhen: ["no-enhanced"]
        }),
        this.rightParallaxKeyframe = this.anim.addKeyframe(this.hardwareRight, {
          start: "a0t - 100vh",
          end: "a0b",
          y: ["css(--right-hardware-parallax)", "css(--right-hardware-parallax) * -1"],
          ease: .2,
          anchors: [this.el],
          disabledWhen: ["no-enhanced"]
        }),
        this.shadowParallaxKeyframe = this.anim.addKeyframe(this.shadow, {
          start: "a0t - 100vh",
          end: "a0b",
          y: ["css(--right-hardware-parallax)", "css(--right-hardware-parallax) * -1"],
          ease: .2,
          anchors: [this.el],
          disabledWhen: ["no-enhanced"]
        })
      }
      setupPerformanceKeyframes() {
        this.hardwareLeftPerformanceKeyframe = this.anim.addKeyframe(this.hardwareLeft, {
          start: "a0t - 100vh",
          end: "a0b + 100vh",
          cssClass: "will-change-transform",
          anchors: [this.el],
          toggle: !0,
          disabledWhen: ["no-enhanced"]
        }),
        this.hardwareRightPerformanceKeyframe = this.anim.addKeyframe(this.hardwareRight, {
          start: "a0t - 100vh",
          end: "a0b + 100vh",
          cssClass: "will-change-transform",
          anchors: [this.el],
          toggle: !0,
          disabledWhen: ["no-enhanced"]
        }),
        this.shadowPerformanceKeyframe = this.anim.addKeyframe(this.shadow, {
          start: "a0t - 100vh",
          end: "a0b + 100vh",
          cssClass: "will-change-transform",
          anchors: [this.el],
          toggle: !0,
          disabledWhen: ["no-enhanced"]
        })
      }
      _destroy() {
        this.leftParallaxKeyframe.remove(),
        this.rightParallaxKeyframe.remove(),
        this.shadowParallaxKeyframe.remove(),
        this.hardwareLeftPerformanceKeyframe.remove(),
        this.hardwareRightPerformanceKeyframe.remove(),
        this.shadowPerformanceKeyframe.remove()
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    79: 79
  }],
  176: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e);
        this.settings = {
          imageRatio: 2615 / 2013,
          xCenterLarge: Math.round(580 / 2615 * 100),
          xCenterSmall: Math.round(600 / 2615 * 100),
          yCenter: Math.round(-700 / 2013 * 100),
          targetWidth: Math.round(800 / 2615 * 100),
          targetHeight: Math.round(715 / 2013 * 100),
          anchors: [".section-experience-hero"],
          ease: "cubic-bezier(0.66,0.00,0.70,1.00)"
        },
        this.image = this.el.querySelector("img"),
        this._destroy = this._destroy.bind(this)
      }
      mounted() {
        this._setupEvents(),
        this.setupPerformanceKeyframes(),
        this.setupPerformanceVisibiltyKeyframes(),
        this.setupVisibiltyKeyframes(),
        this.setupGradientImageKeyframes(),
        this.setupOpacityKeyframes()
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy)
      }
      setupScaleKeyframes() {
        const e = this.image;
        this.imageCover = "max(100vw/".concat(this.settings.targetWidth, "w, 100vh/").concat(this.settings.targetHeight, "h)");
        const t = "(100w - (100h * ".concat(this.settings.imageRatio, ")) / 2")
          , i = "".concat(t, " * ").concat(this.imageCover, " / 2");
        this.scaleKeyframe = this.anim.addKeyframe(e, {
          start: "a0t",
          end: "a0t + 50vh",
          scale: [1, this.imageCover],
          x: [0, "".concat(this.settings.xCenterLarge, "w  * ").concat(this.imageCover, " - ").concat(i)],
          y: [0, "".concat(this.settings.yCenter, "h * ").concat(this.imageCover)],
          anchors: this.settings.anchors,
          breakpointMask: ["M", "L"],
          easeFunction: this.settings.ease
        }).controller.friendlyName = "Hero Image",
        this.scaleKeyframeSmall = this.anim.addKeyframe(e, {
          start: "a0t",
          end: "a0t + 50vh",
          scale: [1.8, this.imageCover],
          x: ["50w", "".concat(this.settings.xCenterSmall, "w * ").concat(this.imageCover, " - ").concat(i)],
          y: [0, "".concat(this.settings.yCenter, "h * ").concat(this.imageCover)],
          anchors: this.settings.anchors,
          breakpointMask: ["S"],
          easeFunction: this.settings.ease
        })
      }
      setupGradientImageKeyframes() {
        const e = document.querySelector("#hero-gradient");
        this.gradientKeyframe = this.anim.addKeyframe(e, {
          start: "a0t + 35vh",
          end: "a0t + 40vh",
          y: ["-100%", 0],
          anchors: this.settings.anchors
        }).controller.friendlyName = "Hero Gradient Overlay"
      }
      setupOpacityKeyframes() {
        const e = document.querySelector("#hero img");
        this.opacityKeyframe = this.anim.addKeyframe(e, {
          start: "a0t + 40vh",
          end: "a0t + 50vh",
          opacity: [1, 0],
          anchors: this.settings.anchors
        }).controller.friendlyName = "Hero Component"
      }
      setupVisibiltyKeyframes() {
        this.visibilityKeyframe = this.anim.addKeyframe(this.el, {
          start: "0",
          end: "a0t + 50vh",
          cssClass: "visible",
          anchors: this.settings.anchors,
          breakpointMask: ["S"]
        })
      }
      setupPerformanceVisibiltyKeyframes() {
        const e = document.querySelector(".sticky-content-hero");
        this.perfVisibilityKeyframe = this.anim.addKeyframe(e, {
          start: "a0t + 50vh",
          style: {
            on: {
              visibility: "hidden"
            },
            off: {
              visibility: "visible"
            }
          },
          anchors: this.settings.anchors,
          toggle: !0
        });
        const t = document.querySelector("#hero-gradient");
        this.perfVisibilityKeyframe = this.anim.addKeyframe(t, {
          start: "a0t + 50vh",
          style: {
            on: {
              visibility: "hidden"
            },
            off: {
              visibility: "visible"
            }
          },
          anchors: this.settings.anchors,
          toggle: !0
        })
      }
      setupPerformanceKeyframes() {
        const e = document.querySelector(".sticky-wrapper-hero");
        this.performanceKeyframe = this.anim.addKeyframe(e, {
          start: "a0t - 10vh",
          end: "a0t + 80vh",
          cssClass: "will-change",
          anchors: this.settings.anchors,
          toggle: !0
        }).controller.friendlyName = "Hero Performance"
      }
      _destroy() {
        const e = this.anim.getScrollGroupForTarget(this.el);
        e.destroyed || e.remove()
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    79: 79
  }],
  177: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this._destroy = this._destroy.bind(this)
      }
      mounted() {
        this._setupEvents(),
        this.setupGradientKeyframes(),
        this.setupOpacityKeyframes()
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy)
      }
      setupGradientKeyframes() {
        const e = document.querySelector("#hero-headline-gradient");
        this.anim.addKeyframe(e, {
          start: "a0t + 40vh",
          style: {
            on: {
              visibility: "visible"
            },
            off: {
              visibility: "hidden"
            }
          },
          anchors: [".section-experience-hero"],
          toggle: !0,
          disabledWhen: "no-enhanced"
        }).controller.friendlyName = "Headline Gradient",
        this.anim.addKeyframe(e, {
          start: "a0t + 40vh",
          end: "a0t + 45vh",
          y: ["-100%", 0],
          anchors: [".section-experience-hero"],
          disabledWhen: "no-enhanced"
        })
      }
      setupOpacityKeyframes() {
        this.anim.addKeyframe(this.el, {
          start: "a0t + 45vh",
          end: "a0t + 50vh",
          opacity: [1, 0],
          anchors: [".section-experience-hero"],
          disabledWhen: "no-enhanced"
        }).controller.friendlyName = "Headline Component",
        this.anim.addKeyframe(this.el, {
          start: "a0t + 50vh",
          style: {
            on: {
              visibility: "hidden"
            },
            off: {
              visibility: "visible"
            }
          },
          anchors: [".section-experience-hero"],
          toggle: !0,
          disabledWhen: "no-enhanced"
        })
      }
      _destroy() {}
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    79: 79
  }],
  178: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this._destroy = this._destroy.bind(this)
      }
      mounted() {
        this._setupEvents(),
        this.setupOpacityKeyframes()
      }
      setupOpacityKeyframes() {
        this.anim.addKeyframe(this.el, {
          start: "a0t + 47vh",
          end: "a0t + 50vh",
          opacity: [1, 0],
          anchors: [".section-experience-hero"],
          disabledWhen: "no-enhanced"
        }).controller.friendlyName = "Sub Headline Component"
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy)
      }
      _destroy() {}
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    79: 79
  }],
  179: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this._destroy = this._destroy.bind(this)
      }
      mounted() {
        this._setupEvents(),
        this.setupScaleKeyframes()
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy)
      }
      setupScaleKeyframes() {
        this.scaleKeyframe = this.anim.addKeyframe(this.el, {
          start: "a0t",
          end: "a0t + 60vh",
          scale: [1, .6],
          anchors: [".section-experience-hero"],
          easeFunction: "cubic-bezier(0.66, 0.00, 0.34, 1.00)",
          disabledWhen: "no-enhanced"
        }).controller.friendlyName = "Hero Headlines"
      }
      _destroy() {}
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    79: 79
  }],
  180: [function(e, t, i) {
    "use strict";
    const s = e(79)
      , {Media: n} = e(93)
      , r = e(183)
      , a = e(181)
      , o = e(182)
      , h = e(184)
      , l = e(185);
    t.exports = class extends s {
      constructor(e) {
        super(e)
      }
      async mounted() {
        n.addPlugin("PlaybackTrigger", r),
        n.addPlugin("PlayOnce", a),
        n.addPlugin("PlayPauseReplayButton", o),
        n.addPlugin("ReplayButton", h),
        n.addPlugin("Reset", l),
        this.mediaInstance = await n.autoInitialize(this.el, {
          anim: this.gum.anim
        })
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("inline-video")
      }
    }
  }
  , {
    181: 181,
    182: 182,
    183: 183,
    184: 184,
    185: 185,
    79: 79,
    93: 93
  }],
  181: [function(e, t, i) {
    "use strict";
    const s = e(97).default
      , n = e(110).default;
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this._endFrame = document.querySelector("." + this.media.id + " .inline-media-end-frame"),
        this._playedOnce = !1,
        this._currentBreakpoint = null,
        this._onBreakpointChange = this._onBreakpointChange.bind(this),
        this._initializeBreakpointDetectAnim()
      }
      async play() {
        return !1 === this._playedOnce ? (this._playedOnce = !0,
        super.play()) : null
      }
      _initializeBreakpointDetectAnim() {
        const e = Object.assign({
          callback: this._onBreakpointChange
        }, this.options);
        this._breakpointDetect = new n(e),
        this._currentBreakpoint = this._breakpointDetect.breakpoint,
        this._onBreakpointChange()
      }
      _onBreakpointChange() {
        let e = this._breakpointDetect.breakpoint;
        this._currentBreakpoint !== e && (this._currentBreakpoint = e,
        this._endFrame.style.opacity = 1)
      }
    }
  }
  , {
    110: 110,
    97: 97
  }],
  182: [function(e, t, i) {
    "use strict";
    const s = e(108).default
      , n = e(92).default;
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this._buttonLabelPlay = this._button.dataset.labelPlay,
        this._buttonLabelPause = this._button.dataset.labelPause,
        this._buttonLabelReplay = this._button.dataset.labelReplay,
        this._ariaLabelEnded = this._button.dataset.ariaEnded,
        this._buttonAnalyticsName = this._button.dataset.analyticsName,
        this.refocusButton = this._container.querySelector(".refocus-button")
      }
      _onPlaybackStateChange() {
        const e = this.media.playbackState === n.PLAYING
          , t = this.media.playbackState === n.ENDED;
        e ? (this._button.setAttribute("aria-label", this._ariaLabels.paused),
        this._button.setAttribute("data-analytics-title", "pause ".concat(this._buttonAnalyticsName, " video")),
        this._button.setAttribute("data-analytics-click", "prop3:pause ".concat(this._buttonAnalyticsName, " video")),
        this._button.innerHTML = this._buttonLabelPause) : (this._button.setAttribute("aria-label", this._ariaLabels.playing),
        this._button.setAttribute("data-analytics-title", "play ".concat(this._buttonAnalyticsName, " video")),
        this._button.setAttribute("data-analytics-click", "prop3:play ".concat(this._buttonAnalyticsName, " video")),
        this._button.innerHTML = this._buttonLabelPlay),
        t && (this._button.setAttribute("aria-label", this._ariaLabelEnded || "Replay"),
        this._button.setAttribute("data-analytics-title", "replay ".concat(this._buttonAnalyticsName, " video")),
        this._button.setAttribute("data-analytics-click", "prop3:replay ".concat(this._buttonAnalyticsName, " video")),
        this._button.innerHTML = this._buttonLabelReplay,
        this.refocusButtonState(this._button)),
        this._button.addEventListener("click", e=>{
          this.refocusButtonState(e.target)
        }
        ),
        this._setAnalyticsState(e)
      }
      refocusButtonState(e) {
        this.refocusButton.focus(),
        setTimeout(()=>{
          e.focus()
        }
        , 200)
      }
    }
  }
  , {
    108: 108,
    92: 92
  }],
  183: [function(e, t, i) {
    "use strict";
    const s = e(100).default
      , n = e(90).default
      , r = e(92).default;
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this._animationTriggerTiming = 0,
        this._timerDelay = 100,
        this._targetElement = document.querySelector('[data-inline-media-controller="' + this.media.id + '"]') || null,
        this._initialize()
      }
      _initialize() {
        null !== this._targetElement && this.media.on(n.PLAYBACK_STATE_CHANGE, this._onPlayBackStateChange.bind(this))
      }
      _onPlayBackStateChange() {
        const e = this.media.playbackState === r.PLAYING
          , t = this.media.playbackState === r.ENDED;
        if (e) {
          const e = new Event("INLINE_MEDIA_STARTED");
          this._targetElement.dispatchEvent(e),
          this._startPlaybackTimer()
        }
        if (t) {
          const e = new Event("INLINE_MEDIA_ENDED");
          this._targetElement.dispatchEvent(e),
          this._stopPlaybackTimer()
        }
      }
      _startPlaybackTimer() {
        this._animationTriggerTiming = this._targetElement.dataset.inlineMediaAnimationTriggerTiming ? parseFloat(this._targetElement.dataset.inlineMediaAnimationTriggerTiming) : this._animationTriggerTiming,
        clearInterval(this._timer),
        this._timer = setInterval(this._checkAnimationTrigger.bind(this), this._timerDelay)
      }
      _checkAnimationTrigger() {
        if (this.media.el.currentTime >= this._animationTriggerTiming) {
          const e = new Event("INLINE_MEDIA_TRIGGER");
          this._targetElement.dispatchEvent(e),
          this._stopPlaybackTimer()
        }
      }
      _stopPlaybackTimer() {
        clearInterval(this._timer)
      }
    }
  }
  , {
    100: 100,
    90: 90,
    92: 92
  }],
  184: [function(e, t, i) {
    "use strict";
    const s = e(100).default
      , n = e(90).default
      , r = e(92).default;
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this._playedOnce = !1,
        this._replayButton = document.querySelector('[data-inline-media-controller="' + this.media.id + '"]') || null,
        this._initialize()
      }
      _initialize() {
        null !== this._replayButton && (this._replayButton.addEventListener("click", this._replayVideo.bind(this)),
        this.media.on(n.PLAYBACK_STATE_CHANGE, this._onPlayBackStateChange.bind(this)))
      }
      _onPlayBackStateChange() {
        const e = this.media.playbackState === r.PLAYING
          , t = this.media.playbackState === r.ENDED;
        e && (this._replayButton.disabled = !0),
        t && (this._replayButton.disabled = !1,
        this._playedOnce || (this._playedOnce = !0,
        this._replayButton.classList.add("played-once")))
      }
      _replayVideo() {
        this.media.el.currentTime = 0,
        this.media.el.play()
      }
    }
  }
  , {
    100: 100,
    90: 90,
    92: 92
  }],
  185: [function(e, t, i) {
    "use strict";
    var s = e(29)(e(28));
    function n(e, t) {
      var i = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var s = Object.getOwnPropertySymbols(e);
        t && (s = s.filter((function(t) {
          return Object.getOwnPropertyDescriptor(e, t).enumerable
        }
        ))),
        i.push.apply(i, s)
      }
      return i
    }
    function r(e) {
      for (var t = 1; t < arguments.length; t++) {
        var i = null != arguments[t] ? arguments[t] : {};
        t % 2 ? n(Object(i), !0).forEach((function(t) {
          (0,
          s.default)(e, t, i[t])
        }
        )) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(i)) : n(Object(i)).forEach((function(t) {
          Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(i, t))
        }
        ))
      }
      return e
    }
    const a = e(100).default;
    t.exports = class extends a {
      constructor(e) {
        super(e),
        this._anim = e.anim,
        this._container = e.container || this.media.el.parentElement,
        this._scrollGroup = this.options.scrollGroup || this._anim.getGroupForTarget(this._container || this.media.el),
        this._initialize()
      }
      _initialize() {
        const e = JSON.parse(this.media.el.dataset.inlineMediaResetKeyframe);
        this._resetKeyframe = this._scrollGroup.addKeyframe(this.media.el, r(r({}, e), {}, {
          event: "inline-media-reset-kf"
        })),
        this._resetKeyframe.controller.on("inline-media-reset-kf:exit", ()=>{
          this.media.el.currentTime = 0
        }
        )
      }
    }
  }
  , {
    100: 100,
    28: 28,
    29: 29
  }],
  186: [function(e, t, i) {
    "use strict";
    const s = e(79)
      , n = e(204);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.subsectionContainer = document.querySelector(".subsection-white-color"),
        this.pinStartDelay = 700,
        this.pins = this.el.querySelector(".pin-wrapper"),
        this.myPinTrigger = new n(e,this.pins)
      }
      async mounted() {
        this.el.addEventListener("INLINE_MEDIA_TRIGGER", this._onMediaTrigger.bind(this))
      }
      _onMediaTrigger() {
        this.subsectionContainer.classList.add("fade-in-copy"),
        window.setTimeout(()=>{
          this.myPinTrigger.animate()
        }
        , this.pinStartDelay)
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("inline-video")
      }
    }
  }
  , {
    204: 204,
    79: 79
  }],
  187: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.localnavEl = document.querySelector("#ac-localnav"),
        this.sectionKeyboardPencil = document.querySelector(".section-keyboard-pencil")
      }
      mounted() {
        this.anim.getGroupForTarget(this.sectionKeyboardPencil).addEvent(this.localnavEl, {
          start: "a0t",
          anchors: [this.sectionKeyboardPencil],
          onEvent: ()=>{
            this.localnavEl.classList.remove("ac-localnav-dark")
          }
          ,
          onEventReverse: ()=>{
            this.localnavEl.classList.add("ac-localnav-dark")
          }
        })
      }
      static IS_SUPPORTED() {
        return !0
      }
    }
  }
  , {
    79: 79
  }],
  188: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e);
        const t = document.querySelector(".section-experience-outro");
        this.isGeoAlt = t.classList.contains("geo-alt-no-5g");
        const i = this.isGeoAlt ? "38.4vh" : "28vh";
        this.animation = {
          start: "a0t + ".concat(i),
          end: "a0t + ".concat(i, " + 10vh"),
          easeFunction: "bezier(0.16, 0.00, 0.34, 1.00)",
          anchor: ".timeline-outro-content"
        },
        this._destroy = this._destroy.bind(this),
        this.kf = null,
        this.allKfs = []
      }
      mounted() {
        this._setupEvents(),
        this._setupKeyframes()
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy)
      }
      _setupKeyframes() {
        this.kf = this.anim.addKeyframe(this.el, {
          start: this.animation.start,
          end: this.animation.end,
          anchors: [this.animation.anchor],
          opacity: [0, 1],
          easeFunction: this.animation.easeFunction,
          disabledWhen: ["no-enhanced"]
        }),
        this.allKfs.push(this.kf)
      }
      _destroy() {
        const e = this.anim.getControllerForTarget(this.el);
        this.allKfs.push(e),
        this.allKfs.forEach(e=>{
          e && this.kf.remove().then(()=>{
            this.el.removeAttribute("style")
          }
          )
        }
        )
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    79: 79
  }],
  189: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e);
        const t = document.querySelector(".section-experience-outro");
        this.isGeoAlt = t.classList.contains("geo-alt-no-5g");
        const i = this.isGeoAlt ? "20vh" : "10vh";
        this.animation = {
          start: "a0t + ".concat(i),
          fadeInDuration: "3vh",
          scaleDuration: "20vh",
          rotation: "-10",
          y: "60a1h",
          x: {
            l: "-35a1w",
            s: "-90a1w"
          },
          anchor: ".timeline-outro-content",
          ease: .25
        },
        this._destroy = this._destroy.bind(this),
        this.kf = null,
        this.allKfs = []
      }
      mounted() {
        this._setupEvents(),
        this._setupKeyframes()
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy)
      }
      _setupKeyframes() {
        this.kf = this.anim.addKeyframe(this.el, {
          start: this.animation.start,
          end: "".concat(this.animation.start, " + ").concat(this.animation.fadeInDuration),
          anchors: [this.animation.anchor],
          opacity: [0, 1],
          disabledWhen: ["no-enhanced"]
        }),
        this.allKfs.push(this.kf),
        this.kf = this.anim.addKeyframe(this.el, {
          start: this.animation.start,
          end: "".concat(this.animation.start, " + ").concat(this.animation.scaleDuration),
          anchors: [this.animation.anchor, this.el],
          breakpointMask: "LM",
          scale: [2, 1],
          rotation: [this.animation.rotation, 0],
          x: [this.animation.x.l, 0],
          y: [this.animation.y, 0],
          ease: this.animation.ease,
          disabledWhen: ["no-enhanced"]
        }),
        this.allKfs.push(this.kf),
        this.kf = this.anim.addKeyframe(this.el, {
          start: this.animation.start,
          end: "".concat(this.animation.start, " + ").concat(this.animation.scaleDuration),
          anchors: [this.animation.anchor, this.el],
          breakpointMask: "S",
          scale: [2, 1],
          rotation: [this.animation.rotation, 0],
          x: [this.animation.x.s, 0],
          y: [this.animation.y, 0],
          ease: this.animation.ease,
          disabledWhen: ["no-enhanced"]
        }),
        this.allKfs.push(this.kf)
      }
      _destroy() {
        this.allKfs.forEach(e=>{
          e && e.remove().then(()=>{
            this.el.removeAttribute("style")
          }
          )
        }
        )
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    79: 79
  }],
  190: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.index = this.el.dataset.textIndex || 0,
        this.indexOffset = "".concat(this.index, " * 20vh"),
        this.animation = {
          isDark: "false" !== this.el.dataset.textDarken,
          anchor: ".timeline-outro-text-zoom",
          easeFunction: "bezier(0.16, 0.00, 0.34, 1.00)",
          timings: {
            start: "a0t + 14vh + ".concat(this.indexOffset),
            itemScrollLength: "20vh",
            fadeInDuration: "3vh",
            fadeOutDuration: "10vh",
            fadeOutOffset: "(".concat(this.index, " * 5vh)")
          }
        },
        this._destroy = this._destroy.bind(this),
        this.kf = null,
        this.allKfs = []
      }
      mounted() {
        this._setupEvents(),
        this._setupKeyframes()
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy)
      }
      _setupKeyframes() {
        this.kf = this.anim.addKeyframe(this.el, {
          start: this.animation.timings.start,
          end: "".concat(this.animation.timings.start, " + ").concat(this.animation.timings.fadeInDuration),
          anchors: [this.animation.anchor],
          opacity: [0, 1],
          disabledWhen: ["no-enhanced"]
        }),
        this.allKfs.push(this.kf),
        this.animation.isDark && (this.kf = this.anim.addKeyframe(this.el, {
          start: this.animation.timings.start,
          end: "".concat(this.animation.timings.start, " + ").concat(this.animation.timings.itemScrollLength),
          progress: [100, 44],
          anchors: [this.animation.anchor],
          disabledWhen: ["no-enhanced"]
        }),
        this.allKfs.push(this.kf),
        this.kf.controller.on("draw", e=>{
          const t = e.tweenProps.progress.current;
          this.el.style.color = "hsl(240, 2%, ".concat(t, "%)")
        }
        )),
        this.kf = this.anim.addKeyframe(this.el, {
          start: this.animation.timings.start,
          end: "".concat(this.animation.timings.start, " + ").concat(this.animation.timings.itemScrollLength),
          anchors: [this.animation.anchor],
          scale: [10, 1],
          easeFunction: this.animation.easeFunction,
          disabledWhen: ["no-enhanced"]
        }),
        this.allKfs.push(this.kf),
        this.kf = this.anim.addKeyframe(this.el, {
          start: "a0t + ".concat(this.animation.timings.fadeOutOffset),
          end: "a0t + ".concat(this.animation.timings.fadeOutDuration, " + ").concat(this.animation.timings.fadeOutOffset),
          anchors: [".timeline-outro-content"],
          opacity: [1, 0],
          disabledWhen: ["no-enhanced"]
        }),
        this.allKfs.push(this.kf)
      }
      _destroy() {
        const e = this.anim.getControllerForTarget(this.el);
        this.allKfs.push(e),
        this.allKfs.forEach(e=>{
          e && e.remove().then(()=>{
            this.el.removeAttribute("style")
          }
          )
        }
        )
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    79: 79
  }],
  191: [function(e, t, i) {
    "use strict";
    const s = e(79)
      , n = e(213).shouldFallbackHeight
      , r = e(213).isSmallOnDesktop;
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this._destroy = this._destroy.bind(this)
      }
      mounted() {
        this.anim.once("enhanced-destroy", this._destroy),
        this._setupEvents()
      }
      _setupEvents() {
        window.addEventListener("orientationchange", ()=>{
          this.anim.trigger("enhanced-destroy")
        }
        )
      }
      _destroy() {
        let e = document.documentElement;
        e.classList.remove("enhanced"),
        e.classList.add("no-enhanced"),
        setTimeout(()=>{
          this.anim.forceUpdate()
        }
        , 10)
      }
      onResizeDebounced() {
        (n() || r()) && this.anim.trigger("enhanced-destroy")
      }
      onBreakpointChange() {
        this.anim.trigger("enhanced-destroy")
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    213: 213,
    79: 79
  }],
  192: [function(e, t, i) {
    "use strict";
    const s = e(79)
      , n = e(204);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.imageProcreate = this.el.querySelector(".procreate-image-container"),
        this.pins = this.el.querySelector(".pin-wrapper"),
        this.myPinTrigger = new n(e,this.pins)
      }
      async mounted() {
        this.el.addEventListener("INLINE_MEDIA_TRIGGER", this._onMediaTrigger.bind(this)),
        this.anim.addKeyframe(this.imageProcreate, {
          start: "t - 100vh",
          end: "t - 75vh",
          y: ["200", 0],
          ease: .1,
          breakpointMask: "L"
        }),
        this.anim.addKeyframe(this.imageProcreate, {
          start: "t - 100vh",
          end: "t - 75vh",
          y: ["100", 0],
          ease: .1,
          breakpointMask: "M"
        })
      }
      _onMediaTrigger() {
        this.myPinTrigger.animate()
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("inline-video")
      }
    }
  }
  , {
    204: 204,
    79: 79
  }],
  193: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.options = e,
        this.pictures = [...this.el.querySelectorAll("picture")],
        this.directChildren = [...this.el.children].filter(e=>"NOSCRIPT" !== e.tagName),
        this.picture = this.pictures[this.pictures.length - 1],
        this.pictureImage = this.picture.querySelector("picture img"),
        this.caption = this.el.querySelector(".caption"),
        this.isReadOnlyContext = this.caption.classList.contains("vo-only-read-context"),
        this.contextID = "caption-context-".concat(this.picture.id)
      }
      mounted() {
        this.setPictureAria(),
        this.ariaHideAllDirectChildren(),
        this.hideCaptionInnerTextFromVO(),
        this.setCaptionContext()
      }
      setPictureAria() {
        this.el.setAttribute("aria-labelledby", this.contextID),
        this.el.setAttribute("role", "img"),
        this.pictureImage.removeAttribute("alt")
      }
      ariaHideAllDirectChildren() {
        this.directChildren.forEach(e=>{
          e.setAttribute("aria-hidden", !0)
        }
        )
      }
      hideCaptionInnerTextFromVO() {
        if (this.isReadOnlyContext) {
          let e = document.createElement("span");
          e.setAttribute("aria-hidden", !0);
          let t = document.createTextNode(this.caption.innerText);
          e.appendChild(t),
          this.caption.innerHTML = "",
          this.caption.appendChild(e)
        }
      }
      setCaptionContext() {
        let e = document.createElement("span");
        e.className = "visuallyhidden";
        let t = document.createTextNode(this.caption.dataset.captionContext);
        e.appendChild(t),
        this.isReadOnlyContext ? (e.id = this.contextID,
        this.caption.removeAttribute("aria-hidden")) : this.caption.id = this.contextID,
        this.caption.appendChild(e),
        this.caption.removeAttribute("data-caption-context")
      }
      static IS_SUPPORTED() {
        return !0
      }
    }
  }
  , {
    79: 79
  }],
  194: [function(e, t, i) {
    "use strict";
    const s = e(79)
      , n = e(200)
      , r = e(201)
      , a = e(197)
      , o = e(195)
      , h = e(196)
      , l = e(199);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.options = e,
        this.canvas1 = this.el.querySelector("canvas"),
        this.canvas1.classList.add("layer-1"),
        this.context = {
          layer1: this.canvas1.getContext("2d")
        },
        this.name = this.el.dataset.name,
        void 0 === n[this.name] && (n[this.name] = {
          L: {},
          M: {},
          S: {}
        }),
        this.specName = n[this.name][this.pageMetrics.breakpoint],
        this.notEnhanced = document.documentElement.classList.contains("no-enhanced"),
        this.hasFadingAssets = this.el.classList.contains("fading-assets"),
        this.is5G = this.el.parentNode.classList.contains("five-g-wrapper"),
        this.canvasWrap = this.el.querySelector(".canvas-wrap"),
        this.textElem = this.el.querySelector(".rays-animation-value"),
        this.copy = this.textElem.innerText,
        this.font = "600 80px SF Pro Display",
        this.rotate = 0,
        this.scrollRotate = 0,
        this.randomRayColors = [],
        this.fillInit = !1,
        this.fillOver = !1,
        this.secondsAfterFill = 0,
        this.pxRatio = window.devicePixelRatio,
        this.fadeInDuration = 1.2,
        this.fadeInTimerCount = 0,
        this.fontSpecs = {},
        this.animationRunning = !1,
        this.exitedFrame = !1,
        this.fiveGfocused = !1;
        let {initData: t} = o();
        this.assetsPerViewport = {
          L: t(),
          M: t(),
          S: t()
        },
        this.viewportNames = {
          L: "large",
          M: "medium",
          S: "small"
        },
        this._destroy = this._destroy.bind(this)
      }
      mounted() {
        this.anim.once("enhanced-destroy", this._destroy),
        r(this),
        a(this),
        "images" === this.colorFillType && (this.badgeImageEvent = this.addDiscreteEvent({
          start: "t",
          event: "Init ".concat(this.copy, " ").concat(this.pageMetrics.breakpoint, " (will dissappear on enter)")
        })),
        this.is5G && this.el.parentNode.addEventListener("focus", ()=>{
          this.fiveGfocused = !0
        }
        ),
        this.renderCanvasLayers(this),
        this.pixelRatioListener()
      }
      pixelRatioListener() {
        let e = "(resolution: ".concat(window.devicePixelRatio, "dppx)");
        matchMedia(e).addListener(()=>{
          this.pxRatio = window.devicePixelRatio,
          this.canvas1.width = this.textElem.offsetWidth * this.pxRatio,
          this.canvas1.height = this.textElem.offsetHeight * this.pxRatio,
          this.xPosition = this.canvas1.width / this.pxRatio / 2,
          this.yPosition = this.canvas1.height / this.pxRatio / 2,
          this.context.layer1.scale(this.pxRatio, this.pxRatio),
          (this.fillOver || this.notEnhanced) && l(this).render("layer1")
        }
        )
      }
      renderCanvasLayers() {
        if (this.addDiscreteEvent({
          start: this.renderStart,
          end: this.renderEnd,
          event: "Render ".concat(this.copy, " canvas"),
          onEnterOnce: ()=>{
            this.animationRunning = !0,
            this.enableAnimation || (this.animationRunning = !1),
            o(this).loadAssets().then(()=>{
              this.notEnhanced && (this.animationRunning = !1),
              h(this).setSpecs(),
              l(this).render("layer1"),
              this.el.classList.add("loaded")
            }
            )
          }
          ,
          onEnter: ()=>{
            this.animateOnReenter && this.exitedFrame && (this.fillInit = !1,
            this.fillOver = !1,
            this.rayWeight = this.specName.rayWeight,
            this.numOfRays = this.specName.numOfRays,
            this.secondsAfterFill = 0,
            this.animationRunning = !0,
            l(this).render("layer1"))
          }
          ,
          onExit: ()=>{
            this.exitedFrame = !0,
            this.animationRunning = !1
          }
        }),
        this.imageRotateOnScroll) {
          this.anim.addKeyframe(this.el, {
            start: this.renderStart,
            end: this.renderEnd,
            progress: [-360, 360]
          }).controller.on("draw", e=>{
            let t = e.tweenProps.progress.current;
            this.scrollRotate = t
          }
          )
        }
      }
      _destroy() {
        this.notEnhanced = !0
      }
      onBreakpointChange(e) {
        this.specName = n[this.name][this.pageMetrics.breakpoint],
        o(this).loadAssets().then(()=>{
          this.randomRayColors = [],
          this.gradientSpecs = [],
          r(this),
          h(this).setSpecs(),
          this.animationRunning = !1,
          l(this).render("layer1")
        }
        )
      }
      static IS_SUPPORTED() {
        return !0
      }
    }
  }
  , {
    195: 195,
    196: 196,
    197: 197,
    199: 199,
    200: 200,
    201: 201,
    79: 79
  }],
  195: [function(e, t, i) {
    "use strict";
    t.exports = e=>{
      let t = ()=>((()=>{
        if (void 0 === e.fontSpecs[e.pageMetrics.breakpoint]) {
          let t = getComputedStyle(e.textElem);
          void 0 === e.fontSpecs.family && (e.fontSpecs.family = t["font-family"].replace(/"/g, "")),
          e.fontSpecs[e.pageMetrics.breakpoint] = {},
          e.fontSpecs[e.pageMetrics.breakpoint].size = t["font-size"],
          e.fontSpecs[e.pageMetrics.breakpoint].weight = t["font-weight"];
          let i = e.fontSpecs.family
            , s = e.fontSpecs[e.pageMetrics.breakpoint].size
            , n = e.fontSpecs[e.pageMetrics.breakpoint].weight;
          e.fontSpecs[e.pageMetrics.breakpoint].canvas = "".concat(n, " ").concat(s, " ").concat(i)
        }
      }
      )(),
      new Promise(t=>{
        let i = e.fontSpecs[e.pageMetrics.breakpoint].canvas;
        document.fonts.load(i).then(t)
      }
      ));
      return {
        initData: ()=>({
          source: null,
          elem: [],
          loaded: [],
          dimensions: {
            width: 0,
            height: 0
          },
          progress: {
            asset: 1,
            fade: 0
          }
        }),
        loadAssets: ()=>{
          let i = [t()];
          return "images" === e.colorFillType && i.push((()=>{
            e.rayAssets = e.assetsPerViewport[e.pageMetrics.breakpoint];
            let t = e.specName.colorFill
              , i = e.viewportNames[e.pageMetrics.breakpoint]
              , s = Object.keys(t.assetNames).length;
            return e.notEnhanced && (s = 1),
            e.badgeImageEvent.remove().then(()=>{
              e.badgeImageEvent = e.addDiscreteEvent({
                start: "t - 200vh",
                end: "b",
                event: "Render ".concat(e.copy, " images ").concat(e.pageMetrics.breakpoint),
                onEnterOnce: ()=>{
                  if (null === e.rayAssets.source) {
                    let s = ()=>Object.keys(t.assetNames).map(e=>{
                      let s = t.assetNames[e];
                      return "".concat(t.folder, "/").concat(e, "__").concat(s, "_").concat(i, ".jpg")
                    }
                    )
                      , n = s();
                    e.notEnhanced && (n = [s()[0]]),
                    e.rayAssets.source = n,
                    e.rayAssets.source.forEach(t=>{
                      let i = new Image;
                      i.src = t;
                      let s = new Promise(t=>{
                        i.onload = ()=>{
                          e.rayAssets.dimensions.height = i.naturalHeight,
                          e.rayAssets.dimensions.width = i.naturalWidth,
                          t()
                        }
                      }
                      );
                      e.rayAssets.elem.push(i),
                      e.rayAssets.loaded.push(s)
                    }
                    )
                  }
                }
              })
            }
            ),
            new Promise(t=>{
              let i;
              i = setInterval(()=>{
                let n = e.rayAssets.loaded.length === s;
                e.notEnhanced && (n = e.rayAssets.loaded.length >= 1),
                n && (Promise.all(e.rayAssets.loaded).then(()=>{
                  t()
                }
                ),
                clearInterval(i))
              }
              , 333)
            }
            )
          }
          )()),
          new Promise(e=>{
            Promise.all(i).then(()=>{
              e()
            }
            )
          }
          )
        }
      }
    }
  }
  , {}],
  196: [function(e, t, i) {
    "use strict";
    t.exports = e=>({
      setSpecs: ()=>{
        e.canvas1.style.width = "".concat(e.textElem.offsetWidth, "px"),
        e.canvas1.style.height = "".concat(e.textElem.offsetHeight, "px"),
        e.canvas1.width = e.textElem.offsetWidth * e.pxRatio,
        e.canvas1.height = e.textElem.offsetHeight * e.pxRatio,
        e.width = e.canvas1.width,
        e.height = e.canvas1.height,
        e.xPosition = e.canvas1.width / e.pxRatio / 2,
        e.yPosition = e.canvas1.height / e.pxRatio / 2,
        e.canvasWrap.style.width = e.canvas1.style.width,
        e.canvasWrap.style.height = e.canvas1.style.height,
        e.context.layer1.scale(e.pxRatio, e.pxRatio)
      }
      ,
      createGradient: t=>{
        let i = e.xPosition + e.offsetX
          , s = e.yPosition + e.offsetY
          , n = [i, s, 0, i, s, e.gradientRadiusSize]
          , r = e.context[t].createRadialGradient(...n);
        if ("gradient" === e.colorFillType && r)
          for (let t in e.colorFill)
            r.addColorStop(t, e.colorFill[t]);
        e.context[t].fillStyle = r
      }
      ,
      createText: t=>{
        e.hasFadingAssets && (e.context[t].save(),
        e.context[t].font = e.fontSpecs[e.pageMetrics.breakpoint].canvas,
        e.context[t].textAlign = "center",
        e.context[t].textBaseline = "middle",
        e.context[t].fillStyle = "black",
        e.context[t].globalCompositeOperation = "destination-in",
        e.context[t].fillText(e.copy, e.xPosition, e.yPosition),
        e.context[t].restore())
      }
    })
  }
  , {}],
  197: [function(e, t, i) {
    "use strict";
    t.exports = e=>{
      e.fillSpeed > 0 && (e.el.classList.contains("animation-group") || e.addDiscreteEvent({
        start: e.fillTriggerStart,
        end: e.fillTriggerEnd,
        anchors: e.fillTriggerAnchors,
        event: "Fill ".concat(e.copy),
        onEnterOnce: ()=>{
          e.fillInit = !0
        }
        ,
        onEnter: ()=>{
          e.animateOnReenter && e.exitedFrame && (e.fillInit = !0)
        }
        ,
        onExit: ()=>{
          e.animateOnReenter && e.exitedFrame && (e.fillInit = !0)
        }
      }))
    }
  }
  , {}],
  198: [function(e, t, i) {
    "use strict";
    const s = e(196);
    t.exports = e=>({
      star: t=>{
        if ("gradient" === e.colorFillType && s(e).createGradient(t),
        e.context[t].fillRect(0, 0, e.canvas1.width, e.canvas1.height),
        e.rotate += e.rotationSpeed / 1e3 * Number(e.rotationDirection),
        "images" === e.colorFillType && (e.rayAssets.progress.fade += e.imageFadeSpeed,
        e.rayAssets.progress.fade >= 1 && (e.rayAssets.progress.fade = 0,
        e.rayAssets.progress.asset++,
        e.rayAssets.progress.asset > e.rayAssets.elem.length && (e.rayAssets.progress.asset = 1)),
        e.currentAsset = e.rayAssets.progress.asset - 1,
        e.nextAsset = e.currentAsset + 1 === e.rayAssets.elem.length ? 0 : e.currentAsset + 1),
        e.context[t].save(),
        "images" === e.colorFillType) {
          let i = e.rayAssets.dimensions.width * e.imageZoom
            , s = e.rayAssets.dimensions.height * e.imageZoom
            , n = n=>{
            if (e.context[t].translate(e.canvas1.width / 2 / e.pxRatio + e.offsetX, e.canvas1.height / 2 / e.pxRatio + e.offsetY),
            e.imageRotateOnScroll) {
              let i = e.scrollRotate / 100 * (e.imageRotationSpeed / 10 * Number(e.imageRotationDirection));
              e.context[t].rotate(i)
            } else {
              let i = e.rotate * (e.imageRotationSpeed * Number(e.imageRotationDirection));
              e.context[t].rotate(i)
            }
            e.context[t].translate(i / 2 * -1, s / 2 * -1),
            e.rayAssets.elem.length && e.context[t].drawImage(e.rayAssets.elem[e[n]], 0, 0, i, s)
          }
          ;
          e.context[t].save(),
          n("currentAsset"),
          e.context[t].restore(),
          e.context[t].save(),
          e.context[t].globalAlpha = e.rayAssets.progress.fade,
          n("nextAsset"),
          e.context[t].globalAlpha = 1,
          e.context[t].restore()
        }
        e.context[t].globalCompositeOperation = "destination-in",
        e.context[t].translate(e.xPosition + e.offsetX, e.yPosition + e.offsetY),
        e.context[t].rotate(e.rotate),
        ((t,i,s,n,r)=>{
          let a = Math.PI / 2 * 3
            , o = t
            , h = i
            , l = Math.PI / s;
          e.context.layer1.beginPath();
          for (let c = 0; c < s; c++)
            o = t + Math.cos(a) * n,
            h = i + Math.sin(a) * n,
            e.context.layer1.lineTo(o, h),
            a += l,
            o = t + Math.cos(a) * r,
            h = i + Math.sin(a) * r,
            e.context.layer1.lineTo(o, h),
            a += l;
          e.context.layer1.lineTo(t, i - n),
          e.context.layer1.closePath(),
          e.context.layer1.lineWidth = e.rayWeight,
          e.context.layer1.strokeStyle = "#000",
          e.context.layer1.stroke()
        }
        )(0, 0, e.numOfRays, 3 * e.canvas1.width, 0),
        e.context[t].restore(),
        e.fillInit && (e.randomRayColors = [],
        e.rayWeight += e.fillSpeed / 100)
      }
    })
  }
  , {
    196: 196
  }],
  199: [function(e, t, i) {
    "use strict";
    const s = e(196)
      , n = e(198);
    t.exports = e=>{
      let t = i=>{
        if (e.fiveGfocused && (e.fillOver = !0),
        (e.fillOver || e.notEnhanced) && (e.rayWeight = 1e3),
        n(e).star(i),
        s(e).createText(i),
        e.el.classList.contains("animation-group-fill") && (e.fillInit = !0),
        e.fillInit)
          if (0 === e.secondsAfterFill)
            e.secondsAfterFill = (new Date).getTime();
          else {
            ((new Date).getTime() - e.secondsAfterFill) / 1e3 > e.rotateEndDelay && (e.fillOver = !0)
          }
        if (e.fillOver || e.notEnhanced)
          return;
        e.animationRunning || (e.fillOver = !0);
        window.requestAnimationFrame((()=>t(i)).bind(e))
      }
      ;
      return {
        render: t
      }
    }
  }
  , {
    196: 196,
    198: 198
  }],
  200: [function(e, t, i) {
    "use strict";
    var s = e(29)(e(28));
    function n(e, t) {
      var i = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var s = Object.getOwnPropertySymbols(e);
        t && (s = s.filter((function(t) {
          return Object.getOwnPropertyDescriptor(e, t).enumerable
        }
        ))),
        i.push.apply(i, s)
      }
      return i
    }
    function r(e) {
      for (var t = 1; t < arguments.length; t++) {
        var i = null != arguments[t] ? arguments[t] : {};
        t % 2 ? n(Object(i), !0).forEach((function(t) {
          (0,
          s.default)(e, t, i[t])
        }
        )) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(i)) : n(Object(i)).forEach((function(t) {
          Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(i, t))
        }
        ))
      }
      return e
    }
    let a = {
      colorFillType: "images",
      imageRotationDirection: "left",
      imageRotationSpeed: .4,
      fillSpeed: 25,
      colorFill: {
        folder: "/v/ipad-pro/ae/images/overview/sunburst-rays",
        assetNames: {
          rays_01: "b88bbfeny49y",
          rays_02: "e6okoipzuiy6",
          rays_03: "d4tcsgyj8rcm",
          rays_04: "dfs9iibwofgy",
          rays_05: "cyaf5t94d5me",
          rays_06: "b13ibxws7iuu"
        }
      },
      rotateEndDelay: 3,
      rotationSpeed: 1,
      imageFadeSpeed: .01,
      renderStart: "t - 100vh",
      fillTriggerStart: "t - 50vh + 50h",
      fillTriggerEnd: "b + 20vh",
      rayWeight: 3,
      offsetY: -3,
      animateOnReenter: !0,
      enableAnimation: !0
    };
    t.exports = {
      wireless_5: {
        L: r({
          offsetX: 140,
          numOfRays: 210
        }, a),
        M: r({
          offsetX: 115,
          numOfRays: 202
        }, a),
        S: r({
          offsetX: 70,
          numOfRays: 150,
          rayWeight: 2
        }, a)
      },
      wireless_G: {
        L: r({
          offsetX: -185,
          numOfRays: 210
        }, a),
        M: r({
          offsetX: -150,
          numOfRays: 202
        }, a),
        S: r({
          offsetX: -90,
          numOfRays: 150,
          rayWeight: 2
        }, a)
      },
      "display-liquid-retina_badge-1": {
        L: {
          colorFill: {
            "0.40": "#ff0001",
            "0.60": "#eb2584",
            "1.00": "#ffe1e8"
          },
          offsetX: 53,
          offsetY: 95,
          rotationSpeed: 1.4,
          gradientRadiusSize: 179,
          numOfRays: 256
        },
        M: {
          colorFill: {
            "0.40": "#ff0001",
            "0.60": "#eb2584",
            "1.00": "#ffe1e8"
          },
          offsetX: 53,
          offsetY: 81,
          rotationSpeed: 1.2,
          numOfRays: 240,
          gradientRadiusSize: 157
        },
        S: {
          colorFill: {
            "0.40": "#ff0001",
            "0.60": "#eb2584",
            "1.00": "#ffe1e8"
          },
          offsetX: 39,
          offsetY: 81,
          numOfRays: 249,
          rotationSpeed: 1.4,
          gradientRadiusSize: 122
        }
      },
      "display-liquid-retina_badge-2": {
        L: {
          colorFill: {
            "0.40": "#eb2584",
            "1.00": "#e80002"
          },
          offsetX: -45,
          offsetY: -129,
          gradientRadiusSize: 227,
          numOfRays: 360,
          rotationSpeed: 1.1
        },
        M: {
          colorFill: {
            "0.40": "#eb2584",
            "0.60": "#e80002"
          },
          offsetX: -45,
          offsetY: -115,
          gradientRadiusSize: 306,
          rotationSpeed: 1,
          numOfRays: 309
        },
        S: {
          colorFill: {
            "0.40": "#eb2584",
            "0.60": "#e80002"
          },
          offsetX: -31,
          offsetY: -115,
          gradientRadiusSize: 293,
          numOfRays: 300,
          rotationSpeed: 1.2
        }
      },
      "display-liquid-retina_badge-3": {
        L: {
          colorFill: {
            "0.40": "#ffa43a",
            "0.60": "#e80002"
          },
          offsetX: 95,
          offsetY: -143,
          gradientRadiusSize: 367,
          rotationSpeed: 1.4,
          numOfRays: 359
        },
        M: {
          colorFill: {
            "0.40": "#ffa43a",
            "0.60": "#e80002"
          },
          offsetX: 67,
          offsetY: -101,
          gradientRadiusSize: 284,
          rotationSpeed: 1.3,
          numOfRays: 275
        },
        S: {
          colorFill: {
            "0.40": "#ffa43a",
            "0.60": "#e80002"
          },
          offsetX: 54,
          offsetY: -89,
          gradientRadiusSize: 245,
          rotationSpeed: 1.5,
          numOfRays: 263
        }
      },
      "display-liquid-retina_badge-4": {
        L: {
          colorFill: {
            "0.40": "#ff5838",
            "0.60": "#e80002"
          },
          offsetX: 25,
          offsetY: 81,
          rotationSpeed: 1.9,
          numOfRays: 187,
          gradientRadiusSize: 192
        },
        M: {
          colorFill: {
            "0.40": "#ff5838",
            "0.60": "#e80002"
          },
          offsetX: 25,
          offsetY: 67,
          rotationSpeed: 1.7
        },
        S: {
          colorFill: {
            "0.40": "#ff5838",
            "0.60": "#e80002"
          },
          offsetX: 25,
          offsetY: 39,
          rotationSpeed: 1.7,
          numOfRays: 177
        }
      },
      "m1_badge-1": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#e8533b",
            "0.60": "#fc4395"
          },
          offsetX: -59,
          offsetY: 81,
          rotationSpeed: 1.4,
          numOfRays: 240,
          gradientRadiusSize: 201
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#e8533b",
            "0.60": "#fc4395"
          },
          offsetX: -59,
          offsetY: 81,
          rotationSpeed: 1.4,
          numOfRays: 240,
          gradientRadiusSize: 201
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#e8533b",
            "0.60": "#fc4395"
          },
          offsetX: -59,
          offsetY: 81,
          rotationSpeed: 1.4,
          numOfRays: 240,
          gradientRadiusSize: 201
        }
      },
      "m1_badge-2": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#8e19e6",
            "1.00": "#ff3487"
          },
          offsetX: 109,
          offsetY: -129,
          gradientRadiusSize: 223,
          rotationSpeed: .8,
          numOfRays: 359
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#8e19e6",
            "1.00": "#ff3487"
          },
          offsetX: 53,
          offsetY: -129,
          gradientRadiusSize: 223,
          rotationSpeed: .8,
          numOfRays: 328
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#8e19e6",
            "1.00": "#ff3487"
          },
          offsetX: 53,
          offsetY: -129,
          gradientRadiusSize: 196,
          rotationSpeed: .8,
          numOfRays: 359
        }
      },
      "m1_badge-3": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#5779eb",
            "0.60": "#9b23f0"
          },
          offsetX: -3,
          offsetY: -87,
          gradientRadiusSize: 214,
          rotationSpeed: 1.6,
          numOfRays: 215
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#5779eb",
            "0.60": "#9b23f0"
          },
          offsetX: -3,
          offsetY: -87,
          gradientRadiusSize: 214,
          rotationSpeed: 1.6,
          numOfRays: 215
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#5779eb",
            "0.60": "#9b23f0"
          },
          offsetX: -3,
          offsetY: -87,
          gradientRadiusSize: 214,
          rotationSpeed: 1.6,
          numOfRays: 215
        }
      },
      "architecture_badge-1": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#f2816d",
            "0.60": "#e3215b"
          },
          offsetY: -59,
          offsetX: -115,
          gradientRadiusSize: 218,
          rotationSpeed: 1.4,
          numOfRays: 224
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#f2816d",
            "0.60": "#e3215b"
          },
          offsetY: -59,
          offsetX: -115,
          gradientRadiusSize: 218,
          rotationSpeed: 1.4,
          numOfRays: 224
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#f2816d",
            "0.60": "#e3215b"
          },
          offsetY: -59,
          offsetX: -115,
          gradientRadiusSize: 218,
          rotationSpeed: 1.4,
          numOfRays: 224
        }
      },
      "architecture_badge-2": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#e3215b",
            "0.60": "#a628ae"
          },
          offsetY: 53,
          offsetX: -115,
          gradientRadiusSize: 258,
          rotationSpeed: 1.6,
          numOfRays: 224
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#e3215b",
            "0.60": "#a628ae"
          },
          offsetY: 53,
          offsetX: -115,
          gradientRadiusSize: 258,
          rotationSpeed: 1.6,
          numOfRays: 224
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#e3215b",
            "0.60": "#a628ae"
          },
          offsetY: 53,
          offsetX: -115,
          gradientRadiusSize: 258,
          rotationSpeed: 1.6,
          numOfRays: 224
        }
      },
      "features_badge-1": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#03f6f4",
            "0.60": "#3de85d"
          },
          offsetY: 109,
          offsetX: 39,
          gradientRadiusSize: 297,
          rotationSpeed: 1.6,
          numOfRays: 256
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#03f6f4",
            "0.60": "#3de85d"
          },
          offsetY: 81,
          offsetX: 53,
          gradientRadiusSize: 258,
          rotationSpeed: 1.4,
          numOfRays: 249
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#03f6f4",
            "0.60": "#3de85d"
          },
          offsetY: 81,
          offsetX: -45,
          gradientRadiusSize: 175,
          rotationSpeed: 1.3,
          numOfRays: 249
        }
      },
      "features_badge-2": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            .35: "#03f6f4",
            "0.60": "#577fff",
            "1.00": "#9383ff"
          },
          offsetX: -185,
          offsetY: 109,
          gradientRadiusSize: 271,
          rotationSpeed: 1.2,
          numOfRays: 331
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            .35: "#03f6f4",
            "0.60": "#577fff",
            "1.00": "#9383ff"
          },
          offsetX: -157,
          offsetY: 109,
          gradientRadiusSize: 297,
          rotationSpeed: 1.2,
          numOfRays: 328
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            .35: "#03f6f4",
            "0.60": "#3de85d"
          },
          offsetX: -31,
          offsetY: -87,
          gradientRadiusSize: 310,
          rotationSpeed: 1.2,
          numOfRays: 278
        }
      },
      "features_badge-3": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#03f6f4",
            "0.60": "#3de85d"
          },
          offsetX: 11,
          offsetY: 123,
          gradientRadiusSize: 350,
          rotationSpeed: 1.6,
          numOfRays: 275
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#03f6f4",
            "0.60": "#3de85d"
          },
          offsetX: 25,
          offsetY: 109,
          gradientRadiusSize: 297,
          rotationSpeed: 1.4,
          numOfRays: 240
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#03f6f4",
            "0.60": "#577fff"
          },
          offsetX: -115,
          offsetY: -101,
          gradientRadiusSize: 236,
          rotationSpeed: 1.3,
          numOfRays: 253
        }
      },
      "features_badge-4": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#03f6f4",
            "0.60": "#9383ff"
          },
          gradientRadiusSize: 460,
          offsetX: -101,
          offsetY: 180,
          rotationSpeed: 1.1,
          numOfRays: 360
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#03f6f4",
            "0.60": "#577fff",
            "1.00": "#9383ff"
          },
          gradientRadiusSize: 289,
          offsetX: -59,
          offsetY: 109,
          rotationSpeed: 1.4,
          numOfRays: 268
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#577fff",
            "0.60": "#03f6f4"
          },
          gradientRadiusSize: 258,
          offsetX: -17,
          offsetY: 75,
          rotationSpeed: 1.1,
          numOfRays: 246
        }
      },
      "features_badge-5": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#03f6f4",
            "0.60": "#3de85d"
          },
          offsetX: 25,
          offsetY: -101,
          gradientRadiusSize: 372,
          rotationSpeed: 1.4,
          numOfRays: 293
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#03f6f4",
            "0.60": "#3de85d"
          },
          offsetX: 53,
          offsetY: -115,
          gradientRadiusSize: 341,
          rotationSpeed: 1.3,
          numOfRays: 278
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#577fff",
            "0.60": "#d86afc"
          },
          offsetX: -132,
          offsetY: -103,
          gradientRadiusSize: 267,
          rotationSpeed: 1.2,
          numOfRays: 283
        }
      },
      "features_badge-6": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#03f6f4",
            "0.60": "#577fff",
            "1.00": "#9383ff"
          },
          gradientRadiusSize: 179,
          offsetX: -227,
          offsetY: -59,
          rotationSpeed: 1.6
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#03f6f4",
            "0.60": "#9383ff"
          },
          gradientRadiusSize: 253,
          offsetX: -213,
          offsetY: -87,
          rotationSpeed: 1.3,
          numOfRays: 227
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#577fff",
            "0.60": "#d86afc"
          },
          gradientRadiusSize: 182,
          offsetX: -203,
          offsetY: -75,
          rotationSpeed: 1.3,
          numOfRays: 206
        }
      },
      "leds_badge-1": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#4ebefd",
            "0.60": "#8850ff",
            "1.00": "#f638fe"
          },
          offsetX: -59,
          offsetY: -101,
          gradientRadiusSize: 196,
          rotationSpeed: 1.6,
          numOfRays: 237
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#4ebefd",
            "0.60": "#8850ff",
            "1.00": "#f638fe"
          },
          offsetX: -87,
          offsetY: -87,
          gradientRadiusSize: 196,
          rotationSpeed: 1.4,
          numOfRays: 265
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#4ebefd",
            "0.60": "#8850ff",
            "1.00": "#f638fe"
          },
          offsetX: -46,
          offsetY: -89,
          gradientRadiusSize: 169,
          rotationSpeed: 1.4,
          numOfRays: 244
        }
      },
      "dimming-zones_badge-1": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#5db0fc",
            "0.60": "#8850ff",
            "0.90": "#f638fe"
          },
          offsetY: 95,
          offsetX: -45,
          numOfRays: 231,
          rotationSpeed: 1.6
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#5db0fc",
            "0.60": "#8850ff",
            "0.90": "#f638fe"
          },
          offsetY: 81,
          offsetX: -73,
          numOfRays: 227,
          rotationSpeed: 1.4
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#5db0fc",
            "0.60": "#8850ff",
            "0.90": "#f638fe"
          },
          offsetY: 68,
          offsetX: -87,
          rotationSpeed: 1.4,
          numOfRays: 244
        }
      },
      "front-facing_badge-1": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#4bf065",
            "0.60": "#33f7f7"
          },
          offsetY: 81,
          offsetX: 53,
          rotationSpeed: 2,
          numOfRays: 212
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#4bf065",
            "0.60": "#33f7f7"
          },
          offsetY: 81,
          offsetX: 53,
          rotationSpeed: 1.4,
          numOfRays: 212
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#4bf065",
            "0.60": "#33f7f7"
          },
          offsetY: 67,
          offsetX: 25,
          rotationSpeed: 1.2,
          numOfRays: 212
        }
      },
      "front-facing_badge-2": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#4bf065",
            .62: "#fff716"
          },
          offsetX: 11,
          offsetY: -143,
          gradientRadiusSize: 306,
          rotationSpeed: .8,
          numOfRays: 315,
          rayWeight: 1,
          colorFillType: "gradient"
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#4bf065",
            .62: "#fff716"
          },
          offsetX: -87,
          offsetY: -129,
          gradientRadiusSize: 306,
          rotationSpeed: .8,
          numOfRays: 303,
          rayWeight: 1,
          colorFillType: "gradient"
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#4bf065",
            .62: "#fff716"
          },
          offsetX: 95,
          offsetY: -115,
          gradientRadiusSize: 306,
          rotationSpeed: .8,
          numOfRays: 318,
          rayWeight: 1,
          colorFillType: "gradient"
        }
      },
      "rear-facing_badge-1": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#33f7f7",
            "0.60": "#4bf065"
          },
          offsetY: 53,
          offsetX: -87,
          rotationSpeed: 2
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#33f7f7",
            "0.60": "#4bf065"
          },
          offsetY: 53,
          offsetX: -87,
          rotationSpeed: 1.7
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#33f7f7",
            "0.60": "#4bf065"
          },
          offsetY: 81,
          offsetX: -31,
          rotationSpeed: 1.7,
          numOfRays: 209
        }
      },
      "rear-facing_badge-2": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#4bf065",
            "0.60": "#f7f524"
          },
          offsetX: -87,
          offsetY: -73,
          rotationSpeed: 1.6,
          numOfRays: 224
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#4bf065",
            "0.60": "#f7f524"
          },
          offsetX: -87,
          offsetY: -73,
          rotationSpeed: 1.2,
          numOfRays: 224
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#4bf065",
            "0.60": "#f7f524"
          },
          offsetX: -87,
          offsetY: -73,
          rotationSpeed: 1.3,
          numOfRays: 224
        }
      },
      "thunderbolt_badge-1": {
        L: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#33f7f7",
            "0.60": "#4bf065"
          },
          offsetX: -3,
          offsetY: -87,
          rotationSpeed: 1,
          numOfRays: 221,
          gradientRadiusSize: 205
        },
        M: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#33f7f7",
            "0.60": "#4bf065"
          },
          offsetX: 25,
          offsetY: -87,
          rotationSpeed: 1,
          numOfRays: 221,
          gradientRadiusSize: 205
        },
        S: {
          hasFadeIn: !1,
          colorFill: {
            "0.40": "#33f7f7",
            "0.60": "#4bf065"
          },
          offsetX: 11,
          offsetY: -89,
          rotationSpeed: 1.2,
          numOfRays: 235,
          gradientRadiusSize: 205
        }
      }
    }
  }
  , {
    28: 28,
    29: 29
  }],
  201: [function(e, t, i) {
    "use strict";
    t.exports = e=>{
      let t = (t,i)=>e.specName && e.specName[t] ? e.specName[t] : i
        , i = e=>"right" === t(e, "right") ? 1 : -1;
      e.numOfRays = t("numOfRays", 200),
      e.offsetX = t("offsetX", 0),
      e.offsetY = t("offsetY", 100),
      e.rayWeight = t("rayWeight", 1),
      e.rotationSpeed = t("rotationSpeed", 3),
      e.gradientRadiusSize = t("gradientRadiusSize", 180),
      e.fillSpeed = t("fillSpeed", 12),
      e.colorFillType = t("colorFillType", "gradient"),
      e.colorFill = t("colorFill", {
        1: "#911c03",
        "0.40": "#0000ff",
        "0.60": "#2a27cd",
        "0.90": "#a40abb"
      }),
      e.renderStart = t("renderStart", "t - 100vh + 15h"),
      e.renderEnd = t("renderEnd", "b"),
      e.fillTriggerStart = t("fillTriggerStart", "t - 65vh"),
      e.fillTriggerEnd = t("fillTriggerEnd", "b"),
      e.fillTriggerAnchors = t("fillTriggerAnchors", []),
      e.rotateEndDelay = t("rotateEndDelay", 4),
      e.animateOnReenter = t("animateOnReenter", !1),
      e.enableAnimation = t("enableAnimation", !1),
      e.rotationDirection = i("rotationDirection"),
      e.maxRaysNum = 800 * (1 === e.rayWeight ? e.rayWeight : e.rayWeight / 2),
      e.imageFadeSpeed = t("imageFadeSpeed", .01),
      e.imageRotationSpeed = t("imageRotationSpeed", 1.7),
      e.imageRotationDirection = i("imageRotationDirection"),
      e.imageZoom = t("imageZoom", 1),
      e.imageRotateOnScroll = t("imageRotateOnScroll", !1)
    }
  }
  , {}],
  202: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.options = e,
        this.rayComponents = this.el.querySelectorAll('[data-component-list="Rays"]'),
        this.animTimingStart = this.el.dataset.animStart || "t - 65vh",
        this.animTimingEnd = this.el.dataset.animEnd || "b",
        this.animTimingAnchors = [],
        this.el.dataset.animAnchors && (this.animTimingAnchors = this.el.dataset.animAnchors.split(",").map(e=>e))
      }
      mounted() {
        this.init()
      }
      init() {
        this.rayComponents.forEach(e=>{
          e.classList.add("animation-group")
        }
        ),
        this.badgeTimingEvent = this.addDiscreteEvent({
          start: this.animTimingStart,
          end: this.animTimingEnd,
          anchors: this.animTimingAnchors,
          event: "Rays Group Fill",
          onEnterOnce: ()=>{
            this.rayComponents.forEach(e=>{
              e.classList.add("animation-group-fill")
            }
            )
          }
        })
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    79: 79
  }],
  203: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.wrapper = this.el.querySelector(".rings-wrapper"),
        this.layer1 = this.el.querySelector("#ring-clockwise"),
        this.layer2 = this.el.querySelector("#ring-counter-clockwise"),
        this.layer3 = this.el.querySelector("#ring-counter-clockwise-2"),
        this.rotateEls = [this.layer1, this.layer2, this.layer3],
        this.timeGroup = this.anim.createTimeGroup(this.wrapper),
        this.timeGroup.name = "RingsRotation Component",
        this.animation = {
          isTriggered: this.el.hasAttribute("data-triggered-animation"),
          isFadeoutDisabled: this.el.hasAttribute("data-fadeout-disabled"),
          startExpression: this.el.getAttribute("data-start-expression") || "a0t",
          resetExpression: this.el.getAttribute("data-reset-expression") || "a0t - 30vh",
          anchor: ".timeline-wireless-rings",
          duration: parseFloat(this.el.getAttribute("data-duration") || 1.2),
          fadeDuration: .06,
          scaleFrom: .5,
          scaleTo: parseFloat(this.el.getAttribute("data-scale-to") || 1.4),
          scaleOffset: .3,
          rotation: 360,
          rotationOffset: 200,
          widthFrom: 20,
          widthTo: 7
        },
        this._destroy = this._destroy.bind(this),
        this.kf = null,
        this.allKfs = [],
        this.allKfs.push(this.timeGroup)
      }
      mounted() {
        this._setupEvents(),
        this._setupKeyframes(),
        this._setupTriggerKeyframes()
      }
      play() {
        this.timeGroup && this.timeGroup.play()
      }
      reset() {
        this.timeGroup && (this.timeGroup.pause(),
        this.timeGroup.time(0))
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy)
      }
      _setupKeyframes() {
        this.timeGroup.addKeyframe(this.wrapper, {
          start: 0,
          end: this.animation.fadeDuration,
          opacity: [0, 1],
          disabledWhen: ["no-enhanced"]
        }),
        this.rotateEls.forEach((e,t)=>{
          let i = 0 === t ? "" : "-"
            , s = t * this.animation.scaleOffset
            , n = t * this.animation.rotationOffset;
          this.timeGroup.addKeyframe(e, {
            start: 0,
            end: this.animation.duration,
            scale: [this.animation.scaleFrom, this.animation.scaleTo + s],
            rotation: [0, i + (this.animation.rotation + n)],
            strokeWidth: [this.animation.widthFrom, this.animation.widthTo],
            easeFunction: this.animation.isTriggered ? "easeOutQuad" : "linear",
            disabledWhen: ["no-enhanced"]
          });
          let r = this.timeGroup.getControllerForTarget(e);
          r.on("draw", t=>{
            e.style.strokeWidth = Math.round(t.tweenProps.strokeWidth.current)
          }
          ),
          this.allKfs.push(r)
        }
        ),
        this.animation.isFadeoutDisabled || this.timeGroup.addKeyframe(this.wrapper, {
          start: this.animation.duration - this.animation.fadeDuration,
          end: this.animation.duration,
          opacity: [1, 0],
          disabledWhen: ["no-enhanced"]
        })
      }
      _setupTriggerKeyframes() {
        this.animation.isTriggered ? (this.kf = this.addDiscreteEvent({
          start: this.animation.startExpression,
          end: this.animation.resetExpression,
          event: "Rings:play",
          anchors: [this.el],
          onEnter: ()=>this.play(),
          onExit: ()=>this.reset(),
          disabledWhen: ["no-enhanced"]
        }),
        this.allKfs.push(this.kf)) : (this.kf = this.anim.addKeyframe(this.el, {
          start: this.animation.startExpression,
          end: "a0b",
          anchors: [this.animation.anchor],
          ringsProgress: [0, this.animation.duration],
          disabledWhen: ["no-enhanced"]
        }),
        this.kf.controller.on("draw", e=>{
          const t = e.tweenProps.ringsProgress.current;
          this.timeGroup.time(t)
        }
        ),
        this.allKfs.push(this.kf))
      }
      _destroy() {
        this.allKfs.forEach(e=>{
          e && e.remove()
        }
        )
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    79: 79
  }],
  204: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e, t=null) {
        super(e),
        this.options = e,
        this.noVideo = document.documentElement.classList.contains("no-inline-video"),
        this.breakpoint = this.options.pageMetrics.breakpoint,
        this.el = t || this.el,
        this.pins = [...this.el.querySelectorAll(".pin")],
        this.lastPin = this.pins[this.pins.length - 1],
        this.eventStart = this.el.dataset.eventStart,
        this.eventEnd = this.el.dataset.eventEnd,
        this.scrollEvent = "false" !== this.el.dataset.scrollEvent,
        this.init = !1
      }
      mounted() {
        let e = !this.scrollEvent && !this.noVideo;
        this.init || e || this.addDiscreteEvent({
          start: this.eventStart || "t - 50vh",
          end: this.eventEnd || "b",
          event: "Pin Animation",
          onEnterOnce: ()=>{
            this.animate()
          }
        })
      }
      animate() {
        this.init || (this.init = !0,
        this.el.classList.add("anim-started"),
        this.pins.forEach(e=>{
          let t = e.dataset.animOrder
            , i = {};
          if (t) {
            t.split(" ").forEach(e=>{
              let t = e.split("");
              i[t[0]] = t[1]
            }
            );
            let s = i[this.breakpoint];
            s && (Number(s) === this.pins.length && (this.lastPin = e),
            e.classList.add("anim-order-".concat(s)),
            e.removeAttribute("data-anim-order"))
          }
          e.classList.add("anim")
        }
        ),
        this.lastPin.addEventListener("transitionend", e=>{
          "::after" === e.pseudoElement && (this.el.classList.remove("anim-started"),
          this.el.classList.add("anim-finished"))
        }
        ))
      }
      static IS_SUPPORTED() {
        return !document.documentElement.classList.contains("reduced-motion")
      }
    }
  }
  , {
    79: 79
  }],
  205: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.img = this.el.querySelector(".image-audio"),
        this.sprite = this.el.querySelector(".speaker-sprite")
      }
      mounted() {
        this.imagesDoneLoading().then(()=>{
          this.el.classList.contains("loaded") || this.el.classList.add("loaded")
        }
        ),
        this.addDiscreteEvent({
          start: "a0t - 50vh",
          end: "a0t",
          anchors: [this.img],
          event: "sound-wave-sprite-animate",
          onEnter: ()=>{
            document.documentElement.classList.contains("enhanced") && this.el.classList.add("animate")
          }
        }),
        this.addDiscreteEvent({
          start: "a0t - 100vh",
          end: "b",
          event: "sound-wave-sprite-reset",
          anchors: [this.img],
          onExit: ()=>{
            this.el.classList.remove("animate")
          }
        })
      }
      imagesDoneLoading() {
        return new Promise((e,t)=>{
          let i = null;
          i = setInterval(()=>{
            this.img.hasAttribute("data-anim-lazy-image-download-complete") && this.sprite.hasAttribute("data-anim-lazy-image-download-complete") && (clearInterval(i),
            e())
          }
          , 500)
        }
        )
      }
      static IS_SUPPORTED() {
        return !0
      }
    }
  }
  , {
    79: 79
  }],
  206: [function(e, t, i) {
    "use strict";
    const s = e(79);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.options = e,
        this.isEnhanced = document.documentElement.classList.contains("enhanced"),
        this.getSnipeAnimDuration = window.getComputedStyle(this.el, null).getPropertyValue("animation-duration"),
        this.numOfAnimKeyframes = parseInt(this.getSnipeAnimDuration),
        this.spriteFrame = 0,
        this.animationOver = !1,
        this.parent = this.el.parentNode,
        this.downloadsHardware = this.parent.querySelector(".fluid-image-small"),
        this.hardwareLoaded = !1,
        this.findScaleRatio = null
      }
      mounted() {
        this.setSpriteFrameController(),
        this.setScaleRatio()
      }
      setSpriteFrameController() {
        let e = this.anim.addKeyframe(this.el, {
          start: "t - 75vh",
          end: "b - 40vh",
          progress: [0, 100]
        });
        e.controller.on("draw", t=>{
          if (!this.animationOver) {
            let i = t.tweenProps.progress.current
              , s = i / (100 / this.numOfAnimKeyframes);
            this.spriteFrame !== s && (this.el.style.animationDelay = "-".concat(s, "s")),
            this.spriteFrame = s,
            i === e.jsonProps.progress[1] && (this.animationOver = !0)
          }
        }
        )
      }
      setScaleRatio() {
        if ("S" === this.pageMetrics.breakpoint && this.isEnhanced) {
          let e = ()=>{
            if (this.hardwareLoaded = this.downloadsHardware.classList.contains("loaded"),
            this.hardwareLoaded) {
              let e = this.downloadsHardware.offsetHeight
                , t = getComputedStyle(this.downloadsHardware).getPropertyValue("--download-small-height")
                , i = e / parseInt(t);
              this.parent.style.setProperty("--spritesheet-scale", i),
              clearInterval(this.findScaleRatio)
            }
          }
          ;
          this.findScaleRatio = setInterval(e, 100)
        }
      }
      onResizeImmediate() {
        this.setScaleRatio()
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    79: 79
  }],
  207: [function(e, t, i) {
    "use strict";
    const s = e(79)
      , {rgbGradientString: n, hexToRgb: r} = e(211);
    t.exports = class extends s {
      constructor(e) {
        super(e),
        this.section = this.el.closest("section"),
        this.textMask = this.el.querySelector(".text-gradient"),
        this.params = {
          angle: parseInt(getComputedStyle(this.el).getPropertyValue("--angle").trim()) || 97,
          mainColor: getComputedStyle(this.el).getPropertyValue("--main-color").trim() || "#000000",
          accentColor: getComputedStyle(this.el).getPropertyValue("--accent-color").trim() || "#000000",
          finalColor: getComputedStyle(this.el).getPropertyValue("--final-color").trim() || "#000000",
          fade1: parseInt(getComputedStyle(this.el).getPropertyValue("--fade1").trim().replace("%")) || 100,
          fade2: parseInt(getComputedStyle(this.el).getPropertyValue("--fade2").trim().replace("%")) || 150,
          fade3: parseInt(getComputedStyle(this.el).getPropertyValue("--fade3").trim().replace("%")) || 200,
          blend: parseFloat(getComputedStyle(this.el).getPropertyValue("--blend").trim()) || .5,
          duration: 3,
          progress: 0,
          play: {
            start: "t - 70vh",
            end: "b - 30vh"
          }
        },
        this._destroy = this._destroy.bind(this)
      }
      mounted() {
        this._getOverrides(),
        this._setupAnims(),
        this._setupEvents()
      }
      _getOverrides() {
        Object.keys(this.el.dataset).filter(e=>e.indexOf(!1)).length <= 1 || (this.params.duration = this.el.dataset.kfDuration || this.params.duration,
        this.params.play.start = this.el.dataset.playKfStart || this.params.play.start,
        this.params.play.end = this.el.dataset.playKfEnd || this.params.play.end)
      }
      _setupAnims() {
        this.timeline = this.anim.createScrollGroup(this.textMask),
        this.timeline.name = "".concat(this.section.getAttribute("data-anim-scroll-group"), ' - "').concat(this.textMask.innerText, '" Timeline'),
        this.timeline.addKeyframe(this.textMask, {
          name: "kf1",
          start: this.params.play.start,
          end: this.params.play.end,
          fade1: [this.params.fade1, -100 * this.params.blend * 2],
          fade2: [this.params.fade2, -100 * this.params.blend],
          fade3: [this.params.fade3, 0],
          progress: [0, 1],
          easeFunction: "linear",
          disabledWhen: ["no-enhanced"]
        }).controller.on("draw", e=>{
          this.params.fade1 = e.tweenProps.fade1.current,
          this.params.fade2 = e.tweenProps.fade2.current,
          this.params.fade3 = e.tweenProps.fade3.current,
          this.params.progress,
          e.tweenProps.progress.current,
          this._updateGradient(...this._gradientPayload(r(this.params.mainColor), r(this.params.accentColor), r(this.params.finalColor), this.textMask, this.params))
        }
        )
      }
      _gradientPayload(e, t, i, s, n) {
        return [s, [e, t, i], [n.fade1, n.fade2, n.fade3], n.angle]
      }
      _updateGradient(e, t, i, s) {
        const r = n(t, i, s);
        e.style.backgroundImage = r
      }
      _setupEvents() {
        this.anim.once("enhanced-destroy", this._destroy)
      }
      _destroy() {
        this.timeline.remove().then(()=>{
          this.textMask.style.backgroundImage = ""
        }
        )
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
  }
  , {
    211: 211,
    79: 79
  }],
  208: [function(e, t, i) {
    "use strict";
    const s = e(79)
      , {ThreeJSLoader: n} = e(46);
    class r extends s {
      constructor() {
        super(...arguments),
        this._THREELoaderSettings = {
          revisionNumber: 118
        },
        this.animGroup = this.anim.getGroupForTarget(this.el),
        this._onEnterKeyframeHandler = this._onEnterKeyframeHandler.bind(this),
        this._THREELoadedHandler = this._THREELoadedHandler.bind(this),
        this._THREEErrorHandler = this._THREEErrorHandler.bind(this),
        this.gum.once("DOM_COMPONENTS_MOUNTED", ()=>{
          this._initialize()
        }
        )
      }
      get name() {
        return "ThreeJSController"
      }
      _initialize() {
        this.animGroup.addEvent(this.el, {
          event: "THREE.js Loader",
          start: "t - 200vh",
          end: "b + 100vh",
          disabledWhen: ["no-enhanced"],
          onEnterOnce: this._onEnterKeyframeHandler
        })
      }
      _onEnterKeyframeHandler() {
        void 0 === window.THREE && n.load(this._THREELoaderSettings).then(this._THREELoadedHandler).catch(e=>this._THREEErrorHandler(e)),
        setTimeout(()=>{
          if (!window.THREE)
            return document.documentElement.classList.add("no-threejs-loaded"),
            void this.gum.trigger(r.EVENTS.THREE_NOT_LOADED)
        }
        , 4e3)
      }
      _THREELoadedHandler() {
        document.documentElement.classList.add("threejs-loaded"),
        this.gum.trigger(r.EVENTS.THREE_LOADED)
      }
      _THREEErrorHandler(e) {
        throw new Error("".concat(this.name, " :: ").concat(e))
      }
      static get EVENTS() {
        return {
          THREE_NOT_LOADED: "THREE_NOT_LOADED",
          THREE_LOADED: "THREE_LOADED"
        }
      }
      static IS_SUPPORTED() {
        return document.documentElement.classList.contains("enhanced")
      }
    }
    t.exports = r
  }
  , {
    46: 46,
    79: 79
  }],
  209: [function(e, t, i) {
    "use strict";
    function s(e, t, i) {
      return {
        h: e,
        s: t * i / ((e = (2 - t) * i) < 1 ? e : 2 - e),
        l: e / 2
      }
    }
    function n(e, t, i) {
      return {
        h: e,
        s: 2 * (t *= i < .5 ? i : 1 - i) / (i + t),
        v: i + t
      }
    }
    Object.defineProperty(i, "__esModule", {
      value: !0
    }),
    i.convertAnimToGui = function(e) {
      let t, i, s = ["h", "s", "l"], r = {
        start: {},
        end: {}
      };
      for (let n = 0; n < s.length; n++)
        t = e[s[n]][0],
        i = e[s[n]][1],
        "s" !== s[n] && "l" !== s[n] || (t /= 100,
        i /= 100),
        r.start[s[n]] = t,
        r.end[s[n]] = i;
      let a = n(r.start.h, r.start.s, r.start.l)
        , o = n(r.end.h, r.end.s, r.end.l);
      return {
        hsvStart: a,
        hsvEnd: o
      }
    }
    ,
    i.convertGuiToAnim = function(e) {
      return s(e.h, e.s, e.v)
    }
    ,
    i.hsv2hsl = s,
    i.hsl2hsv = n
  }
  , {}],
  210: [function(e, t, i) {
    "use strict";
    t.exports = {
      0: {
        start: "00:00",
        end: "01:15"
      },
      15: {
        start: "00:29",
        end: "01:30"
      },
      20: {
        start: "00:15",
        end: "01:20"
      },
      19: {
        start: "00:50",
        end: "01:54"
      },
      5: {
        start: "00:30",
        end: "01:51"
      },
      4: {
        start: "00:40",
        end: "02:01"
      },
      3: {
        start: "00:50",
        end: "02:11"
      },
      22: {
        start: "00:45",
        end: "01:00"
      },
      21: {
        start: "01:00",
        end: "01:45"
      },
      12: {
        start: "01:00",
        end: "02:15"
      },
      10: {
        start: "01:00",
        end: "02:15"
      },
      13: {
        start: "01:00",
        end: "02:45"
      },
      2: {
        start: "01:10",
        end: "02:43"
      },
      9: {
        start: "01:10",
        end: "02:14"
      },
      14: {
        start: "01:10",
        end: "02:28"
      },
      6: {
        start: "01:20",
        end: "02:16"
      },
      11: {
        start: "01:20",
        end: "02:16"
      },
      17: {
        start: "01:51",
        end: "02:47"
      },
      16: {
        start: "02:18",
        end: "03:35"
      },
      7: {
        start: "02:40",
        end: "03:25"
      },
      18: {
        start: "03:02",
        end: "04:10"
      },
      8: {
        start: "03:32",
        end: "04:10"
      }
    }
  }
  , {}],
  211: [function(e, t, i) {
    "use strict";
    const s = /[a-f\d]{2}/gi
      , n = e=>e.map(e=>e.map(Math.round))
      , r = e=>e.toFixed(2)
      , a = e=>"rgb(".concat(e.join(), ")")
      , o = ([e,t,i])=>"hsl(".concat(e, ", ").concat(t, "%, ").concat(i, "%)");
    function h(e, t, i, s) {
      const [a,o] = n(e).map(s)
        , [h,l] = t.map(r);
      return "linear-gradient(\n\t\t".concat(i, "deg,\n\t\t").concat(a, " ").concat(h, "%,\n\t\t").concat(o, " ").concat(l, "%)")
    }
    function l(e) {
      let t = e.replace("#", "");
      return 3 === t.length && (t = t.split("").map(e=>e + e).join("")),
      t.match(s).map(e=>parseInt(e, 16))
    }
    function c(e) {
      const [t,i,s] = e.map(e=>e / 255)
        , n = Math.min(t, i, s)
        , r = Math.max(t, i, s)
        , a = r - n;
      let o = 0
        , h = 0
        , l = 0;
      return o = 0 === a ? 0 : r === t ? (i - s) / a % 6 : r === i ? (s - t) / a + 2 : (t - i) / a + 4,
      o = Math.round(60 * o),
      o < 0 && (o += 360),
      l = (r + n) / 2,
      h = 0 === a ? 0 : a / (1 - Math.abs(2 * l - 1)),
      h = +(100 * h).toFixed(1),
      l = +(100 * l).toFixed(1),
      [o, h, l]
    }
    t.exports = {
      rgbColorString: a,
      hslColorString: o,
      rgbGradientString: function(e, t, i) {
        return 3 === t.length ? function(e, t, i, s) {
          const [a,o,h] = n(e).map(s)
            , [l,c,d] = t.map(r);
          return "linear-gradient(\n\t\t".concat(i, "deg,\n\t\t").concat(a, " ").concat(l, "%,\n\t\t").concat(o, " ").concat(c, "%,\n\t\t").concat(h, " ").concat(d, "%)")
        }(e, t, i, a) : h(e, t, i, a)
      },
      hslGradientString: function(e, t, i) {
        return h(e, t, i, o)
      },
      rgbToHex: function([e,t,i]) {
        return "#" + ((1 << 24) + (e << 16) + (t << 8) + i).toString(16).slice(1)
      },
      rgbToHsl: c,
      hexToHsl: function(e) {
        return c(l(e))
      },
      hexToRgb: l
    }
  }
  , {}],
  212: [function(e, t, i) {
    "use strict";
    var s = e(29)(e(28));
    function n(e, t) {
      var i = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var s = Object.getOwnPropertySymbols(e);
        t && (s = s.filter((function(t) {
          return Object.getOwnPropertyDescriptor(e, t).enumerable
        }
        ))),
        i.push.apply(i, s)
      }
      return i
    }
    function r(e) {
      for (var t = 1; t < arguments.length; t++) {
        var i = null != arguments[t] ? arguments[t] : {};
        t % 2 ? n(Object(i), !0).forEach((function(t) {
          (0,
          s.default)(e, t, i[t])
        }
        )) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(i)) : n(Object(i)).forEach((function(t) {
          Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(i, t))
        }
        ))
      }
      return e
    }
    t.exports = class {
      constructor(e) {
        this.id = e.id,
        this.el = e.el,
        this.THREE = e.THREE,
        this.material = e.material,
        this.matrixContainer = this.el.querySelector(".experience-display-matrix"),
        this.stickyOverflow = this.el.querySelector(".sticky-overflow"),
        this.screenSize = parseFloat(getComputedStyle(this.matrixContainer).getPropertyValue("--screen-to-hardware-ratio")),
        this.screenOffsetX = parseFloat(getComputedStyle(this.matrixContainer).getPropertyValue("--screen-offset-x")),
        this.screenOffsetY = parseFloat(getComputedStyle(this.matrixContainer).getPropertyValue("--screen-offset-y")),
        this.mesh = this._createMesh()
      }
      _createMesh() {
        let t, i, s = new this.THREE.ShaderMaterial(r(r({}, this.material), {}, {
          vertexShader: e(170).vert,
          opacity: 0,
          transparent: !0,
          blending: "hardware" === this.id ? this.THREE.NormalBlending : this.THREE.AdditiveBlending
        }));
        s.extensions.derivatives = !0,
        s.extensions.shaderTextureLOD = !0;
        let n = Math.max(this.stickyOverflow.clientWidth, this.stickyOverflow.clientHeight);
        switch (this.id) {
        case "hardware":
          t = new this.THREE.PlaneBufferGeometry(n,n,1,1),
          i = new this.THREE.Mesh(t,s);
          break;
        default:
          t = new this.THREE.PlaneBufferGeometry(n * this.screenSize,n * this.screenSize,1,1),
          i = new this.THREE.Mesh(t,s),
          i.position.x = this.screenOffsetX,
          i.position.y = this.screenOffsetY
        }
        return i.position.z = s.uniforms.uZPosition.value,
        i
      }
    }
  }
  , {
    170: 170,
    28: 28,
    29: 29
  }],
  213: [function(e, t, i) {
    "use strict";
    const s = ["(max-width: 734px) and (max-height: 500px)", "(min-width: 735px) and (max-width: 1068px) and (max-height: 540px)", "(min-width: 1069px) and (max-height: 600px)"]
      , n = e(85);
    t.exports = {
      getFallbackMediaQueries: ()=>s,
      isSmallOnDesktop: ()=>!n() && window.matchMedia("(max-width: 734px)").matches,
      shouldFallbackHeight: ()=>s.some(e=>window.matchMedia(e).matches)
    }
  }
  , {
    85: 85
  }],
  214: [function(e, t, i) {
    "use strict";
    t.exports = function() {
      let t;
      try {
        t = e("@marcom/ac-analytics");
        const i = document.documentElement.classList.contains("enhanced");
        let s = {
          eVar70: "{PAGE_NAME_NO_LOCALE} - enhanced"
        };
        i || (s = {
          eVar70: "{PAGE_NAME_NO_LOCALE} - static"
        }),
        t.passiveTracker(s)
      } catch (e) {}
    }
  }
  , {
    undefined: void 0
  }],
  215: [function(e, t, i) {
    "use strict";
    const s = e(80)
      , n = e(81)
      , r = e(216)
      , a = e(59)
      , o = e(50)
      , h = e(117).PictureLazyLoading
      , l = e(1)
      , {applyPrices: c} = e(133)
      , d = e(214);
    ({
      initialize() {
        Object.assign(n, r);
        let e = document.querySelector("body");
        new s(e).anim.on(a.EVENTS.ON_DOM_GROUPS_CREATED, ()=>{
          new o,
          new h
        }
        ),
        c.loadPricingFromHTML(),
        c.loadTradeInFromHTML(),
        l.detect(),
        d()
      }
    }).initialize()
  }
  , {
    1: 1,
    117: 117,
    133: 133,
    214: 214,
    216: 216,
    50: 50,
    59: 59,
    80: 80,
    81: 81
  }],
  216: [function(e, t, i) {
    "use strict";
    t.exports = {
      PageStateManager: e(191),
      FocusManager: e(174),
      LocalnavThemeChanger: e(187),
      SmartPins: e(204),
      TextGradient: e(207),
      InlineMedia: e(180),
      Rays: e(194),
      RaysGroupTiming: e(202),
      ExperienceDisplay: e(162),
      ExperienceHeadlineZoom: e(171),
      OutroCopy: e(188),
      OutroHardware: e(189),
      OutroTextZoom: e(190),
      Hero: e(176),
      HeroTextZoom: e(179),
      HeroHeadline: e(177),
      HeroSubHeadline: e(178),
      PencilVideo: e(192),
      KeyboardVideo: e(186),
      Chip: e(159),
      RingsRotation: e(203),
      ExperienceWireless: e(172),
      ExperienceWirelessHeadline: e(173),
      SpriteTiedToScroll: e(206),
      SpriteAnimation: e(205),
      PictureCaptionContext: e(193),
      ChipFade: e(160),
      HardwareParallax: e(175),
      ThreeJSController: e(208),
      DisplayXdr: e(161)
    }
  }
  , {
    159: 159,
    160: 160,
    161: 161,
    162: 162,
    171: 171,
    172: 172,
    173: 173,
    174: 174,
    175: 175,
    176: 176,
    177: 177,
    178: 178,
    179: 179,
    180: 180,
    186: 186,
    187: 187,
    188: 188,
    189: 189,
    190: 190,
    191: 191,
    192: 192,
    193: 193,
    194: 194,
    202: 202,
    203: 203,
    204: 204,
    205: 205,
    206: 206,
    207: 207,
    208: 208
  }]
}, {}, [215]);
