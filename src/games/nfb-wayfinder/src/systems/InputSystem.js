import * as Tags from "../tags";
import * as THREE from "three";
import { spliceObject } from "../util/array";
import EventEmitter from "../util/tiny-event";

export default function InputSystem(world, opts = {}) {
  const canvas = world.findTag(Tags.Canvas);

  let currentTouchID = null;
  let currentTouches = [];

  let hasTouchEvents = false;

  const emitter = new EventEmitter();
  // const POINTER = document.body.appendChild(document.createElement("div"));
  // Object.assign(POINTER.style, {
  //   position: "fixed",
  //   top: "0px",
  //   pointerEvents: "none",
  //   left: "0px",
  //   transform: "translate(-25px, -25px)",
  //   width: "50px",
  //   height: "50px",
  //   borderRadius: "100%",
  //   background: "red",
  //   zIndex: "200000000",
  // });

  const e = world.entity("InputEntity").add(Tags.InputState);
  const appState = world.findTag(Tags.AppState);
  const inputState = e.get(Tags.InputState);
  const rawState = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    multitouch: null,
    interacted: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    pressed: false,
  };

  const keydown = (ev) => _copyKeys(ev, rawState);
  const keyup = (ev) => _copyKeys(ev, rawState);
  const passive = { passive: true };
  window.addEventListener("keydown", keydown, passive);
  window.addEventListener("keyup", keyup, passive);
  window.addEventListener("mousemove", mousemove, passive);
  window.addEventListener("mouseup", mouseup, passive);
  canvas.addEventListener("mousedown", mousedown, passive);
  canvas.addEventListener("touchstart", touchstart, { passive: false });
  window.addEventListener("touchend", touchend, passive);
  window.addEventListener("touchmove", touchmove);
  canvas.addEventListener("contextmenu", contextmenu);

  world.entity().add(Tags.InputGestureEmitter, emitter);
  const tapper = (ev) => emitter.emit("tap", ev);
  window.addEventListener("touchend", tapper, passive);
  window.addEventListener("click", tapper, passive);
  canvas.addEventListener("mousedown", tapper, passive);
  // window.addEventListener("touchend", ev => {
  //   rawState.pressed = false;
  // }, passive);

  const gestureEntity = world.entity();
  const clearInputPressTags = world.view(Tags.ClearInputPress);

  return {
    process(dt) {
      inputState.position.x = rawState.x;
      inputState.position.y = rawState.y;
      inputState.positionNormalized.x = rawState.x / appState.width;
      inputState.positionNormalized.y = rawState.y / appState.height;
      inputState.pressed = rawState.pressed;
      inputState.metaKey = rawState.metaKey;
      inputState.ctrlKey = rawState.ctrlKey;
      inputState.shiftKey = rawState.shiftKey;
      inputState.interacted = rawState.interacted;
      inputState.multitouch = rawState.multitouch;
      if (!gestureEntity.has(Tags.UserInitiatedGesture) && inputState.pressed) {
        gestureEntity.add(Tags.UserInitiatedGesture);
      }

      // console.log(inputState.pressed);
      const uiActive = world.findTag(Tags.IsGameUIActive);
      const clearPress = clearInputPressTags.length > 0;
      if (uiActive || clearPress) {
        inputState.pressed = false;
        rawState.pressed = false;
        // if (clearPress) {
        inputState.interacted = false;
        rawState.interacted = false;
        clearInputPressTags.forEach((e) => {
          e.tagOff(Tags.ClearInputPress);
        });
        // }
      }
      // Object.assign(POINTER.style, {
      //   backgroundColor: inputState.pressed ? "green" : "red",
      //   top: `${inputState.position.y}px`,
      //   left: `${inputState.position.x}px`,
      // });
    },
    dispose() {
      canvas.removeEventListener("contextmenu", contextmenu);
      window.removeEventListener("mousedown", mousedown);
      window.removeEventListener("mousemove", mousemove);
      canvas.removeEventListener("touchstart", touchstart);
      window.removeEventListener("touchend", touchend);
      window.removeEventListener("touchmove", touchmove);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);

      window.removeEventListener("touchend", tapper);
      window.removeEventListener("click", tapper);
      window.removeEventListener("mousedown", tapper);
    },
  };

  function contextmenu(ev) {
    if (process.env.NODE_ENV !== "development") {
      ev.preventDefault();
      return false;
    }
  }

  function findEarliestTouch(ev) {
    const id = earliestTouchID();
    return findTouchByID(ev, id) || ev.changedTouches[0];
  }

  function findTouchByID(ev, id) {
    let touch;
    if (id != null) {
      for (let i = 0; i < ev.touches.length; i++) {
        if (ev.touches[i].identifier === id) return ev.touches[i];
      }
    }
    return null;
  }

  function earliestTouchID() {
    let minId = Infinity;
    for (let i = 0; i < currentTouches.length; i++) {
      const id = currentTouches[i];
      if (id < minId) {
        minId = id;
      }
    }
    return isFinite(minId) ? minId : null;
  }

  function touchstart(ev) {
    hasTouchEvents = true;

    const shouldIgnore = shouldIgnoreTap();
    if (shouldIgnore) return;

    let touch;
    if (currentTouchID == null) {
      // no ID yet assigned
      touch = ev.changedTouches[0];
      currentTouchID = touch.identifier;
      // trigger event start
      ev.preventDefault();

      rawState.pressed = true;
      _copyEvent(ev, rawState);
      _copyClientXY(touch, rawState);
    }
    rawState.multitouch = ev.touches.length > 1;
  }

  function touchend(ev) {
    const shouldIgnore = shouldIgnoreTap();
    if (shouldIgnore) return;

    const prevID = currentTouchID;
    if (currentTouchID) {
      // first check if the touch still exists
      const t = findTouchByID(currentTouchID);
      if (!t) currentTouchID = null;
    }

    // now see if the changed touch matches our ID
    if (currentTouchID != null) {
      for (let i = 0; i < ev.changedTouches.length; i++) {
        const t = ev.changedTouches[i];
        if (t.identifier === currentTouchID) {
          // console.log("press1copy!");
          _copyClientXY(t, rawState);
          currentTouchID = null;
          break;
        }
      }
    }

    // we've lost our touch, see if there's another one we should pick up
    if (!currentTouchID) {
      for (let i = 0; i < ev.touches.length; i++) {
        const t = ev.touches[i];
        if (t.identifier !== prevID) {
          currentTouchID = t.identifier;
          rawState.pressed = true;
          // console.log("press2!");
          _copyClientXY(t, rawState);
          break;
        }
      }
    }

    // still none... just take first
    if (!currentTouchID && ev.touches.length >= 1) {
      const t = ev.touches[0];
      currentTouchID = t.identifier;
      rawState.pressed = true;
      // console.log("press3!");
      _copyClientXY(t, rawState);
    }

    if (!currentTouchID) {
      rawState.pressed = false;
    }

    _copyEvent(ev, rawState);
    rawState.multitouch = ev.touches.length > 1;
  }

  function touchmove(ev) {
    const shouldIgnore = shouldIgnoreTap();
    if (shouldIgnore) return;

    if (currentTouchID == null) {
      // odd case here, we have no touch registered, find the first one...
      currentTouchID = ev.changedTouches[0].identifier;
    }
    for (let i = 0; i < ev.changedTouches.length; i++) {
      const t = ev.changedTouches[i];
      if (t.identifier === currentTouchID) {
        rawState.pressed = true;
        // ev.preventDefault();
        _copyClientXY(t, rawState);
        _copyEvent(ev, rawState);
        break;
      }
    }
    rawState.multitouch = ev.touches.length > 1;
  }

  function mousedown(ev) {
    if (ev.button !== 0) return;
    if (shouldIgnoreTap()) return;
    _copyEvent(ev, rawState);
    _copyClientXY(ev, rawState);
    rawState.pressed = true;
    gestureEntity.add(Tags.TriggerMovementGesture);
    gestureEntity.remove(Tags.TriggerMovementGesture);
  }

  function mouseup(ev) {
    if (ev.button !== 0) return;
    if (shouldIgnoreTap()) return;
    // if (hasTouchEvents && rawState.pressed) {
    //   return;
    // }
    _copyEvent(ev, rawState);
    _copyClientXY(ev, rawState);
    rawState.pressed = false;
  }

  function mousemove(ev) {
    if (ev.button !== 0) return;
    if (shouldIgnoreTap()) return;

    // if (hasTouchEvents && rawState.pressed) {
    //   return;
    // }
    // console.log(ev);
    _copyEvent(ev, rawState);
    _copyClientXY(ev, rawState);
  }

  function _copyKeys(ev, state) {
    if (ev.shiftKey != null) state.shiftKey = ev.shiftKey;
    if (ev.metaKey != null) state.metaKey = ev.metaKey;
    if (ev.ctrlKey != null) state.ctrlKey = ev.ctrlKey;
  }

  function shouldIgnoreTap() {
    // const uiActive = world.findTag(Tags.IsGameUIActive);
    // return uiActive;
    return false;
  }

  function _copyClientXY(ev, state) {
    state.x = ev.clientX;
    state.y = ev.clientY;
    inputState.x = state.x;
    inputState.y = state.y;
    // console.log("new copy", state.x, state.y);
  }

  function _copyEvent(ev, state) {
    state.interacted = true;
    _copyKeys(ev, state);
  }
}
