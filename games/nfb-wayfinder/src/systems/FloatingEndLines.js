import * as Tags from "../tags";
import * as THREE from "three";
import Random from "../util/Random";
import Line3D from "./writing/Line3D";
import { tweenTo } from "./AnimationSystem";
import animate from "../util/ease-animate";

export default function FloatingEndLines(world) {
  const random = Random();
  const event = world.listen(Tags.FinalBiomeResolutionLines);
  const lines = world.view(Tags.FloatingEndLine);

  return function FloatingEndLinesSys(dt) {
    if (event.added.length > 0) {
      start();
    }

    lines.forEach((e) => {
      const d = e.get(Tags.FloatingEndLine);

      d.time += dt;
      const curTime = Math.max(0, d.time - d.delay);
      const anim = animate(
        d.time,
        d.duration,
        d.delay,
        d.animateDuration,
        d.ease
      );
      const mesh = e.get(Tags.Object3D);
      mesh.material.uniforms.thickness.value =
        mesh.userData._lineThickness * anim;
      mesh.material.uniforms.opacity.value = anim;
      mesh.position.y += dt * d.speed;
      // mesh.material.uniforms.opacity.value = anim;
      if (curTime >= d.duration) {
        // kill
        e.kill();
      }
    });
  };

  function start() {
    const lines = Array(50)
      .fill()
      .map(() => {
        const thickness = 1;
        const mesh = new Line3D(world, {
          thickness,
        });

        const [x, z] = random.onCircle(random.range(2.5, 15));
        mesh.userData._lineThickness = thickness;
        mesh.position.x = x;
        mesh.position.y = random.range(2, 10);
        mesh.position.z = z;
        // mesh.material.uniforms.drawing.value = true;
        // mesh.material.uniforms.draw.value = 0;
        mesh.updatePath(
          [
            [0, -1, 0],
            [0, 0, 0],
            [0, 1, 0],
          ],
          false,
          false
        );

        mesh.userData._entity = world
          .entity()
          .add(Tags.Object3D, mesh)
          .add(Tags.FloatingEndLine);
        const d = mesh.userData._entity.get(Tags.FloatingEndLine);

        d.duration = random.range(2, 3.5);
        d.delay = 2 + random.range(0, 2);
        d.animateDuration = 0.5;
        d.speed = random.range(0.5, 2);
        // const group = new THREE.Mesh(
        //   new THREE.BoxGeometry(1, 1, 1),
        //   new THREE.MeshBasicMaterial({ color: "red" })
        // );
        // group.position.copy(mesh.position);
        // mesh.userData._entity = world.entity().add(Tags.Object3D, group);

        return mesh;
      });
  }
}
