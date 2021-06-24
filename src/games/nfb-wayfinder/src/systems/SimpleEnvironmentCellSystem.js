import * as Tags from "../tags";
import * as THREE from "three";
import Random from "../util/Random";
import ObjectPool from "../util/ObjectPool";
import { clearGroup } from "../util/three-util";
import { GridBounds } from "./environment/EnvironmentGrid";
import { MathUtils } from "three";
import { getLakeObject, insideWaterPolys } from "../util/water-util";

export default function SimpleEnvironmentCellSystem(world) {
  const environments = world.view([
    Tags.ActiveEnvironmentState,
    Tags.EnvironmentState,
  ]);

  const defaultSeed = new Uint16Array(4);
  const randomPool = new ObjectPool({
    initialCapacity: 12,
    create() {
      return Random(defaultSeed);
    },
  });

  const tmp2DArray = [0, 0];
  const tmpBox = new THREE.Box3();
  const raycaster = new THREE.Raycaster();
  const mousePlane = new THREE.Plane(new THREE.Vector3(-0, -1, -0), -0);
  const pos2D = new THREE.Vector2();
  const pos3D = new THREE.Vector3();
  const tmp3D = new THREE.Vector3();
  const corners = [
    [-1, 1],
    [1, 1],
    [1, -1],
    [-1, -1],
  ];

  const activeCells = world.view(Tags.EnvironmentCell);

  const underPlayer = world.tag(Tags.EnvironmentUnderPlayerState);
  const gridBounds = new GridBounds();

  return function envCellSystem(dt) {
    const target = world.findTag(Tags.UserTarget).position;
    const camera = world.findTag(Tags.MainCamera);
    camera.updateProjectionMatrix();

    // get min and max points on screen
    const maxRadialDistance = 80;
    const maxAssetHeight = 12;
    tmpBox.makeEmpty();
    for (let i = 0; i < corners.length; i++) {
      const uv = corners[i];
      pos2D.fromArray(uv);
      raycaster.setFromCamera(pos2D, camera);
      const hit = raycaster.ray.intersectPlane(mousePlane, pos3D);
      if (!hit) return; // why??

      const delta = tmp3D.copy(pos3D).sub(target);
      const dist = delta.length();
      if (dist !== 0) delta.divideScalar(dist); // normalize

      if (dist > maxRadialDistance) {
        pos3D.copy(target).addScaledVector(tmp3D, maxRadialDistance);
      }
      tmpBox.expandByPoint(pos3D);
    }
    tmpBox.min.y = 0;
    tmpBox.max.y = maxAssetHeight;
    underPlayer.water = false;
    underPlayer.lake = null;
    // check each active environment...
    if (environments.length > 0) {
      const state = environments[0].get(Tags.EnvironmentState);
      matchAgainstEnvironment(state);
    }
  };

  function matchAgainstEnvironment(state) {
    const grid = state.grid;
    grid.box3ToBounds(tmpBox, gridBounds);

    const padding = 0;
    const padBottom = 1;
    gridBounds.minX = MathUtils.clamp(
      gridBounds.minX - padding,
      0,
      grid.cellDivisions - 1
    );
    gridBounds.minY = MathUtils.clamp(
      gridBounds.minY - padding,
      0,
      grid.cellDivisions - 1
    );
    gridBounds.maxX = MathUtils.clamp(
      gridBounds.maxX + padding,
      0,
      grid.cellDivisions - 1
    );
    gridBounds.maxY = MathUtils.clamp(
      gridBounds.maxY + padding + padBottom,
      0,
      grid.cellDivisions - 1
    );

    // go through all active cells and remove any out of bounds
    activeCells.forEach((e) => {
      const c = e.get(Tags.EnvironmentCell);
      // cell has disappeared from view, turn it off
      if (
        c.environmentState !== state ||
        !grid.isCellInBounds(c.cell, gridBounds)
      ) {
        // console.log("kill cell");
        randomPool.release(c.random); // release random func
        c.cell.entity = null; // release
        c.environmentState = null;
        c.cell = null;
        e.kill();
      }
    });

    // go through all the cells in view and add any entities that appeared
    let cellsInViewCount = 0;
    grid.forEachCellInBounds(gridBounds, (cell) => {
      cellsInViewCount++;
      if (!cell.entity) {
        // console.log("make cell");
        cell.entity = world.entity().add(Tags.EnvironmentCell);
        const t = cell.entity.get(Tags.EnvironmentCell);
        t.cell = cell;
        t.environmentState = state;
        t.random = randomPool.next();
        t.random.seed(cell.seed);
      }
    });

    const position = world.findTag(Tags.UserCharacter).position;
    tmp2DArray[0] = position.x;
    tmp2DArray[1] = position.z;
    const playerShowing =
      !world.findTag(Tags.HideCharacter) &&
      !world.findTag(Tags.AnimateOutCharacter);
    if (!underPlayer.water && playerShowing) {
      const lake = getLakeObject(state, tmp2DArray);
      underPlayer.water = Boolean(lake);
      underPlayer.lake = lake;
    }
  }
}
