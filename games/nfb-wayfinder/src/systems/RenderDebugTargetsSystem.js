import * as Tags from "../tags";
import * as THREE from "three";
import { clearGroup } from "../util/three-util";

export default function RenderDebugTargetsSystem(world) {
  const renderer = world.findTag(Tags.Renderer);
  const debugs = world.view(Tags.DebugRenderTarget);
  const debugEvents = world.listen(Tags.DebugRenderTarget);
  const orthoCam = new THREE.OrthographicCamera();
  const orthoScene = new THREE.Scene();
  const planeGeo = new THREE.PlaneGeometry(1, 1);
  planeGeo.translate(0.5, 0.5, 0);

  return (dt) => {
    const size = renderer.getSize(new THREE.Vector2());
    orthoCam.left = 0;
    orthoCam.right = size.x;
    orthoCam.top = 0;
    orthoCam.bottom = size.y;
    orthoCam.near = -10;
    orthoCam.far = 10;
    orthoCam.updateProjectionMatrix();

    clearGroup(orthoScene);

    const rHeight = 150;
    let offsetY = 25;
    debugs.forEach((e, i) => {
      const { target, visible } = e.get(Tags.DebugRenderTarget);
      if (visible === false) return;

      const aspect = target.width / target.height;
      const h = rHeight;
      const w = h * aspect;
      const x = 25;
      const y = offsetY;
      offsetY += rHeight + 25;
      const mesh = new THREE.Mesh(
        planeGeo,
        new THREE.MeshBasicMaterial({
          depthTest: false,
          depthWrite: false,
          map: target.texture,
          side: THREE.DoubleSide,
        })
      );
      mesh.frustumCulled = false;
      mesh.scale.set(w, -h, 1);
      mesh.position.set(x, y + h, 0);
      orthoScene.add(mesh);
    });

    const autoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.render(orthoScene, orthoCam);
    renderer.autoClear = autoClear;
  };
}
