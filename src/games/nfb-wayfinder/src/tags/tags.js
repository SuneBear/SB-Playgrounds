import * as THREE from "three";

import {
  ViewLayer,
  ViewLayerNeedsUpdate,
  Config,
  MarkConfigChanged,
} from "../alec-svelte";

// re-export some Svelte-specific tags
export { ViewLayer, ViewLayerNeedsUpdate, Config, MarkConfigChanged };

import {
  copyInstance,
  cloneInstance,
  Types as BaseTypes,
  Data,
  Value,
  Tag,
} from "../alec";

export { Tag, Data, Value };

export const Types = {
  ...BaseTypes,
  Vector2: (x = 0, y = 0) => ({
    initial: new THREE.Vector2(x, y),
    copy: copyInstance,
    clone: cloneInstance,
  }),
  Vector3: (x = 0, y = 0, z = 0) => ({
    initial: new THREE.Vector3(x, y, z),
    copy: copyInstance,
    clone: cloneInstance,
  }),
  Vector4: (x = 0, y = 0, z = 0, w = 0) => ({
    initial: new THREE.Vector4(x, y, z, w),
    copy: copyInstance,
    clone: cloneInstance,
  }),
  Quaternion: (x = 0, y = 0, z = 0, w = 0) => ({
    initial: new THREE.Quaternion(x, y, z, w),
    copy: copyInstance,
    clone: cloneInstance,
  }),
  Euler: (x = 0, y = 0, z = 0, order = "XYZ") => ({
    initial: new THREE.Euler(x, y, z, order),
    copy: copyInstance,
    clone: cloneInstance,
  }),
  Color: (r = 0, g = 0, b = 0) => ({
    initial: new THREE.Color(r, g, b),
    copy: copyInstance,
    clone: cloneInstance,
  }),
};

export class Object3D extends Value {
  static edit = { visible: false };
}

export class Object3DKeepAlive extends Tag {}
export class MainCamera extends Value {}
export class MainScene extends Value {}
export class Canvas extends Value {}
export class Renderer extends Value {}

export class InputGestureEmitter extends Value {}
export class TriggerMovementGesture extends Value {}

export class InputState extends Data {
  static data = {
    multitouch: Types.Ref(null),
    position: Types.Vector2(),
    positionNormalized: Types.Vector2(),
    // dragging: false,
    // inside: false,
    interacted: false,
    pressed: false,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
  };
}

export class UserInitiatedGesture extends Tag {}

export class AppState extends Data {
  static data = {
    ready: Types.Ref(false),
    running: Types.Ref(true),
    rendering: Types.Ref(true),
    pixelRatio: Types.Ref(1),
    width: Types.Ref(1),
    height: Types.Ref(1),
    canvasWidth: Types.Ref(1),
    canvasHeight: Types.Ref(1),
  };
}

// In some special cases, such as starting audio,
// we require a 'tap' event. In these cases you
// can get this handler from the world and assign
// events during system init
// export class InputEmitter extends Value {
//   static edit = { visible: false };
// }

export class UserCharacter extends Data {
  static data = {
    direction: Types.Vector3(),
    position: Types.Vector3(),
    target: Types.Vector3(),
    velocity: Types.Vector3(),
    yOffset: Types.Ref(0),

    magicalEffect: Types.Ref(0),
    glowIntensity: Types.Ref(1),
    glowIntensity2: Types.Ref(1),
    capeSpeed: Types.Ref(1),
  };
}

export class UserTarget extends Data {
  static data = {
    direction: Types.Vector3(),
    position: Types.Vector3(),
    forceApplied: false,
    speedAlpha: 0,
    totalBoost: 0,
    boostAlpha: 0,
    totalSpeedAlpha: 0,
    inputPositionOnPlane: Types.Vector3(),
    inputHitPlane: false,
  };
}

export class DebugState extends Data {
  static data = { mouseOnPlaneHitPoint: Types.Vector3() };
}

export class UserZoom extends Data {
  static data = {
    allowMouseZoom: false,
    distance: 15,
    defaultDistance: 15,
    minDistance: 2,
    maxDistance: 50,
    currentWheelOffset: 0,
    zoomPowFactor: 1.25,
    zoomPowTarget: 5,
    zoomPixelsToWorld: 0.001,
  };
}

export class UserFollow extends Data {
  static data = {
    currentTarget: Types.Vector3(),
    currentPosition: Types.Vector3(),
    currentDistance: 12,
    distanceSpring: 5,
    minSpeedZoomDistance: 0,
    maxSpeedZoomDistance: 1,
    speedZoomDistance: 0,
    speedZoomSpringIn: 0.25,
    speedZoomSpringOut: 4,
    shake: 0,
    shakeSpeed: 1,
    shakeTime: 0,
  };
}

export class CameraStopUserMovement extends Tag {}
export class ModalStoppingUserMovement extends Tag {}
export class IsGameUIActive extends Tag {}

export class EnvironmentMap extends Data {
  static data = {
    image: null,
  };
}

export class ShaderUniformTime extends Data {
  static data = {
    uniform: Types.Ref(),
    elapsed: Types.Ref(0),
  };
  static edit = { visible: false };
}

export class ShaderUniformResolution extends Data {
  static data = {
    uniform: Types.Ref(),
  };
  static edit = { visible: false };
}

export class ShaderUniformUserTargetPosition extends Data {
  static data = {
    uniform: Types.Ref(),
  };
  static edit = { visible: false };
}

export class ShaderUniformUserCharacterPosition extends Data {
  static data = {
    uniform: Types.Ref(),
  };
  static edit = { visible: false };
}

export class MovementBoost extends Data {
  static data = {
    frictionPower: Types.Ref(1),
    value: Types.Ref(2),
    duration: Types.Ref(4),
    elapsed: Types.Ref(0),
  };
}

export class Sequence {
  static data = {
    curve: Types.Ref(),
    stanza: Types.Ref(0),
  };
}

export class TargetKeyTween extends Data {
  static data = {
    pauseOnModal: Types.Ref(false),
    started: Types.Ref(false),
    duration: Types.Ref(1),
    elapsed: Types.Ref(0),
    ease: Types.Ref("linear"),
    delay: Types.Ref(0),
    from: Types.Ref(0),
    to: Types.Ref(1),
    active: Types.Ref(true),
    finished: Types.Ref(false),
    killEntityOnFinish: Types.Ref(false),
    assignFromOnStart: Types.Ref(false),
    target: Types.Ref(null),
    key: Types.Ref(""),

    // kinda hate ECS for animation !
    // must be a better way than callbacks
    callbackOnStart: Types.Ref(null),
    callbackOnFinish: Types.Ref(null),
  };
}

export class TweenCopyTargetKeyToVectorScalar extends Value {}

// export class StartTween extends Tag {}

// export class CopyTweenValueToVector extends Value {}

export class TriggerPoemComplete extends Value {
  static value = Types.Ref(null);
}

export class TriggerDelayedPoemOverlay extends Data {
  static data = {
    root: Types.Ref(null),
    delay: Types.Ref(1),
    elapsed: Types.Ref(0),
    spawned: Types.Ref(false),
  };
}

export class PoemLineTriggerActivated extends Tag {}
export class PoemLineActivated extends Data {
  static data = {
    root: Types.Ref(null),
    node: Types.Ref(null),
  };
}

export class UserInPoemArea extends Tag {}
export class UserCompletingPoem extends Tag {}

export class CinematicCameraMoment extends Data {
  static data = {
    copyStart: Types.Ref(false),
    target: Types.Vector3(),
  };
}

export class MoveUserTo extends Data {
  static data = {
    target: Types.Vector3(),
  };
}

export class TextSprite3D extends Data {
  static data = {
    text: Types.Ref(""),
    color: Types.Color(1, 1, 1),
    culling: Types.Ref(true),
    depth: Types.Ref(true),
    x: Types.Ref(0),
    y: Types.Ref(0),
    sprite: Types.Ref(null),
    opacity: Types.Ref(1),
    fontStyle: Types.Ref("normal"),
    fontSize: Types.Ref(14),
    parent: Types.Ref(null),
  };
}

export class EnvironmentUnderPlayerState extends Data {
  static data = {
    lake: Types.Ref(null),
    water: Types.Ref(false),
  };
}

export class GroundPhysicsBody extends Data {
  static data = {
    position: Types.Vector3(0, 0, 0),
    velocity: Types.Vector3(0, 0, 0),
    speed: Types.Ref(1),
    scale: Types.Ref(1),
    timeScale: Types.Ref(1),
    currentRotation: Types.Quaternion(0, 0, 0, 0),
    spinRotation: Types.Quaternion(0, 0, 0, 0),
    targetRotation: Types.Quaternion(0, 0, 0, 0),
    flatRotation: Types.Quaternion(0, 0, 0, 0),
    rotationAxis: Types.Vector3(0, 0, 0),
    rotationSpeed: Types.Ref(1),
    rotationAngleOffset: Types.Ref(0),
  };
}

export class EnvironmentState extends Data {
  static data = {
    name: Types.Ref(""),
    grassInstanceCount: Types.Ref(1),
    grassScale: Types.Ref(1),
    grassTipFactor: Types.Ref(1),
    haikusTotal: Types.Ref(5),
    waterMeshes: Types.Array([]),
    tokens: Types.Array([]),
    solved: Types.Ref(0),
    group: Types.Ref(null),
    lakes: Types.Ref(null),
    data: Types.Ref(null),
    grid: Types.Ref(null),
    samples: Types.Ref(null),
    waterSamples: Types.Ref(null),
    waterColors: Types.Ref(null),
    seed: Types.Ref(null),
    waterId: Types.Ref(null),
    hasLakes: Types.Ref(null),
    idleViewPoint: Types.Vector3(),
    cells: Types.Ref(null),
    colors: Types.Ref(null),
    textures: Types.Array([]),
    patches: Types.Array([]),
    waterMap: Types.Ref(null),
    overlayOpacity: Types.Ref(1),
  };

  static edit = {};
}

export class ActiveEnvironmentState extends Tag {}

export class EnvironmentCell extends Data {
  static data = {
    environmentState: Types.Ref(null),
    cell: Types.Ref(null),
    random: Types.Ref(null),
    children: Types.Array([]),
  };
}

export class GroundPatchInstance extends Value {
  static value = null;
}

export class GroundSpawningLeaf extends Tag {}
export class GroundSpawningGrass extends Tag {}
export class GroundSpawningDot extends Tag {}

export class GroundPlaneView extends Data {
  static data = {
    camera: null,
    target: null,
    projectionMatrix: null,
    layer: 5,
  };
}

export class GrassPlaneView extends Data {
  static data = {
    layer: Types.Ref(7),
  };
}

export class GroundPlaneLayer extends Value {
  static value = null;
}

export class GroundAssetCellSample extends Data {
  static data = {
    x: Types.Ref(0),
    y: Types.Ref(0),
    random: Types.Ref(null),
    cell: Types.Ref(null),
    type: Types.Ref(null),
    children: Types.Array([]),
  };
}

export class GroundAssetCellSampleInstance extends Data {
  static data = {
    worldIndex: Types.Ref(0),
    feature: Types.Ref(false),
    data: Types.Ref(null),
  };
}

export class GroundAssetCellSampleWithFeature extends Value {}

export class GroundAssetCellSampleToGrow extends Tag {}
export class GroundAssetCellSampleToHide extends Tag {}

export class GroundAssetSpriteType extends Value {}

export class SpriteBlobShadow extends Data {
  static data = {
    size: Types.Ref(1),
    scale: Types.Ref(1),
    offsetX: Types.Ref(0),
    offsetY: Types.Ref(0),
    mesh: Types.Ref(null),
  };
}

export class SpriteBlobShadowView extends Data {
  static data = {
    target: Types.Ref(null),
    layer: Types.Ref(6),
  };
}

export class PoemLine extends Data {
  static data = {
    node: Types.Ref(null),
    root: Types.Ref(null),
    nearby: Types.Ref(false),
    boundingCenter: Types.Array([]),
    boundingRadius: Types.Ref(1),
    curve: Types.Ref(null),
    triggers: Types.Array([]),
    activated: Types.Ref(false),
    yOffset: Types.Ref(0.5),
  };
}

export class PoemLineTrigger extends Data {
  static data = {
    root: Types.Ref(null),
    ready: Types.Ref(false),
    activated: Types.Ref(false),
    progress: Types.Ref(0),
    fragment: Types.Ref(""),
    previous: Types.Ref(null),
    next: Types.Ref(null),
    parent: Types.Ref(null),
    position: Types.Vector3(),
  };
}

export class GroundMeshWithPoem extends Data {
  static data = {
    mesh: Types.Ref(null),
    id: Types.Ref(""),
  };
}

export class PoemLineWithinRange extends Tag {}

// export class KillEntityAfterTweens extends Tag {}

// export class Complete extends Value {}

// export class TriggerPoemFragment extends Value {}

export class TickerTimeline extends Value {}
export class PoemLineMesh extends Data {
  static data = {
    mesh: Types.Ref(null),
    timeline: Types.Ref(null),
    parent: Types.Ref(null),
  };
}

// export class TriggerPoemLineHide extends Tag {}

export class GroundPoemFragmentSprite extends Tag {}
export class PoemTextFragment extends Data {
  static data = {
    root: Types.Ref(null),
    mesh: Types.Ref(null),
  };
}

export class PoemRemaining extends Value {}
export class CanShowCompass extends Tag {}

export class NearestEnvironmentCell extends Value {}

export class HasShownElementalOverlay extends Tag {}

// export class FadeFromBlack extends Tag {}
export class HasLoaded extends Tag {}
export class IntroLayer extends Tag {}

export class PoemWriting extends Tag {}
export class PoemInProgress extends Tag {}
export class PoemLineText extends Tag {}
export class PoemFinishing extends Data {
  static data = {
    elapsed: Types.Ref(0),
    delay: Types.Ref(3),
  };
}

export class PoemLineVertex extends Data {
  static data = {
    position: Types.Vector3(),
  };
}

export class GroundSpawnPosition2D extends Value {
  static value = Types.Array([]);
}
export class GroundSpawnTokenTag extends Tag {}
export class GroundSpawnDecayTag extends Tag {}

export class UserWritingState extends Data {
  static data = {
    writing: Types.Ref(false),
    force: Types.Ref(false),
    ignore: Types.Ref(false),
  };
}

export class KillWritingIgnore extends Data {
  static data = {
    elapsed: Types.Ref(0),
    duration: Types.Ref(0.5),
  };
}

export class UserLine extends Data {
  static data = {
    distance: Types.Ref(0),
    writing: Types.Ref(false),
    changed: Types.Ref(false),
    active: Types.Ref(false),
    line: Types.Ref(null),
    elapsed: Types.Ref(0),
    duration: Types.Ref(1),
  };
}

export class GroundToken extends Data {
  static data = {
    type: Types.Ref(""),
    position: Types.Vector3(0, 0, 0),
    collected: Types.Ref(false),
  };
}

export class CollectedToken extends Data {
  static data = {
    type: Types.Ref(""),
    stanza: Types.Ref(null),
    stanzaIndex: Types.Ref(0),
    x: Types.Ref(0),
    z: Types.Ref(0),
    // writing: Types.Ref(false),
    // idleTime: Types.Ref(0),
    // killAfterIdleDuration: Types.Ref(2),
    // linkedEntity: Types.Ref(null),
  };
}

// export class CurrentWritingToken extends Data {
//   static data = {
//     stanza: Types.Ref(0),
//     fragments: Types.Ref(null),
//     text: Types.Ref(""),
//     tokenType: Types.Ref(""),
//     token: Types.Ref(null),
//     index: Types.Ref(0),
//   };
// }

// export class CurrentWritingTokenFading extends Data {
//   static data = {
//     ref: Types.Ref(null),
//     children: Types.Array([]),
//     elapsed: Types.Ref(0),
//     duration: Types.Ref(2),
//   };
// }

// export class FinishedStanza extends Data {
//   static data = {
//     text: Types.Ref(""),
//     stanza: Types.Ref(0),
//     token: Types.Ref(""),
//   };
// }

export class FinishedPoem extends Data {
  static data = {
    tokens: Types.Array([]),
    lines: Types.Array([]),
  };
}

export class HaikuAddingToInventory extends Data {
  static data = {
    time: Types.Ref(0),
    delay: Types.Ref(0.25),
  };
}
export class HaikuInInventory extends Tag {}
export class WaitingForTokenPaper extends Tag {}

// export class FinishedPoemHasElemental extends Tag {}

// export class Portal extends Data {
//   static data = {
//     visited: Types.Ref(false),
//     position: Types.Vector3(),
//     textEntity: Types.Ref(null),
//     tween: Types.Ref(1),
//     symbol: Types.Ref(null),
//     showing: Types.Ref(false),
//     opening: Types.Ref(null),
//     index: Types.Ref(0),
//     open: Types.Ref(false),
//     discovered: Types.Ref(false), // if you've captured it
//     active: Types.Ref(false), // if you are currently in that biome
//   };
// }

// export class PortalLine extends Data {
//   static data = {
//     line: Types.Ref(null),
//     from: Types.Ref(null),
//     to: Types.Ref(null),
//   };
// }

export class ActiveWorldIndex extends Value {
  static value = Types.Ref(0);
}

export class WorldTweens extends Value {
  static value = Types.Array([]);
}

export class WorldDecayTweens extends Value {
  static value = Types.Array([]);
}

export class WaitingToVisitFinalPortal extends Tag {}
export class HasVisitedFinalPortal extends Tag {}

export class SolvingDecayArea extends Data {
  static data = {
    index: Types.Ref(0),
    tween: Types.Ref(0),
  };
}

export class AudioMeta extends Data {
  static data = {
    names: Types.Array([]),
    paths: Types.Array([]),
  };
}

export class GroundFogRenderTarget extends Data {
  static data = {
    projection: Types.Ref(null),
    target: Types.Ref(null),
  };
}

export class GroundDataRenderTarget extends Data {
  static data = {
    projection: Types.Ref(null),
    view: Types.Ref(null),
    target: Types.Ref(null),
  };
}

export class UserFirstVisitedWorldIndex extends Value {
  static value = Types.Ref(0);
}

export class DebugRenderTarget extends Data {
  static data = {
    visible: Types.Ref(true),
    target: Types.Ref(null),
  };
}

export class GroundDataParticle extends Data {
  static value = Types.Ref(null);
}

export class BlockUserWrite extends Tag {}
export class WaitingForUserWrite extends Tag {}

export class ShowUserWriteHint extends Tag {}
export class ShowUserCollectHint extends Tag {}
export class ShowUserTokenInventory extends Tag {}

// export class HintSpaceBar extends Tag {}
export class UserHitAudioTrigger extends Data {
  static data = {
    type: Types.Ref(""),
  };
}
export class WillTriggerAudio extends Tag {}

export class GroundAsset extends Data {
  static data = {
    x: Types.Ref(0),
    z: Types.Ref(0),
    cellEntity: Types.Ref(null),
  };
}

export class GroundAssetData extends Data {
  static data = {
    instance: Types.Ref(null),
    key: Types.Ref(""),
    audio: Types.Ref(false),
    type: Types.Ref("sprite"),
    useMapDiscard: Types.Ref(false),
    ignoreFlip: Types.Ref(false),
    // height: Types.Ref(null),
    rotation: Types.Ref(0),
    // varianceMean: Types.Ref(null),
    // varianceStd: Types.Ref(null),
    // minSize: Types.Ref(null),
    // maxSize: Types.Ref(null),
    flip: Types.Ref(false),
    scale: Types.Vector3(1, 1, 1),
    sizeFactor: Types.Ref(1),
    variance: Types.Ref(0),
  };
}

export class MainCameraFrustum extends Value {}

export class GroundAssetInsideFrustum extends Data {}

export class GroundAsset3DAsync extends Data {
  static data = {
    url: Types.Ref(""),
  };
}

export class PostProcessEnabled extends Value {
  static value = Types.Ref(true);
}

export class Atmospherics extends Data {
  static data = {
    camera: Types.Ref(null),
    scene: Types.Ref(null),
  };
}

export class GroundMeshEditableData extends Data {
  static data = {
    uvRepeatScale: Types.Ref(1),
    overrideMap: Types.Ref(null),
    overrideColor: Types.Ref("#ffffff"),
    useOverrideMap: Types.Ref(false),
    useOverrideColor: Types.Ref(false),
    useOverrideWater: Types.Ref(false),
    overrideWater: Types.Ref(null),
    useOverrideWaterColor: Types.Ref(false),
    overrideWaterColorA: Types.Ref("#0000ff"),
    overrideWaterColorB: Types.Ref("#0000ff"),
    useCustomLUT: Types.Ref(false),
    lutMap: Types.Ref(null),
  };
}

export class GrassEditableData extends Data {
  static data = {
    useCustomGrass: Types.Ref(false),
    customGrassMap: Types.Ref(null),
    grassScale: Types.Ref(1),
  };
}

export class RenderLayers extends Data {
  static data = {
    groundDepth: Types.Ref(4),
    ground: Types.Ref(5),
    water: Types.Ref(6),
    grass: Types.Ref(10),
    // elements: Types.Ref(12),
    shadow: Types.Ref(15),
    atmospherics: Types.Ref(25),
  };
}

// export class RenderPass extends Data {
//   static data = {
//     ground: Types.Ref(null),
//   };
// }

// export class AddToRenderScene extends Value {
//   static value = Types.Ref(null);
// }

export class ShadowCaster extends Data {
  static data = {
    sprite: Types.Ref(false),
  };
}

export class BloomObject extends Data {
  static data = {
    color: Types.Color(1, 1, 1),
  };
}

export class AssetCache extends Value {}

export class GLTFRefAsset extends Data {
  static data = {
    position: Types.Array(),
    boundsMin: Types.Vector3(),
    boundsMax: Types.Vector3(),
    boundsSet: Types.Ref(false),
    name: Types.Ref(""),
    biome: Types.Ref(""),
    group: Types.Ref(null),
    promise: Types.Ref(null),
  };
}

export class GLTFRefAssetLoaded extends Data {
  static data = {
    mesh: Types.Ref(null),
  };
}
export class IsInFrustum extends Tag {}

export class TestLoadRef extends Data {
  static data = {
    position: Types.Array(),
    name: Types.Ref(""),
  };
}

export class GameUIStore extends Value {}

export class DirectUserToOrigin extends Tag {}
export class WaitingForBiomeResolution extends Tag {}
export class ShowBiomeResolution extends Tag {}
export class FinalBiomeResolution extends Tag {}
export class FinalBiomeResolutionLines extends Tag {}
export class EndGameState extends Tag {}
export class TransitionToNextBiome extends Tag {}
export class SafeToSwapBiomes extends Tag {}

export class BoxHelper extends Data {
  static data = {
    entity: Types.Ref(null),
    box: Types.Ref(null),
  };
}

export class GroundAssetToken extends Data {
  static data = {
    type: Types.Ref(""),
  };
}

export class TokensDiscoveredSet extends Value {}

// collecting a token makes a line drawn onto the world
export class WrittenStanzaLine extends Data {
  static data = {
    started: Types.Ref(false), // only start writing once we move away from token
    elapsed: Types.Ref(0),
    startDelay: Types.Ref(0.33),
    text: Types.Ref(""),
    line: Types.Array([]), // array of Line3D data
    type: Types.Ref(""), // token type
    inputs: Types.Array([]), // array of text chunks
    fragments: Types.Array([]), // array of output word fragments
    originPosition2D: Types.Vector2(), // where line originated from (token pos)
    lastPosition2D: Types.Vector2(), // last user pos
    active: Types.Ref(false), // whether user is drawing this out
    initial: Types.Ref(true), // only true on first place
    distance: Types.Ref(0), // total distance of line so far
    changed: Types.Ref(false), // whether Line3D needs updating
    children: Types.Array([]), // array of child text entities
  };
}

export class WrittenStanzaLineActive extends Tag {}

export class StanzaLineSpawningAsset extends Data {
  static data = {
    x: Types.Ref(0),
    z: Types.Ref(0),
    biome: Types.Ref(""),
  };
}

export class SpawnedFlora extends Data {
  static data = {
    height: Types.Ref(1),
    time: Types.Ref(0),
    aspect: Types.Ref(1),
    spawnTime: Types.Ref(0),
    delay: Types.Ref(0),
    duration: Types.Ref(5),
    animateDuration: Types.Ref(0.75),
  };
}

export class SpriteAnimation extends Data {
  static data = {
    key: Types.Ref(""),
    delay: Types.Ref(0),
    playing: Types.Ref(false),
    finished: Types.Ref(false),
    currentLoop: Types.Ref(0),
    looping: Types.Ref(false),
    // key: Types.Ref(""),
    elapsed: Types.Ref(0),
    // frames: Types.Array([]),
    frame: Types.Ref(0),
    sheet: Types.Ref(null),
    lastFrame: Types.Ref(null),
    dirty: Types.Ref(true),
    fixSpriteAspect: Types.Ref(true),
    speed: Types.Ref(1),

    loopStart: Types.Ref(null),
    loopEnd: Types.Ref(null),

    onLoopEnd: Types.Ref(null),
  };

  reset() {
    super.reset();
    this.playing = false;
    this.delay = 0;
    this.elapsed = 0;
    this.finished = false;
    this.frame = 0;
    this.dirty = true;
    this.lastFrame = null;
    this.currentLoop = 0;
    if (this.loopStart != null && this.looping) this.frame = this.loopStart;
  }

  start() {
    this.playing = true;
    this.elapsed = 0;
    this.frame = 0;
    this.finished = false;
    this.delay = 0;
    this.dirty = true;
    this.lastFrame = null;
    this.currentLoop = 0;
    if (this.loopStart != null && this.looping) this.frame = this.loopStart;
  }
}

export class SpriteAnimationLazyLoadSheet extends Data {
  static data = {
    id: Types.Ref(""),
    playOnLoad: Types.Ref(true),
    fixSpriteAspectOnLoad: Types.Ref(true),
  };
}

// Audio trigger tags
export class JournalOpen extends Tag {}
export class PauseOpen extends Tag {}
export class ButtonHover extends Tag {}
export class ButtonClick extends Tag {}

export class GameStarted extends Tag {}
export class SpriteAnimationOriginTreeTag extends Tag {}

export class CameraFocusOnTarget extends Data {
  static data = {
    target: Types.Vector3(),
  };
}

export class GlowingHaikuCard extends Data {
  static data = {
    angle: Types.Ref(0),
    radius: Types.Ref(1),
    y: Types.Ref(0),
    speed: Types.Ref(1),
    driftPhase: Types.Ref(0),
    driftAmplitude: Types.Ref(1),
    driftFrequency: Types.Ref(1),
    time: Types.Ref(0),
    opacity: Types.Ref(1),
    rgbOpaque: Types.Color(),
    rgbTransparent: Types.Color(),
  };
}

export class FloatingToken extends Data {
  static data = {
    type: Types.Ref(""),
    map: Types.Ref(null),
    velocity2D: Types.Vector2(0, 0),
    position2D: Types.Vector2(0, 0),
    offset3D: Types.Vector3(0, 0, 0),
    offsetHeight: Types.Ref(2),
    offsetY: Types.Ref(0),
    animateToTreeTime: Types.Ref(0),
    animateToTreeDelay: Types.Ref(0),
    animateToTreeDuration: Types.Ref(2),
    rotationSpeed: Types.Ref(1),
    rotationAngleOffset: Types.Ref(1),
    rotationAxis: Types.Vector3(0, 0, 0),
    scale: Types.Ref(1),
    time: Types.Ref(0),
    started: Types.Ref(false),
    speed: Types.Ref(1),
  };
}

export class FloatingTokenTargetUser extends Tag {}
export class FloatingTokenShouldTargetTree extends Tag {}

export class GLTFSpawnItemsMap extends Value {}
export class UserCarryingTokenCollectionFeature extends Tag {}
export class WaterFollowParticle extends Tag {}

export class HatTipPoint extends Value {
  static value = Types.Vector3(0, 0, 0);
}

export class HatTipWindLineTag extends Tag {}
export class HatTipWindLineSound extends Value {
  static value = Types.Ref("");
}
export class MoveUserToOrigin extends Tag {}

export class OriginTreeIntroSequence extends Tag {}
export class OriginTreeIntroSequenceStarted extends Tag {}
export class GameLandingCameraDrift extends Data {
  static data = {
    fixed: Types.Ref(null),
  };
}
export class CameraZoomOut extends Tag {}
export class LetterboxBars extends Tag {}

export class ScreenFade extends Data {
  static data = {
    from: Types.Ref(0),
    to: Types.Ref(1),
    duration: Types.Ref(1),
    delay: Types.Ref(0),
    ease: Types.Ref("sineIn"),
    callbackOnStart: Types.Ref(null),
    callbackOnFinish: Types.Ref(null),
  };
}

export class TextHint extends Data {
  static data = {
    text: Types.Ref(""),
    delay: Types.Ref(0),
    position: Types.Vector3(0, 0, 0),
    fontSize: Types.Ref(32),
    time: Types.Ref(0),
    duration: Types.Ref(2),
    killing: Types.Ref(false),
  };
}

export class KillTextHint extends Tag {}

export class HaikuCardShown extends Tag {}
export class HaikuCardSaved extends Tag {}
export class BlockUserMove extends Tag {}

export class HideCharacter extends Tag {}
export class HideHUD extends Tag {}
export class TutorialState extends Tag {}
export class TutorialTextHint extends Tag {}
export class TutorialBarrenGround extends Tag {}
export class UserForceApplied extends Tag {}
export class BlockTokenCollection extends Tag {}
export class CanSetIntroTags extends Tag {}
export class ObjectiveText extends Data {
  static data = {
    text: Types.Ref(""),
    delay: Types.Ref(0),
  };
}

export class HintOrb extends Data {
  static data = {
    origin: Types.Vector3(),
    scale: Types.Ref(1),
    time: Types.Ref(0),
    triggered: Types.Ref(false),
    trigger: Types.Ref(null),
    scaleFactor: Types.Ref(1),
    line: Types.Ref(null),
  };
}

export class WindLine extends Data {
  static data = {
    time: Types.Ref(0),
    animateDuration: Types.Ref(0.25),
    duration: Types.Ref(4),
  };
}

export class RainDrop extends Data {
  static data = {
    splat: Types.Ref(false),
    time: Types.Ref(0),
    speed: Types.Ref(5),
    animateDuration: Types.Ref(0.25),
    splatterSpawnPosition: Types.Vector3(0, 0, 0),
  };
}

export class RainDropSplatter extends Data {
  static data = {
    time: Types.Ref(0),
    animateDuration: Types.Ref(0.25),
    duration: Types.Ref(1),
  };
}

export class Raining extends Tag {}
export class LastWalkedLake extends Tag {}

export class AnimalSpawn extends Data {
  static data = {
    biome: Types.Ref(""),
    animal: Types.Ref(""),
    position: Types.Vector3(0, 0, 0),
    lake: Types.Ref(false),
    // these are auto-killed after 1 second or so
    // assumes systems will spawn new entities
    time: Types.Ref(0),
    duration: Types.Ref(1),
  };
}

export class Animal extends Tag {}
export class AnimateInCharacter extends Tag {}
export class AnimateOutCharacter extends Tag {}
export class TokenForCompass extends Data {
  static data = {
    distanceSq: Types.Ref(0),
  };
}

export class FloatingEndLine extends Data {
  static data = {
    time: Types.Ref(0),
    speed: Types.Ref(0.5),
    animateDuration: Types.Ref(0.25),
    duration: Types.Ref(1),
    delay: Types.Ref(0),
  };
}

export class TutorialMessage extends Data {
  static data = {
    id: Types.Ref(""),
    iconMode: Types.Ref(false),
    token: Types.Ref(""),
    message: Types.Ref(""),
    duration: Types.Ref(4),
    time: Types.Ref(0),
    delay: Types.Ref(0),
  };
}

export class GameFinished extends Tag {}

export class FoxSpriteTag extends Tag {}
export class FoxPurring extends Tag {}
export class FoxHm extends Tag {}

export class WaterFishPlaceholderTag extends Tag {}
export class UserHasHit extends Tag {}

export class CompassVisible extends Data {
  static data = {
    position: Types.Vector3(0, 0, 0),
  };
}

export class Snowflake extends Data {
  static data = {
    position: Types.Vector3(0, 0, 0),
    velocity: Types.Vector3(0, 0, 0),
    size: Types.Ref(0.1),
    time: Types.Ref(0),
    duration: Types.Ref(5),
    animateDuration: Types.Ref(0.2),
    delay: Types.Ref(0),
  };
}

export class ResetToCameraDrift extends Tag {}

export class TokenIsCollecting extends Tag {}
export class TriggerTokenLine extends Tag {}

export class TokenChildren extends Data {
  static data = {
    complete: Types.Ref(false),
    line: Types.Ref(null),
    radius: Types.Ref(null),
    center: Types.Ref(null),
    markers: Types.Array([]),
    group: Types.Ref(null),
    removing: Types.Ref(false),
    removeTime: Types.Ref(0),
    removeDelay: Types.Ref(1),
    killing: Types.Ref(false),
    stanza: Types.Ref(null),
    type: Types.Ref(""),
    shadow: Types.Ref(null),
    x: Types.Ref(0),
    z: Types.Ref(0),
    stanzaIndex: Types.Ref(0),
  };
}

export class CollectTokenOrb extends Tag {}

export class GIFRecord extends Data {
  static data = {
    encoder: Types.Ref(null),
    frame: Types.Ref(0),
    started: Types.Ref(false),
    duration: Types.Ref(5),
    width: Types.Ref(512),
    height: Types.Ref(512),
    maxColors: Types.Ref(256),
    format: Types.Ref("rgb565"),
  };
}

export class ClearInputPress extends Tag {}

export class AnimalSound extends Value {
  static value = Types.Ref("");
}

export class FlashSound extends Value {
  static value = Types.Ref("");
}

export class CapeMagicalEffect extends Tag {}
export class AutoRemoveCapeMagicalEffect extends Data {
  static data = {
    elapsed: Types.Ref(0),
    delay: Types.Ref(2),
  };
}

export class ParticleEmit extends Data {
  static data = {
    position: Types.Vector3(0, 0, 0),
    elapsed: Types.Ref(0),
    duration: Types.Ref(1),
  };
}

export class MusicalOrb extends Data {
  static data = {
    elapsed: Types.Ref(0),
    duration: Types.Ref(4),
    killing: Types.Ref(false),
    hit: Types.Ref(false),
  };
}

export class OutroFinished extends Tag {}
export class TriggerTreeTransitionAudio extends Tag {}
