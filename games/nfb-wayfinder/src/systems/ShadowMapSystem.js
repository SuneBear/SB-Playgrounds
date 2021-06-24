import * as Tags from "../tags";
import * as THREE from "three";
import { createSpriteMaterial } from "../util/materials";
import { fastCopyCameraData } from "../util/three-util";
import * as ShaderManager from "../util/ShaderManager";

export default function ShadowMapSystem(world) {
  const shadowCasterView = world.view([Tags.Object3D, Tags.ShadowCaster]);
  const shadowCasterEvents = world.listen([Tags.Object3D, Tags.ShadowCaster]);
  const renderLayers = world.findTag(Tags.RenderLayers);

  // const MAP_WIDTH = 1024;
  // const renderTarget = new THREE.WebGLRenderTarget(MAP_WIDTH, MAP_WIDTH);
  // renderTarget.texture.generateMipmaps = false;
  // renderTarget.depthBuffer = false;
  // renderTarget.texture.minFilter = THREE.LinearFilter;
  // renderTarget.texture.magFilter = THREE.LinearFilter;
  // renderTarget.texture.wrapS = renderTarget.texture.wrapT =
  //   THREE.ClampToEdgeWrapping;
  // world.entity().add(Tags.DebugRenderTarget, { target: renderTarget });

  const clearColor = new THREE.Vector3(0, 0, 0);
  const tmpColor = new THREE.Vector3(0, 0, 0);
  const lightCamera = new THREE.PerspectiveCamera();
  // const lightCamera = new THREE.OrthographicCamera();

  const projection = new THREE.Matrix4();
  const view = new THREE.Matrix4();
  // world.tag(Tags.ShadowMapRenderTarget, {
  //   target: renderTarget,
  //   projection,
  // });

  const silhouetteMeshMaterial = ShaderManager.create({
    name: "ShadowSilhouetteMesh",
    vertexShader: /*glsl*/ `
      #include <common>
      uniform mat4 projection;
      uniform mat4 view;
      varying vec3 vCenterPos;
      varying vec3 vRealWorldPos;

      void main () {
        vec4 realWorldPos = modelMatrix * vec4(position.xyz, 1.0);
        vRealWorldPos = realWorldPos.xyz;
        vec3 camRightWorld = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);
        vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);
        vec3 camBack = cross(camUpWorld, camRightWorld);
        float xSkew = -60.0 * (PI/180.0);
        float ySkew = 0.0;

        // Create a transform that will skew our texture coords
        mat3 trans = mat3(
          1.0       , tan(xSkew), 0.0,
          tan(ySkew), 1.0,        0.0,
          0.0       , 0.0,        1.0
        );
        
        vec4 worldSpace = modelMatrix * vec4(position.xyz, 1.0);
        worldSpace.y *= 0.25;
        // worldSpace.xyz *= trans;
        worldSpace.xyz += realWorldPos.y * camRightWorld * -0.5;

        worldSpace.z += -0.25;
        worldSpace.x += -0.1;
        vec4 camSpace = view * worldSpace;

        vCenterPos = (modelMatrix * vec4(vec3(0.0), 1.0)).xyz;

        gl_Position = projectionMatrix * viewMatrix * worldSpace;
        // gl_Position.y += 0.4;
        // gl_Position.x -= 0.4;
      }
    `,
    fragmentShader: /*glsl*/ `
      uniform float opacity;
      uniform vec3 color;
      varying vec3 vCenterPos;
      varying vec3 vRealWorldPos;
      void main () {
        gl_FragColor = vec4(color, 1.0);

        // float falloff = 1.0 - clamp(pow(distance(vRealWorldPos, vCenterPos) / 1.0, 0.5), 0.0, 1.0);
        float falloff = 1.0 - clamp(pow(vRealWorldPos.y / 2.0, 1.0), 0.0, 1.0);
        float shadowOpacity = 0.25;
        gl_FragColor.rgb = mix(vec3(1.0), gl_FragColor.rgb, shadowOpacity * falloff);
      }
    `,
    transparent: true,
    // depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.MultiplyBlending,
    uniforms: {
      color: { value: new THREE.Color("#280422") },
      projection: { value: projection },
      view: { value: view },
    },
  });

  const camOffset = new THREE.Vector3().set(1, 1, 0.25).normalize();
  // const angle = THREE.MathUtils.degToRad(45 * -1);
  // const r = 1;
  // const camOffset = new THREE.Vector3(1, 1, 1);
  // camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);

  return function shadowMapSystem(dt) {
    // const renderer = world.findTag(Tags.Renderer);
    // const state = world.findTag(Tags.AppState);
    // const canvas = renderer.domElement;
    // const width = canvas.width;
    // const height = canvas.height;
    // if (canvas.width === 0 || canvas.height === 0) return;

    // let newAspect = width / height;
    // let aspect = renderTarget.width / renderTarget.height;
    // const rWidth = MAP_WIDTH;
    // const rHeight = Math.round(rWidth / newAspect);
    // if (renderTarget.width !== rWidth || renderTarget.height !== rHeight) {
    //   renderTarget.setSize(rWidth, rHeight);
    // }

    shadowCasterEvents.added.forEach((e) => {
      const sprite = e.get(Tags.ShadowCaster).sprite;
      const obj = e.get(Tags.Object3D);
      obj.traverse((child) => {
        if (child.layers) child.layers.enable(renderLayers.shadow);
        if (child.isMesh) {
          child.userData.__shadowEnabled = true;
          child.userData.__shadowMaterial = sprite
            ? child.material
            : silhouetteMeshMaterial;
        }
      });
    });

    const mainCamera = world.findTag(Tags.MainCamera);
    // const mainScene = world.findTag(Tags.MainScene);
    // mainCamera.getWorldPosition(lightCamera.position);
    // mainCamera.getWorldQuaternion(lightCamera.quaternion);

    const d = 20;
    const yoff = 0;
    // lightCamera.left = -d;
    // lightCamera.right = d;
    // lightCamera.top = d + yoff;
    // lightCamera.bottom = -d + yoff;
    // lightCamera.zoom = 1;
    // lightCamera.near = -50;
    // lightCamera.far = 50;
    fastCopyCameraData(mainCamera, lightCamera);
    // lightCamera.zoom = mainCamera.zoom - 0.25;
    const target = world.findTag(Tags.UserFollow).currentTarget;

    // lightCamera.position.copy(target);
    // lightCamera.position.addScaledVector(camOffset, 1);
    // lightCamera.translateX(0.5);
    // lightCamera.translateY(0.75);
    // lightCamera.lookAt(target);
    // lightCamera.fov = 45;

    // lightCamera.translateX(4);
    // lightCamera.translateY(-2);
    // lightCamera.lookAt(target);
    lightCamera.updateProjectionMatrix();
    lightCamera.updateMatrixWorld();

    projection.copy(lightCamera.projectionMatrix);
    view.copy(lightCamera.matrixWorldInverse);

    // const camRightWorld = new THREE.Vector3(
    //   view.elements[0],
    //   view.elements[4],
    //   view.elements[8]
    // );
    // lightCamera.position.addScaledVector(camRightWorld, 1);
    // lightCamera.updateMatrixWorld();
    // view.copy(lightCamera.matrixWorldInverse);

    // vec3 camRightWorld = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);
    // vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);

    // tmpColor.copy(renderer.getClearColor());
    // renderer.setRenderTarget(renderTarget);
    // renderer.setClearColor(clearColor);

    // lightCamera.layers.set(renderLayers.shadow);
    // shadowCasterView.forEach((e) => {
    //   const obj = e.get(Tags.Object3D);
    //   obj.traverse((child) => {
    //     if (child.isMesh) {
    //       child.userData.__material = child.material;
    //       child.userData.__frustumCulled = child.frustumCulled;
    //       // child.frustumCulled = false;
    //       child.material = child.userData.__shadowMaterial;
    //       if (child.material.uniforms && child.material.uniforms.silhouette) {
    //         child.material.uniforms.silhouette.value = true;
    //       }
    //     }
    //   });
    // });

    // renderer.render(mainScene, lightCamera);
    // renderer.setRenderTarget(null);
    // renderer.setClearColor(tmpColor);

    // shadowCasterView.forEach((e) => {
    //   const obj = e.get(Tags.Object3D);
    //   obj.traverse((child) => {
    //     if (child.isMesh) {
    //       child.material = child.userData.__material;
    //       child.frustumCulled = child.userData.__frustumCulled;
    //       if (child.material.uniforms && child.material.uniforms.silhouette) {
    //         child.material.uniforms.silhouette.value = false;
    //       }
    //     }
    //   });
    // });
  };
}

// function createShader
