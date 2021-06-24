import * as THREE from "three";
import * as Tags from "../tags";
import { addPreRenderCallback } from "../util/addFrameTasks";

export default function EnvironmentGroundRenderTextureSystem(world) {
  const renderTarget = new THREE.WebGLRenderTarget(16, 16);
  const RTSIZE = 128;
  const camera = new THREE.PerspectiveCamera();
  const mainCamera = world.findTag(Tags.MainCamera);
  const mainScene = world.findTag(Tags.MainScene);
  const groundPlaneTag = world.tag(Tags.GroundPlaneView, {
    camera: mainCamera,
    projectionMatrix: new THREE.Matrix4(),
    target: renderTarget,
  });

  const groundView = world.findTag(Tags.GroundPlaneView);
  const renderLayers = world.findTag(Tags.RenderLayers);

  const GROUND_CAMERA_Y_OFFSET = 0;

  world
    .entity()
    .add(Tags.DebugRenderTarget, { visible: false, target: renderTarget });
  // world.entity().add(Tags.Object3D, camera);
  // camera.name = "groundrendercam";

  renderTarget.depthBuffer = false;
  renderTarget.texture.generateMipmaps = false;
  renderTarget.texture.minFilter = THREE.LinearFilter;
  renderTarget.texture.magFilter = THREE.LinearFilter;
  renderTarget.texture.wrapS = renderTarget.texture.wrapT =
    THREE.ClampToEdgeWrapping;

  // const group = new THREE.Group();
  // world.entity().add(Tags.Object3D, group);
  // group.name = "groundrendergroup";

  // single mesh
  // const planeGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
  // const planeMaterial = new THREE.MeshBasicMaterial({
  //   // map: grassTex,
  //   color: new THREE.Color("green"),
  // });
  // planeGeometry.rotateX(-Math.PI / 2);
  // const floor = new THREE.Mesh(planeGeometry, planeMaterial);
  // group.add(floor);
  // world.entity().add(Tags.GroundPlaneLayer, floor);
  // const tileSize = 20;
  // floor.scale.set(tileSize, 1, tileSize);

  const items = world.view(Tags.GroundPlaneLayer);
  const clearColor = new THREE.Color(0, 0, 0);
  const tmpColor = new THREE.Color();
  const renderer = world.findTag(Tags.Renderer);
  const state = world.findTag(Tags.AppState);

  addPreRenderCallback(submitRender);

  return function envGroundRenderTexSystem(dt) {
    const canvas = renderer.domElement;
    const width = canvas.width;
    const height = canvas.height;
    if (canvas.width === 0 || canvas.height === 0) return;

    let newAspect = width / height;
    let aspect = renderTarget.width / renderTarget.height;
    const rWidth = RTSIZE;
    const rHeight = Math.round(rWidth / newAspect);
    if (renderTarget.width !== rWidth || renderTarget.height !== rHeight) {
      renderTarget.setSize(rWidth, rHeight);
    }

    // quickCopy(mainCamera, camera);
    // camera.layers.set(renderLayers.ground);
    // camera.zoom = 1;

    // const padding = 0;
    // camera.setViewOffset(
    //   width,
    //   height,
    //   -padding,
    //   -padding,
    //   width + padding,
    //   height + padding
    // );

    // camera.zoom = 1;

    // already in setViewOffset
    // camera.updateProjectionMatrix();
    // camera.updateMatrixWorld();

    // items.forEach((e) => {
    //   const obj = e.get(Tags.GroundPlaneLayer);
    //   if (obj) {
    //     obj.layers.set(renderLayers.ground);
    //     // obj.updateMatrixWorld();
    //   }
    // });

    // submitRender();
  };

  function submitRender() {
    // mainCamera.updateMatrixWorld();
    // mainCamera.updateProjectionMatrix();
    groundPlaneTag.projectionMatrix.copy(mainCamera.projectionMatrix);
    mainCamera.layers.disableAll();
    mainCamera.layers.enable(renderLayers.ground);
    mainCamera.layers.disable(renderLayers.groundDepth);
    tmpColor.copy(renderer.getClearColor());
    renderer.setRenderTarget(renderTarget);
    renderer.setClearColor(clearColor);
    renderer.clear();
    renderer.render(mainScene, mainCamera);
    renderer.setRenderTarget(null);
    renderer.setClearColor(tmpColor);
    mainCamera.layers.enableAll();
  }

  function quickCopy(cameraSrc, cameraDst) {
    THREE.Camera.prototype.copy.call(cameraDst, cameraSrc);
    cameraDst.fov = cameraSrc.fov;
    cameraDst.zoom = cameraSrc.zoom;
    cameraDst.near = cameraSrc.near;
    cameraDst.far = cameraSrc.far;
    cameraDst.focus = cameraSrc.focus;
    cameraDst.aspect = cameraSrc.aspect;
    cameraDst.filmGauge = cameraSrc.filmGauge;
    cameraDst.filmOffset = cameraSrc.filmOffset;
  }
}
