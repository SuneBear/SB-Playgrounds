import * as THREE from "three";
import * as Tags from "../tags";
import * as MathUtil from "../util/math";
import mouseWheel from "mouse-wheel";
import query from "../util/query-string";

export default function UserZoomSystem(world, props) {
  const e = world.entity("UserZoomEntity").add(Tags.UserZoom, props);

  let y = 0;
  let listener;
  if (query.zoom) {
    listener = mouseWheel(
      world.findTag(Tags.Canvas),
      (dx, dy, dz, ev) => {
        y += dy;
      },
      true
    );
  }

  return {
    dispose() {
      if (listener) window.removeEventListener("wheel", listener);
    },
    process,
  };

  function process(dt) {
    const userZoom = e.get(Tags.UserZoom);
    const {
      allowMouseZoom,
      distance,
      zoomPowFactor,
      zoomPixelsToWorld,
      zoomPowTarget,
      minDistance,
      maxDistance,
    } = userZoom;

    if (allowMouseZoom) userZoom.currentWheelOffset += y;
    y = 0;
    const zoomFactor = Math.pow(distance / zoomPowTarget, zoomPowFactor);
    userZoom.distance +=
      userZoom.currentWheelOffset * zoomPixelsToWorld * zoomFactor;
    userZoom.currentWheelOffset = 0;
    userZoom.distance = MathUtil.clamp(
      userZoom.distance,
      minDistance,
      maxDistance
    );
  }
}
