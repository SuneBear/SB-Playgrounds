import * as THREE from "three";
import * as MathUtil from "../../util/math";
import * as ShaderManager from "../../util/ShaderManager";

import {
  CylinderBufferGeometry,
  CylinderGeometry,
} from "../../util/ModCylinderGeometry";
import { mapRange } from "canvas-sketch-util/math";

export default function CharacterLegs() {
  const thickness = 0.75;
  const radiusBottom = 0.03 * thickness;
  const radiusTop = 0.15 * thickness;
  const height = 1; // needs to be one !! for the shader
  const radialSegments = 4;

  const geometry = new CylinderBufferGeometry({
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
    heightSegments: 16,
    openTop: false,
    openBottom: false,
  });

  geometry.translate(0, height / 2, 0);

  const material = ShaderManager.create({
    name: "legsShader",
    uniforms: {
      uTime: { value: 0 },
      uTiltAngle: { value: 0 },
      noiseScale: { value: 0 },
      uBendScale: { value: 0 },
    },
    vertexShader: /*glsl*/ `
      uniform float uTime;
      uniform float uBendScale;
      uniform float uTiltAngle;
      uniform float noiseScale;
      varying vec2 vUv;
      mat3 rotation3dX(float angle) {
      	float s = sin(angle);
      	float c = cos(angle);

      	return mat3(
      		1.0, 0.0, 0.0,
      		0.0, c, s,
      		0.0, -s, c
      	);
      }
      mat3 rotation3dZ(float angle) {
      	float s = sin(angle);
      	float c = cos(angle);

      	return mat3(
      		c, s, 0.0,
      		-s, c, 0.0,
      		0.0, 0.0, 1.0
      	);
      }

      void main() {

        vec4 worldPos = modelViewMatrix * vec4(position, 1.0);

        float p = sin( uTime * 0.5 + worldPos.x * 1. ) * noiseScale;
        float bendScale = sin(uTime) * 0.5 + 0.5;
        float bendTgt = .3 + p;
        float bendInfluence = 1. - pow(1.0 - position.y, 4.);
        float bending = bendTgt * bendInfluence * uBendScale;


        vec3 bendPos = position.xyz;
        bendPos.y -= 1.0;
        bendPos.x -= bending;
        bendPos = rotation3dZ(uTiltAngle) * bendPos;
        bendPos.y += 1.0;

        // vec3 bendPos = vec3(position.x - bending, position.y, position.z);



        gl_Position = projectionMatrix * modelViewMatrix * vec4(bendPos, 1.0);

        vUv = uv;
      }
    `,
    fragmentShader: /*glsl*/ `
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(0., 0.,0.,1.);
      }
    `,
  });
  const spaceBetweenLegs = 0.4;
  const meshLeft = new THREE.Mesh(geometry, material);
  const legRot = 0; // Math.PI * 0.2;
  const minShift = -0.2;
  const maxShift = -0.5;

  meshLeft.rotateY(Math.PI);
  meshLeft.rotateZ(legRot);
  meshLeft.position.z -= spaceBetweenLegs / 2;

  const meshRight = new THREE.Mesh(geometry, material);
  meshRight.rotateY(Math.PI);
  meshRight.rotateZ(legRot);
  meshRight.position.z += spaceBetweenLegs / 2;

  const anchor = new THREE.Group();
  const pivot = new THREE.Group();
  pivot.add(meshLeft);
  pivot.add(meshRight);
  anchor.add(pivot);

  anchor.scale.setScalar(1);

  const rotAxis = new THREE.Vector3(0, 1, 0);
  const zAxis = new THREE.Vector3(1, 0, 0);

  const meshes = [meshLeft, meshRight];
  return {
    group: anchor,
    update(dt, camera, lookAngle, speed) {
      meshes.forEach((mesh, idx) => {
        material.uniforms.uTime.value += dt;
        material.uniforms.noiseScale.value = mapRange(speed, 0, 0.7, 0.0, 0.2);
        material.uniforms.uTiltAngle.value = mapRange(
          speed,
          0,
          0.7,
          0.0,
          (30 * Math.PI) / 180
        );
        mesh.position.x = mapRange(speed, 0, 0.7, minShift, maxShift);
        material.uniforms.uBendScale.value = mapRange(speed, 0, 0.7, 0.1, 0.5);
      });
      anchor.setRotationFromAxisAngle(rotAxis, lookAngle);
    },
  };
}
