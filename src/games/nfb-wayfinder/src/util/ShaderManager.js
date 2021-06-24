import * as THREE from "three";
import ObjectPool from "./ObjectPool";

const materialsToBeInit = [];
const boxMesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial()
);
boxMesh.name = "shader-manager-box";
const boxScene = new THREE.Scene();
const boxCamera = new THREE.OrthographicCamera(-1, 1, -1, 1, -10, 10);
const boxes = [];

const boxPool = new ObjectPool({
  create() {
    const box = boxMesh.clone();
    boxScene.add(box);
    // box.userData.wasVisible = false;
    return box;
  },
  release(m) {
    if (m.parent) {
      m.parent.remove(m);
    }
  },
});

export function create(opts) {
  const material = new THREE.ShaderMaterial(opts);
  materialsToBeInit.push(material);
  if (!opts.name) {
    console.error("Must specify name for ShaderMaterial");
  }
  return material;
}

export function push(shader) {
  materialsToBeInit.push(shader);
}

export function initialize(renderer, max = Infinity) {
  if (materialsToBeInit.length <= 0) return;

  const len = Math.min(max, materialsToBeInit.length);
  boxes.length = len;
  for (let i = 0; i < len; i++) {
    boxes[i] = boxPool.next();
    boxes[i].material = materialsToBeInit[i];
    // boxes[i].material.needsUpdate = true;
    // boxes[i].material.version++;
  }

  renderer.render(boxScene, boxCamera);

  for (let i = 0; i < len; i++) {
    const box = boxes[i];
    // box.material.needsUpdate = true;
    box.material = null;
    boxPool.release(box);
  }
  boxes.length = 0;
  // console.log("Init", len, "materials");
  materialsToBeInit.length = materialsToBeInit.length - len;
}
