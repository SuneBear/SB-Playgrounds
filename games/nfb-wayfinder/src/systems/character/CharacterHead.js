import * as THREE from "three";
import * as Tags from "../../tags";
import CapsuleBufferGeometry from "../../util/CapsuleBufferGeometry";
import * as MathUtil from "../../util/math";
import * as ShaderManager from "../../util/ShaderManager";

// import hatTexUrl from "../../assets/textures/hat_color.jpg";
// import hatModelURL from "../../assets/gltf/hat.gltf";

import { GLTFLoader } from "../../util/GLTFLoader";
import { TextureLoader } from "three";
import { mapRange } from "canvas-sketch-util/math";

const NOOP = () => {};
const texLoader = new TextureLoader();

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    texLoader.load(
      url,
      // ok
      (texture) => {
        resolve(texture);
      },
      // progress
      NOOP,
      // ko
      (evt) => {
        reject(evt);
      }
    );
  });
}

export default function CharacterHead() {
  const group = new THREE.Group();

  const radius = 0.24;
  const gap = 0.2;
  const irisRadius = radius * 0.55;
  const pupilRadius = irisRadius * 0.95;

  const noseScale = 0.1 / radius;
  const noseThick = 0.5;
  const noseLen = 1;
  const capsule = new THREE.Geometry().fromBufferGeometry(
    new CapsuleBufferGeometry(noseThick, noseThick, noseLen, 5, 5, 5, 5)
  );
  capsule.mergeVertices();
  capsule.rotateX(Math.PI / 2);
  capsule.rotateY(Math.PI / 2);
  capsule.scale(noseScale, noseScale, noseScale);
  capsule.translate(noseLen / 2 + 1 / 2 - noseLen / 8, 0, -noseThick);

  const basic = new THREE.MeshBasicMaterial({
    color: "black",
  });

  const circleGeom = new THREE.CircleGeometry(1, 16);
  circleGeom.merge(capsule, new THREE.Matrix4(), 1);

  const faceShader = ShaderManager.create({
    // wireframe: true,
    vertexShader: /*glsl*/ `
      varying vec2 vUv;
      void main () {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
      }
    `,
    name: "character-face",
    fragmentShader: /*glsl*/ `
      varying vec2 vUv;
      void main () {
        vec2 q = vec2(vUv - 0.5);
        float d = length(q);
        float circ = 1.0 - step(0.25, d);
        vec2 q2 = q - vec2(0.25, 0.0);
        float d2 = length(q2);
        circ *= step(0.25, d2);
        gl_FragColor = vec4(vec3(circ), 1.0);
      }
    `,
  });
  const noseMat = new THREE.MeshBasicMaterial({
    color: "black",
  });
  const circle = new THREE.Mesh(circleGeom, [faceShader, noseMat]);
  const iris = new THREE.Mesh(
    circleGeom,
    new THREE.MeshBasicMaterial({ color: "white", transparent: true })
  );
  const pupil = new THREE.Mesh(
    circleGeom,
    new THREE.MeshBasicMaterial({ color: "black", transparent: true })
  );
  circle.scale.setScalar(radius);
  iris.scale.setScalar(irisRadius);
  pupil.scale.setScalar(irisRadius);
  group.add(circle);
  // group.add(iris);
  // group.add(pupil);
  group.position.y = 1 + radius + gap;
  const dir = new THREE.Vector3();

  const nose = new THREE.Mesh(capsule, basic);
  const noseGroup = new THREE.Group();
  // noseGroup.add(nose);
  // nose.position.x =
  //   (noseLen / 2) * noseScale + radius - (noseLen / 4) * noseScale;
  // nose.scale.setScalar(noseScale);
  // group.add(noseGroup);

  const coneScale = 0.1;
  const coneHeight = 0.75;
  const cone = new THREE.CylinderBufferGeometry(
    0.025,
    radius * 1.15,
    coneHeight,
    16,
    1
  );
  cone.translate(0, coneHeight / 2, 0);

  const hatAnchor = new THREE.Group();
  const hatMaterial = ShaderManager.create({
    name: "character-hat",
    uniforms: {
      color: { value: new THREE.Color("#de4d26") },
      tMap: { value: new THREE.Texture() },
    },
    vertexShader: /*glsl*/ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPoisition;
    void main () {
      vUv = uv;
      vNormal = normalMatrix * normal;
      vec4 worldPos = modelMatrix * vec4(position.xyz, 1.0);
      vec4 vpos = viewMatrix * vec4(worldPos.xyz, 1.0);
      vViewPoisition = -vpos.xyz;
      gl_Position = projectionMatrix * vpos;
    }
  `,
    fragmentShader: /*glsl*/ `
    varying vec2 vUv;
    varying vec3 vViewPoisition;
    varying vec3 vNormal;
    uniform vec3 color;
    uniform sampler2D tMap;
    void main () {
      float rim = clamp(dot(normalize(vViewPoisition), vNormal), 0.0, 1.0);
      // rim = step(0.5, rim);

      vec3 cMap = texture2D(tMap, vUv).rgb;

      vec3 outColor = color;
      // outColor = mix(color * 0.85, color, rim);
      gl_FragColor = vec4(outColor, 1.0);
    }
  `,
  });
  const hat = new THREE.Mesh(cone, hatMaterial);

  // let hat = null

  // const manager = new THREE.LoadingManager();
  // const gltfLoader = new GLTFLoader(manager);
  // // const hatTex = await loadTexture(hatTexUrl)
  // // console.log(hatTex)
  // gltfLoader.load(hatModelURL, function (_gltf) {
  //   hat = _gltf.scene.children[0];
  //   hat.scale.setScalar(.265)
  //   // hat.position.x -= .12
  //   hat.position.y = .35
  //   hat.rotateY(Math.PI*.5)
  //   // hat.rotateZ(-Math.PI*.1)

  //   hat.material = hatMaterial

  //   loadTexture(hatTexUrl)
  //     .then( (tex) => {
  //       hatMaterial.uniforms.tMap.value = tex
  //     } )
  //   // // setup material
  //   // hat.scene.traverse((child) => {
  //   //   if (child.type == "Mesh") {
  //   //     console.log(child)
  //   //   }
  //   // });
  //   hatAnchor.add(hat);

  // });

  group.add(hatAnchor);
  hatAnchor.add(hat);

  const tmpMatA = new THREE.Matrix4();
  const tmpMatB = new THREE.Matrix4();

  return {
    group,
    getScarfAnchor(position) {
      group.localToWorld(position.set(0, -radius, 0));
      return position;
    },
    getHatTipPoint(position) {
      if (!hat) return hatAnchor.position;
      hat.localToWorld(position.set(0, coneHeight, 0));
      return position;
    },
    update(dt, camera, lookAngle, speed, up, right, forward) {
      dir.set(Math.cos(lookAngle), 0, Math.sin(lookAngle));
      circle.position.set(0, 0, 0).addScaledVector(dir, speed * 0.1);
      // hat.position.y += radius - 0.1;
      iris.position.copy(circle.position);
      iris.position.addScaledVector(forward, -irisRadius / 2);
      pupil.position.copy(iris.position);
      pupil.position.addScaledVector(forward, -irisRadius);
      const side = dir.dot(right) < 0 ? -1 : 1;
      pupil.position.addScaledVector(right, irisRadius * side);
      circle.quaternion.copy(camera.quaternion);
      circle.scale.x = radius * side;
      iris.quaternion.copy(circle.quaternion);
      pupil.quaternion.copy(circle.quaternion);

      // hat.position.copy(circle.position);
      const deg = MathUtil.lerp(5, 70, speed);
      const mat = tmpMatA.identity();
      mat.multiply(
        tmpMatB.makeTranslation(
          circle.position.x,
          circle.position.y + 0.0,
          circle.position.z
        )
      );
      mat.multiply(tmpMatB.makeRotationY(lookAngle));
      // mat.multiply(tmpMatB.makeTranslation(0, radius, 0));
      mat.multiply(tmpMatB.makeRotationZ(MathUtil.degToRad(deg)));
      mat.multiply(tmpMatB.makeTranslation(0, 0.075, 0));

      hatAnchor.matrixAutoUpdate = false;
      hatAnchor.matrix.identity();
      hatAnchor.applyMatrix4(mat);
      hatAnchor.matrixAutoUpdate = true;
      // if (hat) {
      //   // hat.position.x = mapRange(speed, 0, .7, -.12, -.08)
      //   hat.position.y = mapRange(speed, 0, .7, .35, .27)
      // }
      // hatAnchor.rotation.y = lookAngle;
      // hatAnchor.rotation.z = MathUtil.degToRad(deg);

      // const noff =
      //   (noseLen / 2) * noseScale + radius - (noseLen / 4) * noseScale;
      // nose.position.x = 0 + noff * side;
      // nose.position.addScaledVector(forward, -radius / 4);
      // noseGroup.rotation.y = lookAngle;
    },
  };
}
