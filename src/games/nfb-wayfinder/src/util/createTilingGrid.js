import * as THREE from "three";
import { inverseLerp } from "./math";
import { clearGroup, detachObject } from "./three-util";
import ObjectPool from "./ObjectPool";
import { spliceOne } from "./array";

class CellData {
  visible = false;
  data = null;
  nearby = null;
  tile = [0, 0];
}

export default function createTilingGrid(opt = {}) {
  const {
    size = 30,
    maxCells = 9,
    initialCapacity = 9,
    tileHeight = 2.5,
    populateTile = () => {},
    releaseTile = (group, tile) => {
      detachObject(group);
    },
  } = opt;
  const group = new THREE.Group();
  group.name = "tiling-grass-group";

  const GRID_DIMENSION = size;
  const GRID_DIMENSION_HALF = GRID_DIMENSION / 2;
  const GRID_TOTAL_TILES = 9;
  const GRID_ROWS = Math.sqrt(GRID_TOTAL_TILES);
  const GRID_ROW_MID = (GRID_ROWS - 1) / 2;

  let currentTilePosition = null; //new THREE.Vector2();

  const tmpBox = new THREE.Box3();
  const cellBox = new THREE.Box3(
    new THREE.Vector3(-GRID_DIMENSION_HALF, 0, -GRID_DIMENSION_HALF),
    new THREE.Vector3(GRID_DIMENSION_HALF, tileHeight, GRID_DIMENSION_HALF)
  );

  const cells = [];
  const tmpMat = new THREE.Matrix4();
  const frustum = new THREE.Frustum();
  const projScreenMatrix = new THREE.Matrix4();

  const cellDataPool = new ObjectPool({
    name: "TilingGridCellData",
    initialCapacity,
    create() {
      return new CellData();
    },
  });

  const pool = new ObjectPool({
    name: "TilingGridGroup",
    initialCapacity,
    create() {
      return new THREE.Group();
    },
  });

  function setBox(tx, ty, out = new THREE.Box3()) {
    out.copy(cellBox);
    const px = tileToWorld(tx);
    const pz = tileToWorld(ty);
    out.min.x += px;
    out.max.x += px;
    out.min.z += pz;
    out.max.z += pz;
    return out;
  }

  return {
    update,
    group,
    cellBox,
  };

  function update(camera, position) {
    projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );

    frustum.setFromProjectionMatrix(projScreenMatrix);

    let tileX = worldToTile(position.x);
    let tileY = worldToTile(position.z);
    if (
      currentTilePosition == null ||
      currentTilePosition.x !== tileX ||
      currentTilePosition.y !== tileY
    ) {
      if (!currentTilePosition) currentTilePosition = new THREE.Vector2();
      currentTilePosition.set(tileX, tileY);
    }

    cells.forEach((c) => {
      c.visible = false;
    });

    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_ROWS; x++) {
        const tx = tileX + (x - GRID_ROW_MID);
        const ty = tileY + (y - GRID_ROW_MID);
        const hasCell = cells.some((c) => c.tile[0] === tx && c.tile[1] === ty);
        setBox(tx, ty, tmpBox);
        const visible = frustum.intersectsBox(tmpBox);
        if (!hasCell && visible) {
          if (cells.length >= maxCells) {
            // try to remove the a 'far away' cell to make room for closer ones
            removeFirstFarCell();
          }
          if (cells.length >= maxCells) {
            // we reached capacity, break out early...
            break;
          }

          const cell = cellDataPool.next();
          cell.data = null;
          cell.nearby = true; // true as we are only adding NxN around target here
          cell.visible = true;
          cell.tile[0] = tx;
          cell.tile[1] = ty;
          cells.push(cell);
        }
      }
    }

    for (let i = cells.length - 1; i >= 0; i--) {
      const cell = cells[i];
      const [tx, ty] = cell.tile;
      setBox(tx, ty, tmpBox);
      const visible = cell.visible ? true : frustum.intersectsBox(tmpBox);
      // update cell
      cell.nearby =
        Math.abs(tx - currentTilePosition.x) <= GRID_ROW_MID &&
        Math.abs(ty - currentTilePosition.y) <= GRID_ROW_MID;
      if (visible) {
        //create cell
        if (!cell.data) {
          const tileObject = pool.next();
          tileObject.position.set(tileToWorld(tx), 0, tileToWorld(ty));
          group.add(tileObject);
          cell.data = tileObject;
          populateTile(tileObject, cell.tile);
        }
      } else {
        // kill cell
        spliceOne(cells, i);
        killCell(cell);
      }
    }
  }

  function killCell(cell) {
    if (cell.data) {
      pool.release(cell.data);
      releaseTile(cell.data, cell.tile);
      cell.data = null;
    }
    cellDataPool.release(cell);
  }

  function removeFirstFarCell() {
    for (let i = cells.length - 1; i >= 0; i--) {
      const c = cells[i];
      if (c.nearby === false) {
        cells.splice(i, 1);
        killCell(c);
        return;
      }
    }
  }

  function tileToWorld(n) {
    return n * GRID_DIMENSION;
  }

  function worldToTile(x) {
    return (
      Math.floor(inverseLerp(-GRID_DIMENSION_HALF, GRID_DIMENSION_HALF, x)) || 0
    );
  }
}
